import BttvChannelEmotes from "./bttwEmotes/channelEmotes";
import BttvGlobalEmotes from "./bttwEmotes/globalEmotes";
import FrankerfacezChannelEmotes from "./frankerfacezEmotes/channelEmotes";
import FrankerfacezGlobalEmotes from "./frankerfacezEmotes/globalEmotes";
import SeventvChannelEmotes from "./seventvEmotes/channelEmotes";
import SeventvGlobalEmotes from "./seventvEmotes/globalEmotes";
import {AbstractEmotes} from "./types/abstractEmotes";
import {DisposeInterface} from "./types/disposeInterface";

class EmotesRegistry implements DisposeInterface {
    private registeredEmotes: Array<AbstractEmotes & DisposeInterface> = []

    private readonly providerName: string = "twitch";
    private readonly channelId: string;

    constructor(providerName: string, channelId: string) {
        this.providerName = providerName;
        this.channelId = channelId;

        this.registeredEmotes.push(new BttvGlobalEmotes())
        this.registeredEmotes.push(new BttvChannelEmotes(this.providerName, this.channelId))

        this.registeredEmotes.push(new SeventvGlobalEmotes())
        this.registeredEmotes.push(new SeventvChannelEmotes(this.providerName, this.channelId))

        this.registeredEmotes.push(new FrankerfacezGlobalEmotes())
        this.registeredEmotes.push(new FrankerfacezChannelEmotes(this.providerName, this.channelId))
    }

    public getEmoteByCode(code: string) {
        for (const emotes of this.registeredEmotes) {
            const emoteQuery = emotes.getEmoteByCode(code);
            if (emoteQuery) return emoteQuery;
        }

        return null
    }

    dispose(): void {
        for (const emotes of this.registeredEmotes) {
            emotes.dispose()
            this.registeredEmotes.splice(this.registeredEmotes.indexOf(emotes), 1)
        }
    }
}

export default EmotesRegistry;