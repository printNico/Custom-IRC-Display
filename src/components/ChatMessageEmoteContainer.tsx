import styled from "styled-components";
import {Emote} from "../lib/twitch-emotes/types/emote";

const ChatMessageEmoteDiv = styled.div`
  display: inline;
  margin-inline: .25rem;
`

const Image = styled.img`
  margin: -0.5rem 0
`

type ChatMessageEmoteContainerProps = {
    className?: string,
    emote: Emote
}

const ChatMessageEmoteContainer = ({className, emote}: ChatMessageEmoteContainerProps) => {
    return (
        <ChatMessageEmoteDiv className={className}>
            <Image
                src={emote.urls["1x"]}
                srcSet={`${emote.urls["1x"]} 1x, ${emote.urls["2x"]} 2x, ${emote.urls["4x"]} 4x`}
                alt={emote.code}
            />
        </ChatMessageEmoteDiv>
    )
}

export default ChatMessageEmoteContainer;
