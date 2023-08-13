namespace TwitchIRC {
    export type Configuration = {
        anonymous: boolean
        ssl: boolean
    }

    export enum ConnectionState {
        Disconnected,
        Connecting,
        Connected,
        Reconnecting
    }
}

export default TwitchIRC;