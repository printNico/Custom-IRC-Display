import {readableColor} from "polished";
import {useEffect, useState} from "react";
import styled, {css} from "styled-components";
import ChatMessageType from "../lib/twitch-irc/chatMessageType";

const IdentityContainer = styled.div<{$color: string}>`
  position: absolute;
  top: -.75rem;

  background-color: ${({$color}) => $color};
  
  font-weight: bold;
  font-size: 1rem;
  color: ${({$color}) => readableColor($color)};
  
  padding-block: .25rem;
  padding-inline: .5rem;
`

const ContentContainer = styled.div`
  background-color: white;
  
  border-radius: 25px;

  font-size: 1.25rem;
  font-weight: 600;
  
  padding: 1rem;
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

const ChatMessageContainer = styled.div<{$align: "start" | "end"}>`
  position: relative;
  display: inline-block;

  font-family: Arial, Helvetica, sans-serif;

  ${({$align}) => $align === "start" ? AlignMessageContentStart : AlignMessageContentEnd}
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
                $color={message.color ?? 'black'
            }>
                {message.displayName ?? message.userLogin}
            </IdentityContainer>
            <ContentContainer>
                {message.text}
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