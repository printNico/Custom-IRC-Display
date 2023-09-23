import {TwitchIRCResponse} from "./client/ircResponse";

export const convertToClearChatMessage = (event: TwitchIRCResponse): ClearChatMessageType => {
    let result = {} as ClearChatMessageType;

    const cleanedMessage = event.message.replace('\r\n', '')
    const splitMessage = cleanedMessage.split(' ')

    const tagsResults = readClearChatMessageTags(splitMessage[0]);
    result = Object.assign(result, tagsResults);

    return result;
}

const readClearChatMessageTags = (messagePart: string): ClearChatMessageType | undefined => {
    let result: ClearChatMessageType | undefined = undefined;
    if (!messagePart.startsWith('@')) {
        console.warn("Message part does not start with '@' and cannot be parsed as tags")
        return undefined;
    }

    const tags = messagePart.split(';');
    result = {} as ClearChatMessageType

    for (const tag of tags) {
        const keyValue = tag.split('=');
        const tagName = keyValue[0] ?? null;
        const tagValue = keyValue[1] ?? null;

        if (!tagName || !tagValue) continue;

        switch (tagName) {
            case "tmi-sent-ts":
                result.sentAt = new Date(parseInt(tagValue));
                continue;
            case "target-msg-id":
                result.targetMessageId = tagValue;
                continue;
            case "target-user-id":
                result.targetUserId = tagValue;
                continue;
            case "room-id":
                result.roomId = tagValue;
                continue;
            case "ban-duration":
                result.banDuration = parseInt(tagValue);
                continue;
            case "login":
                result.loginName = tagValue;
        }
    }

    return result;
}

interface ClearChatMessageType {
    roomId: string,
    targetUserId: string | undefined,
    targetMessageId: string | undefined,
    banDuration: number | undefined,
    loginName: string | undefined,
    sentAt: Date,
}

export default ClearChatMessageType;