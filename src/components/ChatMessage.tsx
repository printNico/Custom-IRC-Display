import {readableColor} from "polished";
import {useEffect, useRef, useState} from "react";
import styled, {css} from "styled-components";
import ChatMessageType from "../lib/twitch-irc/chatMessageType";
import ChatMessageBadges from "./ChatMessageBadges";
import ChatMessageText from "./ChatMessageText";

const IdentityContainer = styled.div<{ $color: string }>`
  max-width: 80%;
  
  position: absolute;
  top: -1em;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  background-color: ${({$color}) => $color};

  font-weight: 700;
  font-size: 1.5rem;
  color: ${({$color}) => readableColor($color)};

  border-width: 1px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.2);

  padding-block: .4rem;
  padding-inline: 1rem;
`

const ContentContainer = styled.div<{$color: string}>`
  border-radius: 20px;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.2);

  background-color: ${({$color}) => $color};
  
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({$color}) => readableColor($color)};

  line-height: 2rem;

  padding-top: 1.5rem;
  padding-bottom: .75rem;
  padding-inline: 1.25rem;
`

const AlignMessageContentStart = css`
  align-self: flex-start;

  ${IdentityContainer} {
    border-radius: 3px 20px 3px 20px;
    box-shadow: 3px 3px 6px 0 rgba(0, 0, 0, 0.5);
    left: 0;
  }

  ${ContentContainer} {
    margin-left: 1rem;
    box-shadow: 4px 4px 8px 1px rgba(0, 0, 0, 0.3);
  }
`

const AlignMessageContentEnd = css`
  align-self: flex-end;

  ${IdentityContainer} {
    border-radius: 20px 3px 20px 3px;
    box-shadow: -3px 3px 6px 0 rgba(0, 0, 0, 0.5);
    right: 0;
  }

  ${ContentContainer} {
    margin-right: 1rem;
    box-shadow: -4px 4px 8px 1px rgba(0, 0, 0, 0.3);
  }
`

const ChatMessageContainer = styled.div<{ $align: "start" | "end" }>`
  position: relative;
  display: inline-block;

  font-family: 'Quicksand', sans-serif;

  ${({$align}) => $align === "start" ? AlignMessageContentStart : AlignMessageContentEnd}
  
  max-width: 80%;
  min-width: 45%;
`

type ChatMessageProps = {
    className?: string
    message: ChatMessageType
}

const ChatMessage = ({message, className}: ChatMessageProps) => {
    const [messageAlignment, setMessageAlignment] = useState<"start" | "end">("start");

    useEffect(() => {
        const hash = hashOfString(message.id)
        setMessageAlignment(Math.abs(hash % 2) === 0 ? "start" : "end")
    }, []);

    return (
        <ChatMessageContainer
            className={className}
            $align={messageAlignment}
        >
            <IdentityContainer
                $color={message.color ?? 'black'}
            >
                <ChatMessageBadges message={message}/>
                {message.displayName ?? message.userLogin}
            </IdentityContainer>
            <ContentContainer
                $color="white"
            >
                <ChatMessageText
                    message={message}
                />
            </ContentContainer>
        </ChatMessageContainer>
    );
};

const hashOfString = (value: string) => {
    let arr = value.split('');
    return arr.reduce(
        (hashCode, currentVal) =>
            (hashCode =
                currentVal.charCodeAt(0) +
                (hashCode << 6) +
                (hashCode << 16) -
                hashCode),
        0
    );
};

export default ChatMessage;