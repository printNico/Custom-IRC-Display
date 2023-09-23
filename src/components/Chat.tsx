import {useEffect, useRef, useState} from "react";
import {filter, Subscription} from "rxjs";
import styled from "styled-components";
import {useTwitchIRCClientContext} from "../Contexts/TwitchIRCClientProvider";
import ChatMessageType from "../lib/twitch-irc/chatMessageType";
import TwitchIRC from "../lib/twitch-irc/types/twitchIRC";
import ChatMessage from "./ChatMessage";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  
  padding-block: 1rem;

  overflow: hidden;
  
  max-width: 100vw;
  max-height: 90vh;
`

const Chat = () => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const {client} = useTwitchIRCClientContext();
    const conStateSubscription = useRef<Subscription | undefined>();
    const chatMsgSubscription = useRef<Subscription | undefined>();

    const [messages, pushMessage, unshiftMessage] = useLimitedArray<ChatMessageType>([], 20);

    useEffect(() => {
        if (client) {
            conStateSubscription.current = client.OnConnectionState
                .pipe(filter(x => x === TwitchIRC.ConnectionState.Connected))
                .subscribe(() => {
                    client.join(['printnico'])
                });

            chatMsgSubscription.current = client.OnChatMessage
                .subscribe((message) => {
                    pushMessage(message)
                })
        }

        return () => {
            if (conStateSubscription.current) {
                conStateSubscription.current!.unsubscribe()
            }

            if (chatMsgSubscription.current) {
                chatMsgSubscription.current!.unsubscribe()
            }
        }
    }, [client]);

    useEffect(() => {
        if(!chatContainerRef.current) return;
        setTimeout(() => {chatContainerRef.current!.scrollTo({top: chatContainerRef.current!.scrollHeight, behavior: 'smooth'})}, 250);
    }, [messages]);

    return (
        <ChatContainer
            ref={chatContainerRef}
        >
            {messages.map((msg) =>
                <ChatMessage message={msg} key={msg.id}/>
            )}
        </ChatContainer>
    );
};

type LimitedArrayHook<V> = [values: V[], push: (value: V) => void, unshift: (value: V) => void]

const useLimitedArray = <V, >(initialState: V[] = [], limit: number = 100): LimitedArrayHook<V> => {
    const [values, setValues] = useState<V[]>(initialState);

    const push = (value: V) => {
        setValues(old => {
            if (old.length >= limit) {
                old.shift();
            }

            return [...old, value];
        })
    }

    const unshift = (value: V) => {
        setValues(old => {
            if (old.length >= limit) {
                old.pop();
            }

            return [value, ...old];
        })
    }

    return [
        values,
        push,
        unshift
    ]
}


export default Chat;
