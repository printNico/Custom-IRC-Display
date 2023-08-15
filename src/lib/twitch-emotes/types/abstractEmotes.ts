import {Emote} from "./emote";

export abstract  class AbstractEmotes {
    emotesMap: Map<string, Emote>

    protected constructor() {
        this.emotesMap = new Map<string, Emote>();
    }

    get emotes(): Array<Emote> {
        return [...this.emotesMap.values()];
    }

    getEmoteByCode(code: string): Emote | undefined {
        return this.emotesMap.get(code);
    }

    getEmoteById(id: string): Emote | undefined {
        return this.emotes.find(emote => emote.id === id);
    }
}