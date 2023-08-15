export class Emote implements EmoteInterface {
    id: string;
    code: string;
    imageType: string;
    animated: boolean;
    urls: EmoteUrls;

    constructor(options: EmoteInterface) {
        this.id = options.id;
        this.code = options.code;
        this.imageType = options.imageType;
        this.animated = options.animated;
        this.urls = options.urls;
    }
}

export interface EmoteInterface {
    id: string

    // Name of the emote that is also used in chat
    code: string

    imageType: string

    animated: boolean

    urls: EmoteUrls
}

export type EmoteUrls = {
    "1x": string
    "2x": string
    "4x": string
}