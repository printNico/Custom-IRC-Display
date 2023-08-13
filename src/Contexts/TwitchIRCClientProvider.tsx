import {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";
import TwitchIRCClientBuilder from "../lib/twitch-irc/builder/twitchIRCClientBuilder";
import TwitchIRCClient from "../lib/twitch-irc/client/twitchIRCClient";
import TwitchIRC from "../lib/twitch-irc/types/twitchIRC";

export type TwitchIRCClientContextType = {
    client: TwitchIRCClient | undefined
}

export const TwitchIRCClientContext = createContext<TwitchIRCClientContextType>({client: undefined})

const useTwitchIRCClient = () => {
    const twitchClientRef = useRef<TwitchIRCClient| undefined>();
    const [twitchClient, setTwitchClient] = useState<TwitchIRCClient | undefined>(twitchClientRef.current);

    useEffect(() => {
        if (!twitchClientRef.current) {
            const client = new TwitchIRCClientBuilder()
                .useSSL(true)
                .build()

            if (client === undefined) throw new Error("Failed to build client.");
            if (client.ConnectionState === TwitchIRC.ConnectionState.Disconnected) {
                client.connect()
                    .then(() => {
                        console.log("Successfully connected to Twitch IRC Servers.")
                    })
                    .catch(() => console.log("Failed to connect to Twitch IRC Servers."));
            }

            twitchClientRef.current = client;
            setTwitchClient(twitchClientRef.current);
        }
    }, []);

    return twitchClient;
}

export const useTwitchIRCClientContext = () => useContext(TwitchIRCClientContext);

type TwitchIRCClientProviderProps = {
    children: ReactNode
}

const TwitchIRCClientProvider = (props: TwitchIRCClientProviderProps) => {
    const twitchClient = useTwitchIRCClient();

    return (
        <>
            <TwitchIRCClientContext.Provider value={{client: twitchClient}}>
                {props.children}
            </TwitchIRCClientContext.Provider>
        </>
    );
};

export default TwitchIRCClientProvider;