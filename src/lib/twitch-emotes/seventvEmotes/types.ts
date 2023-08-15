export type SeventvEmote = {
    id: string;
    name: string;
    data: {
        animated: boolean
        listed: boolean
    }
}

export type SeventvEmoteResponse = {
    "emote_set": {
        id: string
        "emotes": SeventvEmote[]
    }
}

export type SeventvDispatchEvent = {
    op: number,
    d: {
        type: string,
        body: SeventvEmoteSetUpdateBody
    }
}

export type SeventvEmoteSetUpdateBody = {
    pulled: SeventvEmoteSetUpdateEmote[];
    updated: SeventvEmoteSetUpdateEmote[];
    pushed: SeventvEmoteSetUpdateEmote[];
}

export type SeventvEmoteSetUpdateEmote = {
    value: SeventvEmote
    "old_value": SeventvEmote
}

export type EmoteSetResponse = {
    "emotes": SeventvEmote[]
}