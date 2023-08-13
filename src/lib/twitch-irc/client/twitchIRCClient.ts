import {filter, Observable, Subject, Subscription} from "rxjs";
import ChatMessageType, {convertToChatMessage} from "../chatMessageType";
import {REQUESTS} from "./ircMessages";
import convertEventToResponse, {TwitchIRCResponse} from "./ircResponse";
import TwitchIRC from "../types/twitchIRC";
import {WebSocketCloseEvent, WebSocketEvent} from "./webSocketEvents";

const TWITCH_WS_URL_SSL = "wss://irc-ws.chat.twitch.tv:443"
const TWITCH_WS_URL_NO_SSL = "ws://irc-ws.chat.twitch.tv:80"

const DefaultConfiguration: TwitchIRC.Configuration = {
    anonymous: true,
    ssl: true
}

class TwitchIRCClient {
    private _configuration: TwitchIRC.Configuration = DefaultConfiguration;

    private _webSocketClient: WebSocket | undefined = undefined;
    private _connectionState: TwitchIRC.ConnectionState = TwitchIRC.ConnectionState.Disconnected;
    private _onConnectionState$: Subject<TwitchIRC.ConnectionState> = new Subject<TwitchIRC.ConnectionState>();

    private _onWebSocketOpen$: Subject<WebSocketEvent> = new Subject<WebSocketEvent>();
    private _onWebSocketClose$: Subject<Event> = new Subject<Event>();
    private _onWebSocketError$: Subject<WebSocketEvent> = new Subject<WebSocketEvent>();
    private _onWebSocketMessage$: Subject<TwitchIRCResponse> = new Subject<TwitchIRCResponse>();

    private _channelsToJoin: string[] = [];
    private _joinedChannels: string[] = [];

    private _onChatMessage$: Subject<ChatMessageType> = new Subject<ChatMessageType>();

    private _globalSubscriptions: Subscription[] = [];

    constructor(configuration: TwitchIRC.Configuration) {
        // Merge given configuration with default configuration
        this._configuration = Object.assign(DefaultConfiguration, configuration)
    }

    public get ConnectionState(): TwitchIRC.ConnectionState {
        return this._connectionState;
    }

    public get OnConnectionState(): Observable<TwitchIRC.ConnectionState> {
        return this._onConnectionState$.asObservable();
    }

    public get OnChatMessage(): Observable<ChatMessageType> {
        return this._onChatMessage$.asObservable();
    }

    public async join(channels?: string[]) {
        return new Promise<void>((resolve) => {
            if (channels) {
                // Store channels to join
                const newChannelsToJoin = this._channelsToJoin.concat(channels)
                this._channelsToJoin = newChannelsToJoin.filter((element, index) => {
                    return newChannelsToJoin.indexOf(element) === index;
                });
            }

            // If not connected return early
            if (this._connectionState !== TwitchIRC.ConnectionState.Connected) {
                resolve();
            }

            const notJoinedChannels = this._channelsToJoin.filter(x => !this._joinedChannels.some(y => x === y))
            this._webSocketClient!.send(REQUESTS.JOIN(notJoinedChannels))

            const subscription = this._onWebSocketMessage$
                .pipe(filter(x => x.responseType === "JOIN_SUCCESS"))
                .subscribe((evMsg) => {
                    const regex = /:[A-z, 0-9]*\.tmi\.twitch\.tv 353 .*/;

                    const msg = evMsg.message;
                    const matches = msg.match(regex)
                    const row = matches ? matches[0] : null

                    if (row) {
                        const channelName = row.split(' = #')[1]?.split(' ')[0] ?? null
                        if (channelName) {
                            this._joinedChannels.push(channelName)
                        }
                    }
                })

            // Wait 1s for responses and then finish
            setTimeout(() => {
                subscription.unsubscribe();
                resolve()
            }, 1000)
        })
    }

    public async connect() {
        return new Promise<void>((resolve, reject) => {
            if (this._webSocketClient) {
                // If websocket client is already in an active state abort
                const state = this._webSocketClient.readyState;
                if (state !== 3) {
                    reject(state)
                }
            }

            let webSocketServerURL;
            if (this._configuration.ssl) {
                webSocketServerURL = TWITCH_WS_URL_SSL;
            } else {
                webSocketServerURL = TWITCH_WS_URL_NO_SSL;
            }

            this._webSocketClient = new WebSocket(webSocketServerURL);
            this.registerConnectionStateHandler()
            this.registerWebSocketEventListeners();
            this.registerPingHandler()
            this.registerPrivMsgHandler();

            const subOnOpen = this._onWebSocketOpen$
                .subscribe(() => {
                    const capabilities = ['twitch.tv/tags']
                    this._webSocketClient!.send(REQUESTS.CAP(capabilities));

                    // Send message containing password
                    const pw = getAnonymousPassword();
                    this._webSocketClient!.send(REQUESTS.PASS(pw))

                    // Send message containing username
                    const name = getAnonymousUsername()
                    this._webSocketClient!.send(REQUESTS.NICK(name))

                    const subOnMessage = this._onWebSocketMessage$
                        .pipe(filter(x => (x.responseType === "AUTH_SUCCESS") || x.responseType === "AUTH_FAILED"))
                        .subscribe((evMsg) => {
                            if (evMsg.responseType === "AUTH_SUCCESS") {
                                this._onConnectionState$.next(TwitchIRC.ConnectionState.Connected)
                            } else {
                                this.disconnect();
                                reject()
                            }

                            // Unsubscribe, so this only triggers once
                            subOnOpen.unsubscribe();
                            subOnMessage.unsubscribe();
                            resolve();
                        })
                })
        })
    }

    public disconnect() {
        if (!this._webSocketClient) {
            throw new Error("Websocket client not initialized.")
        }

        if (this._webSocketClient.readyState === 3) {
            throw new Error("Websocket client connection is already closed")
        }

        // Remove and Unsubscribe from events
        this.unsubscribeGlobalSubscriptions();
        this.unregisterWebSocketEventListeners();

        // Close connection
        this._webSocketClient.close()
        this._onConnectionState$.next(TwitchIRC.ConnectionState.Disconnected)
        this._webSocketClient = undefined;
    }

    private registerPingHandler() {
        const subscription = this._onWebSocketMessage$
            .pipe(filter(x => x.responseType === "PING"))
            .subscribe(() => {
                this._webSocketClient!.send(REQUESTS.PONG())
            })

        this._globalSubscriptions.push(subscription);
    }

    private registerPrivMsgHandler() {
        const subscription = this._onWebSocketMessage$
            .pipe(filter(x => x.responseType === "PRIVMSG"))
            .subscribe((evMsg) => {
                const message = convertToChatMessage(evMsg);
                this._onChatMessage$.next(message)
            })

        this._globalSubscriptions.push(subscription);
    }

    private registerConnectionStateHandler() {
        const subscription = this._onConnectionState$
            .subscribe((state) => {
                this._connectionState = state;
            })

        this._globalSubscriptions.push(subscription);
    }

    private webSocketMessageHandler = (event: WebSocketEvent) => {
        const result = convertEventToResponse(event);
        this._onWebSocketMessage$.next(result)
    }

    private unsubscribeGlobalSubscriptions() {
        if (this._globalSubscriptions.length > 0) {
            this._globalSubscriptions.forEach((subscription, index) => {
                subscription.unsubscribe()
                this._globalSubscriptions.splice(index, 1);
            })
        }
    }

    private registerWebSocketEventListeners() {
        if (!this._webSocketClient) return;
        this.unregisterWebSocketEventListeners();

        this._webSocketClient.addEventListener("open", (event) => this._onWebSocketOpen$.next(event as WebSocketEvent))
        this._webSocketClient.addEventListener("close", (event) => this._onWebSocketClose$.next(event as WebSocketCloseEvent))
        this._webSocketClient.addEventListener("error", (event) => this._onWebSocketError$.next(event as WebSocketEvent))
        this._webSocketClient.addEventListener("message", (event) => this.webSocketMessageHandler(event as WebSocketEvent))
    }

    private unregisterWebSocketEventListeners() {
        if (!this._webSocketClient) return;

        this._webSocketClient.removeEventListener("open", (event) => this._onWebSocketOpen$.next(event as WebSocketEvent))
        this._webSocketClient.removeEventListener("close", (event) => this._onWebSocketClose$.next(event as WebSocketCloseEvent))
        this._webSocketClient.removeEventListener("error", (event) => this._onWebSocketError$.next(event as WebSocketEvent))
        this._webSocketClient.removeEventListener("message", (event) => this.webSocketMessageHandler(event as WebSocketEvent))
    }
}

const getAnonymousPassword = (): string => {
    return Math.floor((Math.random() * 10000000)).toString();
}

const getAnonymousUsername = (): string => {
    const rnd = Math.floor(Math.random() * 1000);
    return `justinfan${rnd}`;
}

export default TwitchIRCClient;