import {WebSocketEvent} from "./webSocketEvents";

export type TwitchIRCResponseType =
    "AUTH_SUCCESS" |
    "AUTH_FAILED" |
    "JOIN_SUCCESS" |
    "PRIVMSG" |
    "PING" |
    "NONE"


export type TwitchIRCResponse = {
    responseType: TwitchIRCResponseType
    message: string
    rawData: WebSocketEvent
}

const authSuccessMatcher = (event: WebSocketEvent): TwitchIRCResponseType | null => {
    const regex = /:tmi\.twitch\.tv 001 [A-z, 0-9]* :Welcome, GLHF!/
    const msg = event.data;

    if (msg.match(regex)) {
        return "AUTH_SUCCESS"
    }

    return null;
}

const authFailedMatcher = (event: WebSocketEvent): TwitchIRCResponseType | null => {
    const regex = /(:tmi\.twitch\.tv NOTICE \* :Login authentication failed)|(:tmi\.twitch\.tv NOTICE \* :Improperly formatted auth)/
    const msg = event.data

    if (msg.match(regex)) {
        return "AUTH_FAILED";
    }

    return null;
}

const joinSuccessMatcher = (event: WebSocketEvent): TwitchIRCResponseType | null => {
    const regex = /:[A-z, 0-9]*\.tmi\.twitch\.tv 353/;
    const msg = event.data;

    if (msg.match(regex)) {
        return "JOIN_SUCCESS"
    }

    return null;
}

const privMsgMatcher = (event: WebSocketEvent): TwitchIRCResponseType | null => {
    const regex = /:[A-z,0-9]*![A-z,0-9]*@[A-z,0-9]*\.tmi\.twitch\.tv PRIVMSG #/;
    const msg = event.data;

    if (msg.match(regex)) {
        return "PRIVMSG"
    }

    return null;
}

const pingMatcher = (event: WebSocketEvent): TwitchIRCResponseType | null => {
    const msg = event.data

    if (msg.startsWith("PING")) {
        return "PING"
    }

    return null;
}

const typeMatchers: ((event: WebSocketEvent) => TwitchIRCResponseType | null)[] = [
    authSuccessMatcher,
    authFailedMatcher,
    joinSuccessMatcher,
    privMsgMatcher,
    pingMatcher
]

const convertEventToResponse = (event: WebSocketEvent): TwitchIRCResponse => {
    let responseType: TwitchIRCResponseType = "NONE";

    for (const matcher of typeMatchers) {
        const result = matcher(event);
        if (result) {
            responseType = result;
            break;
        }
    }

    return {
        responseType: responseType,
        message: event.data,
        rawData: event
    }
}

export default convertEventToResponse;