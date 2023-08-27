import {useEffect, useState} from "react";
import styled from "styled-components";
import {BadgeInfoVersion, getBadgeByCode, getBadgeVersion} from "../lib/twitch-badges/globalBadges";
import ChatMessageType from "../lib/twitch-irc/chatMessageType";

type BadgeType = {
    imageUrl: string
}

const ChatMessageBadgesContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`

type ChatMessageBadgesProps = {
    className?: string
    message: ChatMessageType
}

const ChatMessageBadges = ({className, message}: ChatMessageBadgesProps) => {
    const [badges, setBadges] = useState<BadgeInfoVersion[]>([]);

    useEffect(() => {
        const badgesOfMessage = message.badges;
        if (!badgesOfMessage?.length) return;
        setBadges([])

        for (const badge of badgesOfMessage) {
            const badgeInfo = getBadgeByCode(badge.badgeId);
            if (!badgeInfo) continue;

            const badgeInfoVersion = getBadgeVersion(badgeInfo, badge.version);
            if (!badgeInfoVersion) continue;

            setBadges(prevState => [...prevState, badgeInfoVersion]);
        }
    }, [message]);

    return (
        <>
            <ChatMessageBadgesContainer className={className}>
                {badges.map((badge, index) =>
                    <Badge
                        key={index}
                        badge={badge}
                    />
                )}
            </ChatMessageBadgesContainer>
        </>
    );
};

const Image = styled.img`
  height: 1em;
  width: 1em;
  
  margin-right: .25em;
`

type BadgeProps = {
    className?: string
    badge: BadgeInfoVersion
}

const Badge = ({className, badge}: BadgeProps) => {
    return (
        <Image
            className={className}
            src={badge.image_url_1x}
            srcSet={`${badge.image_url_1x} 1x, ${badge.image_url_2x} 2x, ${badge.image_url_4x} 4x`}
        />
    )
}

export default ChatMessageBadges;