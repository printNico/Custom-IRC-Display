import TwitchIRCClient from "../client/twitchIRCClient";

class TwitchIRCClientBuilder {
    private _ssl: boolean = true;

    public useSSL(value: boolean): TwitchIRCClientBuilder {
        this._ssl = value;
        return this;
    }

    public build(): TwitchIRCClient {
        return new TwitchIRCClient({
            // TODO: add anon support
            anonymous: true,
            ssl: this._ssl
        });
    }
}

export default TwitchIRCClientBuilder;