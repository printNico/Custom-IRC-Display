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

  gap: 2rem;
  padding-block: 1.5rem;

  overflow: hidden;
`

const Chat = () => {
    const {client} = useTwitchIRCClientContext();
    const conStateSubscription = useRef<Subscription | undefined>();
    const chatMsgSubscription = useRef<Subscription | undefined>();

    const [messages, pushMessage, unshiftMessage] = useLimitedArray<ChatMessageType>([], 10);

    // const messages: ChatMessageType[] = [
    //     {
    //         "color": "#8A2BE2",
    //         "displayName": "crazyclarabr",
    //         "id": "44a61799-5e90-4b82-94f3-aabcd6cf7408",
    //         "mod": false,
    //         "roomId": "51929371",
    //         "subscriber": true,
    //         "sentAt": new Date("2023-08-07T16:10:07.360Z"),
    //         "turbo": false,
    //         "userId": "869974666",
    //         "userLogin": "crazyclarabr",
    //         "channelName": "ml7support",
    //         "text": "btw, Bogur's hair is gorgeous"
    //     } as ChatMessageType,
    //     {
    //         "color": "#8A2BE2",
    //         "displayName": "Demmos",
    //         "id": "d075847a-aadf-4f87-979e-d4c4f92d305c",
    //         "mod": false,
    //         "replyChatMessage": {
    //             "parentDisplayName": "dannnyyb",
    //             "parentMessageText": "should ana be getting the most heals on the team or is not like a main healer, im new to support",
    //             "parentMessageId": "71d96af4-f89e-40c9-bc16-2f72adee3a9c",
    //             "parentUserId": "137559594",
    //             "parentUserLogin": "dannnyyb"
    //         },
    //         "roomId": "51929371",
    //         "subscriber": true,
    //         "sentAt": new Date("2023-08-07T16:10:06.151Z"),
    //         "turbo": false,
    //         "userId": "56438961",
    //         "userLogin": "demmos",
    //         "channelName": "ml7support",
    //         "text": "@dannnyyb SAYHEALERONEMORETIME"
    //     } as ChatMessageType,
    //     {
    //         "color": "#00B4CC",
    //         "displayName": "dannnyyb",
    //         "id": "71d96af4-f89e-40c9-bc16-2f72adee3a9c",
    //         "mod": false,
    //         "roomId": "51929371",
    //         "subscriber": false,
    //         "sentAt":new Date("2023-08-07T16:09:59.975Z"),
    //         "turbo": false,
    //         "userId": "137559594",
    //         "userLogin": "dannnyyb",
    //         "channelName": "ml7support",
    //         "text": "should ana be getting the most heals on the team or is not like a main healer, im new to support"
    //     } as ChatMessageType,
    //     {
    //         "color": "#FF9900",
    //         "displayName": "thelastbyron",
    //         "id": "d421b39e-fa8e-47c5-97a1-c65f471bcc65",
    //         "mod": false,
    //         "roomId": "51929371",
    //         "subscriber": false,
    //         "sentAt": new Date("2023-08-07T16:09:56.486Z"),
    //         "turbo": false,
    //         "userId": "99127424",
    //         "userLogin": "thelastbyron",
    //         "channelName": "ml7support",
    //         "text": "New support abilities are out?"
    //     } as ChatMessageType,
    //     {
    //         "color": "#FF0000",
    //         "displayName": "CosmicScorpi0",
    //         "id": "19f620f1-4c64-4a25-9b1a-b2b09d557dee",
    //         "mod": false,
    //         "roomId": "51929371",
    //         "subscriber": false,
    //         "sentAt": new Date("2023-08-07T16:09:55.903Z"),
    //         "turbo": false,
    //         "userId": "206991404",
    //         "userLogin": "cosmicscorpi0",
    //         "channelName": "ml7support",
    //         "text": "omg my favorite duo is here"
    //     } as ChatMessageType,
    //     {
    //         "color": "#B691DA",
    //         "displayName": "n3rdygn0m3",
    //         "id": "a7d1885b-9272-4ba0-975a-404ee0c12232",
    //         "mod": false,
    //         "roomId": "51929371",
    //         "subscriber": true,
    //         "sentAt": new Date("2023-08-07T16:09:53.213Z"),
    //         "turbo": false,
    //         "userId": "552911111",
    //         "userLogin": "n3rdygn0m3",
    //         "channelName": "ml7support",
    //         "text": "Feels good to have everyone fight over your ult... but then that's all anyone cares about ml7Cry"
    //     } as ChatMessageType,
    //     {
    //         "color": "#FF7F50",
    //         "displayName": "popcorn_246",
    //         "id": "06b80a5e-4fce-4a0e-8a82-1ff18e9e119b",
    //         "mod": false,
    //         "roomId": "51929371",
    //         "subscriber": false,
    //         "sentAt": new Date("2023-08-07T16:09:51.460Z"),
    //         "turbo": false,
    //         "userId": "725671837",
    //         "userLogin": "popcorn_246",
    //         "channelName": "ml7support",
    //         "text": "@jrockcity78 I'm dc in comp and i can't reconnect BibleThump"
    //     } as ChatMessageType,
    //     {
    //         "color": "#E85927",
    //         "displayName": "killerkuerbis",
    //         "id": "f2c6e955-c52c-4628-955e-23a2146f9179",
    //         "mod": false,
    //         "roomId": "51929371",
    //         "subscriber": true,
    //         "sentAt": new Date("2023-08-07T16:09:50.115Z"),
    //         "turbo": false,
    //         "userId": "79979360",
    //         "userLogin": "killerkuerbis",
    //         "channelName": "ml7support",
    //         "text": "prbgvxx8zvyb37gaq8fkcodwx dw, I'm older"
    //     } as ChatMessageType,
    //     {
    //         "color": "#E85927",
    //         "displayName": "killerkuerbis",
    //         "id": "1ca5f083-3427-4490-a986-34fb04d74a8a",
    //         "mod": false,
    //         "roomId": "51929371",
    //         "subscriber": true,
    //         "sentAt": new Date("2023-08-07T16:09:44.169Z"),
    //         "turbo": false,
    //         "userId": "79979360",
    //         "userLogin": "killerkuerbis",
    //         "channelName": "ml7support",
    //         "text": "what was that conversation"
    //     } as ChatMessageType,
    //     {
    //         "color": "#8A2BE2",
    //         "displayName": "Demmos",
    //         "id": "59c67de5-5e94-4e9a-8dec-8df31d209491",
    //         "mod": false,
    //         "roomId": "51929371",
    //         "subscriber": true,
    //         "sentAt": new Date("2023-08-07T16:09:42.465Z"),
    //         "turbo": false,
    //         "userId": "56438961",
    //         "userLogin": "demmos",
    //         "channelName": "ml7support",
    //         "text": "modCheck music"
    //     } as ChatMessageType
    // ]

    useEffect(() => {
        if (client) {
            conStateSubscription.current = client.OnConnectionState
                .pipe(filter(x => x === TwitchIRC.ConnectionState.Connected))
                .subscribe(() => {
                    client.join(['printnico'])
                });

            chatMsgSubscription.current = client.OnChatMessage
                .subscribe((message) => {
                    unshiftMessage(message)
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

    return (
        <ChatContainer>
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
