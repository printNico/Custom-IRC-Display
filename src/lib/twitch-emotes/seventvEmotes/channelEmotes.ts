import {AbstractEmotes} from "../types/abstractEmotes";
import {DisposeInterface} from "../types/disposeInterface";
import {EmoteUrls} from "../types/emote";
import {SeventvDispatchEvent, SeventvEmote, SeventvEmoteResponse, SeventvEmoteSetUpdateBody} from "./types";

class SeventvChannelEmotes extends AbstractEmotes implements DisposeInterface {
    private websocket: WebSocket | undefined;
    private emoteSetId: string | undefined;

    private readonly providerName: string = "twitch";
    private readonly channelId: string;

    constructor(providerName: string, channelId: string) {
        super();

        this.providerName = providerName;
        this.channelId = channelId;

        this.loadChannelEmotes();
        this.registerChannelEmotesUpdateHandler();
    }

    private loadChannelEmotes() {
        fetch(`https://7tv.io/v3/users/${this.providerName}/${this.channelId}`)
            .then(response => response.json())
            .then(({emote_set}: SeventvEmoteResponse) => {
                this.emoteSetId = emote_set.id;

                emote_set.emotes.forEach((emote) => {
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

    private onEmoteAdded(emote: SeventvEmote) {
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
    }

    private onEmoteUpdated(emote: SeventvEmote) {
        if (!emote.data.listed) return;

        const prevEmote = this.getEmoteById(emote.id)
        if (prevEmote && (prevEmote.code !== emote.name)) {
            this.emotesMap.delete(prevEmote.code)
        }

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
    }

    private onEmoteRemoved(emote: SeventvEmote) {
        if (!emote.id) return;
        const prevEmote = this.getEmoteById(emote.id)

        if (!prevEmote) return;
        this.emotesMap.delete(prevEmote.code);
    }

    private onEmoteSetChanged(data: SeventvEmoteSetUpdateBody) {
        if (data.pushed?.length) {
            data.pushed.forEach((v) => this.onEmoteAdded(v.value));
        }

        if (data.updated?.length) {
            data.updated.forEach((v) => this.onEmoteUpdated(v.value));
        }

        if (data.pulled?.length) {
            data.pulled.forEach((v) => this.onEmoteRemoved(v.old_value));
        }
    }

    private registerChannelEmotesUpdateHandler() {
        this.websocket = new WebSocket(`wss://events.7tv.io/v3`);

        this.websocket.addEventListener("open", () => {
            if (!this.emoteSetId) {
                this.unregisterChannelEmotesUpdateHandler();
                return;
            }

            this.websocket!.send(SEVENTV_WS_SUB_EMOTE_SET(this.emoteSetId));
        })

        this.websocket.addEventListener("message", (event) => {
            const {d } = JSON.parse(event.data) as SeventvDispatchEvent;

            if (!d?.type) return;
            switch (d.type) {
                case "emote_set.update":
                    this.onEmoteSetChanged(d.body);
                    break;
            }
        })
    }

    private unregisterChannelEmotesUpdateHandler() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = undefined;
        }
    }

    dispose(): void {
        this.unregisterChannelEmotesUpdateHandler();
    }
}

const SEVENTV_WS_SUB_EMOTE_SET = (emoteSetId: string) => JSON.stringify({
    op: 35,
    d: {
        type: "emote_set.update",
        condition: {"object_id": emoteSetId}
    },
})

export default SeventvChannelEmotes;