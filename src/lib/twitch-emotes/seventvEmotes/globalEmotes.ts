import {AbstractEmotes} from "../types/abstractEmotes";
import {DisposeInterface} from "../types/disposeInterface";
import {EmoteUrls} from "../types/emote";
import {EmoteSetResponse} from "./types";

class SeventvGlobalEmotes extends AbstractEmotes implements DisposeInterface {
    constructor() {
        super();

        this.loadGlobalEmotes();
    }

    private loadGlobalEmotes() {
        fetch('https://7tv.io/v3/emote-sets/62cdd34e72a832540de95857')
            .then(response => response.json())
            .then(({emotes}: EmoteSetResponse) => {
                if (!emotes?.length) return;

                emotes.forEach((emote) => {
                    if (!emote.data.listed) return;
                    const isAnimated = emote.data.animated;
                    const imageType = isAnimated ? "webp" : "png";
                    const urls: EmoteUrls = {
                        "1x": `https://cdn.7tv.app/emote/${emote.id}/1x.${imageType}`,
                        "2x": `https://cdn.7tv.app/emote/${emote.id}/2x.${imageType}`,
                        "4x": `https://cdn.7tv.app/emote/${emote.id}/4x.${imageType}`
                    }

                    this.emotesMap.set(emote.name, {
                        id: emote.id,
                        code: emote.name,
                        imageType: imageType,
                        animated: isAnimated,
                        urls: urls
                    })
                })
            })
            .catch(console.error)
    }

    dispose(): void {
    }
}

export default SeventvGlobalEmotes;