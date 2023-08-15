import {ReactNode, useEffect, useState} from "react";
import styled from "styled-components";
import {useEmoteRegistry} from "../Contexts/EmoteRegistryProvider";
import ChatMessageEmoteContainer from "./ChatMessageEmoteContainer";

const ChatMessageSpan = styled.span`
  word-wrap: break-word
`

type ChatMessageTextProps = {
    className?: string
    text: string
}

const ChatMessageText = ({className, text}: ChatMessageTextProps) => {
    const emoteRegistry = useEmoteRegistry();
    const [messageParts, setMessageParts] = useState<ReactNode[]>([]);

    useEffect(() => {
        const parts: (string | ReactNode)[] = text.split(' ').map(part => part + " ");
        setMessageParts(parts);

        if (emoteRegistry) {
            for (const [index, part] of parts.entries()) {
                if (typeof part !== "string") continue;

                const cleanedPart = part.trim();
                const emote = emoteRegistry.getEmoteByCode(cleanedPart)
                if (emote) {
                    console.log("Found emote", emote.code)
                    parts[index] = <ChatMessageEmoteContainer key={index} emote={emote}/>
                }
            }

            setMessageParts(parts)
        }
    }, [emoteRegistry, text]);

    return (
        <ChatMessageSpan className={className}>
            {messageParts.map((messagePart) => messagePart)}
        </ChatMessageSpan>
    );
};

export default ChatMessageText;