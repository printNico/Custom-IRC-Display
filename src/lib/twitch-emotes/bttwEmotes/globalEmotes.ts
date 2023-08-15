import {AbstractEmotes} from "../types/abstractEmotes";
import {DisposeInterface} from "../types/disposeInterface";
import {BttvEmote} from "./types";

class BttvGlobalEmotes extends AbstractEmotes implements DisposeInterface {
    constructor() {
        super();

        this.loadGlobalEmotes()
    }

    private loadGlobalEmotes() {
        fetch('https://api.betterttv.net/3/cached/emotes/global')
            .then(response => response.json())
            .then((emotes: BttvEmote[]) => {
                if (emotes.length === 0) return;

                emotes.forEach(emote => {
                    this.emotesMap.set(emote.code, {
                        id: emote.id,
                        code: emote.code,
                        imageType: emote.imageType,
                        animated: emote.animated,
                        urls: {
                            "1x": `https://cdn.betterttv.net/emote/${emote.id}/1x`,
                            "2x": `https://cdn.betterttv.net/emote/${emote.id}/2x`,
                            "4x": `https://cdn.betterttv.net/emote/${emote.id}/3x`
                        }
                    });
                });
            })
    }

    dispose(): void {
    }
}

export default BttvGlobalEmotes;