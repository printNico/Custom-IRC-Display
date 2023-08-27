import {readableColor} from "polished";
import {useEffect, useState} from "react";
import styled, {css} from "styled-components";
import ChatMessageType from "../lib/twitch-irc/chatMessageType";
import ChatMessageBadges from "./ChatMessageBadges";
import ChatMessageText from "./ChatMessageText";

const IdentityContainer = styled.div<{ $color: string }>`
  position: absolute;
  top: -1em;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  background-color: ${({$color}) => $color};

  font-weight: bold;
  font-size: 1.25rem;
  color: ${({$color}) => readableColor($color)};

  border-width: 1px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.2);

  padding-block: .4rem;
  padding-inline: 1rem;
`

const ContentContainer = styled.div`
  background-color: rgba(240, 240, 240, 1);

  border-radius: 25px;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.2);

  font-size: 1.5rem;
  font-weight: 500;

  line-height: 2rem;

  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  padding-inline: 1rem;
`

const AlignMessageContentStart = css`
  align-self: flex-start;

  ${IdentityContainer} {
    border-radius: 3px 10px 3px 10px;
    left: 0;
  }

  ${ContentContainer} {
    margin-left: 1rem;
  }
`

const AlignMessageContentEnd = css`
  align-self: flex-end;

  ${IdentityContainer} {
    border-radius: 10px 3px 10px 3px;
    right: 0;
  }

  ${ContentContainer} {
    margin-right: 1rem;
  }
`

const ChatMessageContainer = styled.div<{ $align: "start" | "end" }>`
  position: relative;
  display: inline-block;

  font-family: Arial, Helvetica, sans-serif;

  ${({$align}) => $align === "start" ? AlignMessageContentStart : AlignMessageContentEnd}
  
  max-width: 80%;
  min-width: 30%;
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
            <ContentContainer>
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