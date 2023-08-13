import {TwitchIRCResponse} from "./client/ircResponse";

export const convertToChatMessage = (event: TwitchIRCResponse): ChatMessageType => {
    let result = {} as ChatMessageType;

    const cleanedMessage = event.message.replace('\r\n', '')
    const messageParts = cleanedMessage.split(' ')
    const tags = messageParts[0]
    const userLogin = messageParts[1]
    const channelName = messageParts[3]
    const messageContent = messageParts.splice(4)

    const tagsResult = readMessageTags(tags)
    result = Object.assign(result, tagsResult);

    const userLoginResult = readMessageUserLogin(userLogin)
    result = Object.assign(result, userLoginResult);

    const channelNameResult = readMessageChannel(channelName)
    result = Object.assign(result, channelNameResult);

    const messageContentResult = readMessageContent(messageContent)
    result = Object.assign(result, messageContentResult);

    return result;
}

const readMessageTags = (messagePart: string): ChatMessageType | undefined => {
    let result: ChatMessageType | undefined = undefined;
    if (!messagePart.startsWith('@')) {
        console.warn("Message part does not start with '@' and cannot be parsed as tags")
        return undefined;
    }

    const tags = messagePart.split(';');
    result = {} as ChatMessageType

    for (const tag of tags) {
        const keyValue = tag.split('=');
        const tagName = keyValue[0] ?? null;
        const tagValue = keyValue[1] ?? null;

        if (!tagName || !tagValue) continue;

        switch (tagName) {
            case'badge-info':
                continue;
            case'badges':
                continue;
            case'bits':
                result.bits = parseInt(tagValue)
                continue;
            case'color':
                result.color = tagValue;
                continue;
            case'display-name':
                result.displayName = tagValue;
                continue;
            case'emotes':
                continue;
            case'id':
                result.id = tagValue;
                continue;
            case'mod':
                result.mod = tagValue === '1';
                continue;
            case 'pinned-chat-paid-amount':
                if (!result.pinnedPaidChatMessage) result.pinnedPaidChatMessage = {} as PinnedPaidChatMessage;
                result.pinnedPaidChatMessage.amount = parseInt(tagValue);
                continue;
            case 'pinned-chat-paid-currency':
                if (!result.pinnedPaidChatMessage) result.pinnedPaidChatMessage = {} as PinnedPaidChatMessage;
                result.pinnedPaidChatMessage.currency = tagValue;
                continue;
            case 'pinned-chat-paid-exponent':
                if (!result.pinnedPaidChatMessage) result.pinnedPaidChatMessage = {} as PinnedPaidChatMessage;
                result.pinnedPaidChatMessage.exponent = parseInt(tagValue);
                continue;
            case 'pinned-chat-paid-level':
                if (!result.pinnedPaidChatMessage) result.pinnedPaidChatMessage = {} as PinnedPaidChatMessage;
                result.pinnedPaidChatMessage.level = tagValue as "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE" | "SIX" | "SEVEN" | "EIGHT" | "NINE" | "TEN";
                continue;
            case 'pinned-chat-paid-is-system-message':
                if (!result.pinnedPaidChatMessage) result.pinnedPaidChatMessage = {} as PinnedPaidChatMessage;
                result.pinnedPaidChatMessage.isSystemMessage = tagValue === '1';
                continue;
            case 'reply-parent-msg-id':
                if (!result.replyChatMessage) result.replyChatMessage = {} as ReplyChatMessage;
                result.replyChatMessage.parentMessageId = tagValue;
                continue;
            case 'reply-parent-user-id':
                if (!result.replyChatMessage) result.replyChatMessage = {} as ReplyChatMessage;
                result.replyChatMessage.parentUserId = tagValue;
                continue;
            case 'reply-parent-user-login':
                if (!result.replyChatMessage) result.replyChatMessage = {} as ReplyChatMessage;
                result.replyChatMessage.parentUserLogin = tagValue;
                continue;
            case 'reply-parent-display-name':
                if (!result.replyChatMessage) result.replyChatMessage = {} as ReplyChatMessage;
                result.replyChatMessage.parentDisplayName = tagValue;
                continue;
            case 'reply-parent-msg-body':
                if (!result.replyChatMessage) result.replyChatMessage = {} as ReplyChatMessage;
                result.replyChatMessage.parentMessageText = tagValue.replaceAll('\\s', ' ');
                continue;
            case 'reply-thread-parent-msg-id':
                if (!result.replyChatMessage) result.replyChatMessage = {} as ReplyChatMessage;
                result.replyChatMessage.parentMessageId = tagValue;
                continue;
            case 'reply-thread-parent-user-login':
                if (!result.replyChatMessage) result.replyChatMessage = {} as ReplyChatMessage;
                result.replyChatMessage.parentUserLogin = tagValue;
                continue;
            case 'room-id':
                result.roomId = tagValue;
                continue;
            case 'subscriber':
                result.subscriber = tagValue === '1';
                continue;
            case 'tmi-sent-ts':
                result.sentAt = new Date(parseInt(tagValue));
                continue;
            case 'turbo':
                result.turbo = tagValue === '1';
                continue;
            case 'user-id':
                result.userId = tagValue;
                continue;
            case 'user-type':
                result.userType = tagValue as "" | "admin" | "global_mod" | "staff";
                continue;
            case 'vip':
                result.vip = tagValue === '1';
        }
    }

    return result;
}

const readMessageUserLogin = (messagePart: string): ChatMessageType => {
    const regex = /:([A-z,0-9]*)!([A-z,0-9]*)@([A-z,0-9]*)\./;

    let result: ChatMessageType = {} as ChatMessageType;
    if (!messagePart.startsWith(':')) {
        console.warn("Message part does not start with ':' and cannot be parsed as user login. Message: ", messagePart)
        return result;
    }

    const matches = messagePart.match(regex);
    if (!matches || !matches.length) {
        console.warn("Message part does not contain any valid user login names. Message: ", messagePart)
        return result;
    }

    const cleanedMatches = matches.splice(1, 4);
    for (const match of cleanedMatches) {
        if (match.length) {
            result.userLogin = match;
            continue;
        }
    }

    return result;
}

const readMessageChannel = (messagePart: string): ChatMessageType => {
    let result: ChatMessageType = {} as ChatMessageType;
    if (!messagePart.startsWith('#')) {
        console.warn("Message part does not start with '#' and cannot be parsed as channel name. Message: ", messagePart)
        return result;
    }

    const channelName = messagePart.substring(1);
    if (!channelName.length) {
        console.warn("Message part does not contain a valid channel name. Message: ", messagePart)
        return result;
    }

    result.channelName = channelName;
    return result;
}

const readMessageContent = (messageParts: string[]): ChatMessageType => {
    let result: ChatMessageType = {} as ChatMessageType;
    if ((messageParts.length < 1) || !messageParts[0].startsWith(':')) {
        console.warn("Message part does not start with ':' and cannot be parsed as message content. Message: ", messageParts[0])
        return result;
    }

    const firstContentPart = messageParts[0].substring(1);
    const messageContent = firstContentPart + " " + messageParts.splice(1).join(' ');
    if (!messageContent.length) {
        console.warn("Message part does not contain a valid message content. Message: ", messageContent)
        return result;
    }

    result.text = messageContent;
    return result;
}

interface ChatMessageType {
    id: string
    text: string
    sentAt: Date
    channelName: string
    roomId: string

    userId: string
    userLogin: string
    displayName: string | undefined
    color: string | undefined
    mod: boolean
    vip: boolean
    subscriber: boolean
    turbo: boolean
    userType: "" | "admin" | "global_mod" | "staff"

    bits: number | undefined
    badgeInfo: NameValuePair | undefined
    badges: NameValuePair[] | undefined
    emotes: Emote[] | undefined
    pinnedPaidChatMessage: PinnedPaidChatMessage | undefined
    replyChatMessage: ReplyChatMessage | undefined
}

type NameValuePair<N = string, V = string> = {
    name: N,
    value: V
}

type Emote = {
    emoteId: string
    startIndex: string
    endIndex: string
}

type PinnedPaidChatMessage = {
    amount: number
    exponent: number
    currency: string
    level: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE" | "SIX" | "SEVEN" | "EIGHT" | "NINE" | "TEN"
    isSystemMessage: boolean
}

type ReplyChatMessage = {
    parentMessageId: string
    parentUserId: string
    parentUserLogin: string
    parentDisplayName: string
    parentMessageText: string

    threadParentMessageId: string
    threadParentUserLogin: string
}

export default ChatMessageType;