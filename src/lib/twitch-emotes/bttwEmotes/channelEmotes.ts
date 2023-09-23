import {AbstractEmotes} from "../types/abstractEmotes";
import {DisposeInterface} from "../types/disposeInterface";
import {BttvEmote, BttvEmoteEvent} from "./types";

class BttvChannelEmotes extends AbstractEmotes implements DisposeInterface {
    private websocket: WebSocket | undefined;

    private readonly providerName: string = "twitch";
    private readonly channelId: string;

    constructor(providerName: string, channelId: string) {
        super();

        this.providerName = providerName;
        this.channelId = channelId;

        this.loadChannelEmotes();
        this.registerChannelEmotesUpdateHandler();
    }

    dispose(): void {
        this.unregisterChannelEmotesUpdateHandler();
    }

    private loadChannelEmotes(): void {
        fetch(`https://api.betterttv.net/3/cached/users/${this.providerName}/${this.channelId}`)
            .then(response => response.json())
            .then(({channelEmotes, sharedEmotes}: { channelEmotes: BttvEmote[], sharedEmotes: BttvEmote[] }) => {
                const allEmotes = [...channelEmotes, ...sharedEmotes];
                if (allEmotes.length === 0) return;

                allEmotes.forEach(emote => {
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
            .catch(console.error)
    }

    private onEmoteCreated(event: BttvEmoteEvent) {
        if (!event.data.emote) return;
        this.emotesMap.set(event.data.emote.code, {
            id: event.data.emote.id,
            code: event.data.emote.code,
            imageType: event.data.emote.imageType,
            animated: event.data.emote.animated,
            urls: {
                "1x": `https://cdn.betterttv.net/emote/${event.data.emote.id}/1x`,
                "2x": `https://cdn.betterttv.net/emote/${event.data.emote.id}/2x`,
                "4x": `https://cdn.betterttv.net/emote/${event.data.emote.id}/3x`
            }
        });
    }

    private onEmoteUpdated(event: BttvEmoteEvent) {
        if (!event.data.emote) return;

        const prevEmote = this.getEmoteById(event.data.emote.id)
        if (prevEmote && (prevEmote.code !== event.data.emote.code)) {
            this.emotesMap.delete(prevEmote.code)
        }

        this.emotesMap.set(event.data.emote.code, {
            id: event.data.emote.id,
            code: event.data.emote.code,
            imageType: event.data.emote.imageType,
            animated: event.data.emote.animated,
            urls: {
                "1x": `https://cdn.betterttv.net/emote/${event.data.emote.id}/1x`,
                "2x": `https://cdn.betterttv.net/emote/${event.data.emote.id}/2x`,
                "4x": `https://cdn.betterttv.net/emote/${event.data.emote.id}/3x`
            }
        });
    }

    private onEmoteDeleted(event: BttvEmoteEvent) {
        if (!event.data.emoteId) return;
        const prevEmote = this.getEmoteById(event.data.emoteId)

        if (!prevEmote) return;
        this.emotesMap.delete(prevEmote.code);
    }

    private registerChannelEmotesUpdateHandler() {
        this.websocket = new WebSocket(`wss://sockets.betterttv.net/ws`);

        this.websocket.addEventListener("open", () => {
            if(this.providerName && this.channelId) {
                this.websocket!.send(BTTV_WS_JOIN_CHANNEL(this.providerName, this.channelId));
            }
        })

        this.websocket.addEventListener("message", (event) => {
            const data = JSON.parse(event.data) as BttvEmoteEvent;

            if (!data?.name) return;
            switch (data.name) {
                case "emote_create":
                    this.onEmoteCreated(data);
                    break;
                case "emote_update":
                    this.onEmoteUpdated(data);
                    break;
                case "emote_delete":
                    this.onEmoteDeleted(data);
                    break;
            }
        })
    }

    private unregisterChannelEmotesUpdateHandler() {
        if (this.websocket) {
            this.websocket.close()
            this.websocket = undefined;
        }
    }
}

const BTTV_WS_JOIN_CHANNEL = (provider: string, channelName: string) => JSON.stringify({
    "name": "join_channel",
    "data": {
        "name": `${provider}:${channelName}`
    }
});

const BTTV_WS_PART_CHANNEL = (provider: string, channelName: string) => JSON.stringify({
    "name": "part_channel",
    "data": {
        "name": `${provider}:${channelName}`
    }
});

export default BttvChannelEmotes;