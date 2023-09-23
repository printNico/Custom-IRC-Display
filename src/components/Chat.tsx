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
  gap: 2.75rem;

  padding-block: 1.75rem;
  padding-inline: .25rem;

  overflow: hidden;

  max-width: 100vw;
  max-height: 90vh;
`

const Chat = () => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [messages, pushMessage, _, clearChatMessages, removeMsgByFilter] = useLimitedArray<ChatMessageType>([], 20);

    const {client} = useTwitchIRCClientContext();
    const conStateSubscription = useRef<Subscription | undefined>();
    const chatMsgSubscription = useRef<Subscription | undefined>();
    const clearChatSubscription = useRef<Subscription | undefined>();
    const chatClearUserMsgSubscription = useRef<Subscription | undefined>();
    const chatClearMsgSubscription = useRef<Subscription | undefined>();

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

            clearChatSubscription.current = client.OnChatClear
                .subscribe(() => {
                    clearChatMessages();
                })

            chatClearUserMsgSubscription.current = client.OnChatUserClearMessages
                .subscribe((message) => {
                    console.log(message)
                    removeMsgByFilter((msg) => msg.userId === message.targetUserId)
                })

            chatClearMsgSubscription.current = client.OnChatClearMessage
                .subscribe((message) => {
                    console.log(message)
                    removeMsgByFilter((msg) => msg.id === message.targetMessageId)
                })
        }

        return () => {
            if (conStateSubscription.current) {
                conStateSubscription.current!.unsubscribe()
            }

            if (chatMsgSubscription.current) {
                chatMsgSubscription.current!.unsubscribe()
            }

            if (clearChatSubscription.current) {
                clearChatSubscription.current!.unsubscribe()
            }

            if (chatClearUserMsgSubscription.current) {
                chatClearUserMsgSubscription.current!.unsubscribe()
            }

            if (chatClearMsgSubscription.current) {
                chatClearMsgSubscription.current!.unsubscribe()
            }
        }
    }, [client]);

    useEffect(() => {
        if (!chatContainerRef.current) return;

        const scrollTo = chatContainerRef.current!.scrollHeight;
        setTimeout(() => {
            if (!chatContainerRef.current) return;
            chatContainerRef.current.scrollTo({top: scrollTo, behavior: 'smooth'})
        }, 100);
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

type LimitedArrayHook<V> = [values: V[], push: (value: V) => void, unshift: (value: V) => void, clear: () => void, removeByFilter: (filterFunc: (value: V) => boolean) => void]

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

    const clear = () => {
        setValues([])
    }

    const removeByFilter = (filterFunc: (value: V) => boolean) => {
        setValues(old => {
            return old.filter((value) => !filterFunc(value))
        })
    }

    return [
        values,
        push,
        unshift,
        clear,
        removeByFilter
    ]
}


export default Chat;
