import {AbstractEmotes} from "../types/abstractEmotes";
import {DisposeInterface} from "../types/disposeInterface";
import {EmoteUrls} from "../types/emote";
import {FrankerfacezEmoteResponse} from "./types";

class FrankerfacezGlobalEmotes extends AbstractEmotes implements DisposeInterface {
    constructor() {
        super();

        this.loadGlobalEmotes();
    }

    private loadGlobalEmotes() {
        fetch('https://api.frankerfacez.com/v1/set/global/ids')
            .then(response => response.json())
            .then(({sets}: FrankerfacezEmoteResponse) => {
                Object.values(sets).forEach(({emoticons}) => {
                    emoticons.forEach((emote) => {
                        const isAnimated = !emote.animated;
                        const urls: EmoteUrls = isAnimated ?
                            {
                                "1x": emote.urls["1"],
                                "2x": emote.urls["2"],
                                "4x": emote.urls["4"]
                            } :
                            {
                                "1x": emote.animated!["1"],
                                "2x": emote.animated!["2"],
                                "4x": emote.animated!["4"]
                            };

                        this.emotesMap.set(emote.name, {
                            id: emote.id,
                            code: emote.name,
                            imageType: "png",
                            animated: isAnimated,
                            urls: urls
                        })
                    })
                })
            })
            .catch(console.error)
    }

    dispose(): void {
    }
}

export default FrankerfacezGlobalEmotes;