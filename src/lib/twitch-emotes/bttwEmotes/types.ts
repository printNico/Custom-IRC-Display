export type BttvEmoteEvent = {
    name: string;
    data: {
        channel: string;
        emoteId?: string
        emote?: {
            id: string;
            code: string
            imageType: string;
            animated: boolean;
        }
    }
}

export type BttvEmote = {
    id: string;
    code: string;
    imageType: string;
    animated: boolean;
}