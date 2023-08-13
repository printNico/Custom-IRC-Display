export interface WebSocketEvent extends Event {
    data: string
}

export interface WebSocketCloseEvent extends CloseEvent {}