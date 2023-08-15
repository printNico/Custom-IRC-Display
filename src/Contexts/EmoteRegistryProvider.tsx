import {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";
import EmotesRegistry from "../lib/twitch-emotes/emotesRegistry";

export type EmoteRegistryContextType = {
    registry: EmotesRegistry | undefined
}

export const EmoteRegistryContext = createContext<EmoteRegistryContextType>({registry: undefined})

export const useEmoteRegistryContext = () => useContext(EmoteRegistryContext);

export const useEmoteRegistry = () => {
    const {registry} = useEmoteRegistryContext();
    return registry;
}

const useCreateEmoteRegistry = () => {
    const emoteRegistryRef = useRef<EmotesRegistry | undefined>();
    const [emoteRegistry, setEmoteRegistry] = useState<EmotesRegistry | undefined>(emoteRegistryRef.current);

    useEffect(() => {
        if (!emoteRegistryRef.current) {
            emoteRegistryRef.current = new EmotesRegistry();
            setEmoteRegistry(emoteRegistryRef.current);
        }
    }, []);

    return emoteRegistry;
}

type EmoteRegistryProviderProps = {
    children: ReactNode
}

const EmoteRegistryProvider = (props: EmoteRegistryProviderProps) => {
    const emoteRegistry = useCreateEmoteRegistry();

    return (
        <>
            <EmoteRegistryContext.Provider value={{registry: emoteRegistry}}>
                {props.children}
            </EmoteRegistryContext.Provider>
        </>
    );
};

export default EmoteRegistryProvider;