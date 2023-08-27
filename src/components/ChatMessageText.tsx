import {ReactNode, useEffect, useState} from "react";
import styled from "styled-components";
import {useEmoteRegistry} from "../Contexts/EmoteRegistryProvider";
import {Emote} from "../lib/twitch-emotes/types/emote";
import ChatMessageType from "../lib/twitch-irc/chatMessageType";
import ChatMessageEmoteContainer from "./ChatMessageEmoteContainer";

const ChatMessageSpan = styled.span`
  word-wrap: break-word
`

type ChatMessageTextProps = {
    className?: string
    message: ChatMessageType
}

const ChatMessageText = ({className, message}: ChatMessageTextProps) => {
    const emoteRegistry = useEmoteRegistry();
    const [messageParts, setMessageParts] = useState<ReactNode[]>([]);

    useEffect(() => {
        const parsedTwitchNativeEmotes: Map<string, Emote> = new Map();
        const messageText = message.text;
        if (!messageText) return;

        const parseTwitchEmotes = () => {
            const emotes = message.emotes;
            if (!emotes?.length) return;

            for (const rawEmote of emotes) {
                const emoteCode = messageText.slice(rawEmote.startIndex, rawEmote.endIndex + 1)
                const emote: Emote = {
                    id: rawEmote.emoteId,
                    code: emoteCode,
                    urls: {
                        "1x": `https://static-cdn.jtvnw.net/emoticons/v2/${rawEmote.emoteId}/default/dark/1.0`,
                        "2x": `https://static-cdn.jtvnw.net/emoticons/v2/${rawEmote.emoteId}/default/dark/2.0`,
                        "4x": `https://static-cdn.jtvnw.net/emoticons/v2/${rawEmote.emoteId}/default/dark/3.0`,
                    },
                    animated: false,
                    imageType: "png",
                }
                parsedTwitchNativeEmotes.set(emoteCode, emote);
            }
        }

        const getTwitchEmote = (code: string) => {
            const emote = parsedTwitchNativeEmotes.get(code);
            return emote ? emote : null;
        }

        const parts: (string | ReactNode)[] = messageText.split(' ').map(part => part + " ");
        parseTwitchEmotes();
        setMessageParts(parts);

        if (emoteRegistry) {
            for (const [index, part] of parts.entries()) {
                if (typeof part !== "string") continue;
                const cleanedPart = part.trim();

                let emote: Emote | null = null;
                // Try and find emotes from Twitch Native Emotes
                emote = getTwitchEmote(cleanedPart);

                // Try and find emotes from Emote Providers other than Twitch
                if (!emote) {
                    emote = emoteRegistry.getEmoteByCode(cleanedPart)
                }

                if (emote) {
                    parts[index] = <ChatMessageEmoteContainer key={index} emote={emote}/>
                }
            }

            setMessageParts(parts)
        }
    }, [emoteRegistry, message]);

    return (
        <ChatMessageSpan className={className}>
            {messageParts.map((messagePart) => messagePart)}
        </ChatMessageSpan>
    );
};

export default ChatMessageText;