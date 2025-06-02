// file: client/app/webrtc/lib/signaling.ts
import { RoomInfo, SignalingMessage, SignalingClientOptions } from '../types';

export class SignalingClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private connectionTimeout: NodeJS.Timeout | null = null;
    private connectionPromise: Promise<void> | null = null;
    private resolveConnection: (() => void) | null = null;

    public onRoomInfo: (data: RoomInfo) => void = () => {};
    public onOffer: (data: RTCSessionDescriptionInit) => void = () => {};
    public onAnswer: (data: RTCSessionDescriptionInit) => void = () => {};
    public onCandidate: (data: RTCIceCandidateInit) => void = () => {};
    public onError: (error: string) => void = () => {};
    public onLeave: (username?: string) => void = () => {};
    public onJoin: (username: string) => void = () => {};

    constructor(
        private url: string,
        private options: SignalingClientOptions = {}
    ) {
        this.options = {
            maxReconnectAttempts: 5,
            reconnectDelay: 1000,
            connectionTimeout: 5000,
            ...options
        };
    }

    public get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    public connect(roomId: string, username: string): Promise<void> {
        if (this.ws) {
            this.ws.close();
        }

        this.ws = new WebSocket(this.url);
        this.setupEventListeners();

        this.connectionPromise = new Promise((resolve, reject) => {
            this.resolveConnection = resolve;

            this.connectionTimeout = setTimeout(() => {
                if (!this.isConnected) {
                    this.handleError('Connection timeout');
                    reject(new Error('Connection timeout'));
                }
            }, this.options.connectionTimeout);

            this.ws!.onopen = () => {
                this.ws!.send(JSON.stringify({
                    type: 'join',
                    room: roomId,
                    username: username
                }));
            };
        });

        return this.connectionPromise;
    }

    private setupEventListeners(): void {
        if (!this.ws) return;

        this.ws.onmessage = (event) => {
            try {
                const message: SignalingMessage = JSON.parse(event.data);

                if (!('type' in message)) {
                    console.warn('Received message without type:', message);
                    return;
                }

                switch (message.type) {
                    case 'room_info':
                        this.onRoomInfo(message.data);
                        break;
                    case 'error':
                        this.onError(message.data);
                        break;
                    case 'offer':
                        this.onOffer(message.sdp);
                        break;
                    case 'answer':
                        this.onAnswer(message.sdp);
                        break;
                    case 'candidate':
                        this.onCandidate(message.candidate);
                        break;
                    case 'leave':
                        this.onLeave(message.data);
                        break;
                    case 'join':
                        this.onJoin(message.data);
                        break;
                    default:
                        console.warn('Unknown message type:', message);
                }
            } catch (error) {
                this.handleError('Invalid message format');
            }
        };

        this.ws.onclose = () => {
            console.log('Signaling connection closed');
            this.cleanup();
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            this.handleError(`Connection error: ${error}`);
        };
    }

    public sendOffer(offer: RTCSessionDescriptionInit): Promise<void> {
        return this.send({ type: 'offer', sdp: offer });
    }

    public sendAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
        return this.send({ type: 'answer', sdp: answer });
    }

    public sendCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        return this.send({ type: 'candidate', candidate });
    }

    public sendLeave(username: string): Promise<void> {
        return this.send({ type: 'leave', data: username });
    }

    private send(data: SignalingMessage): Promise<void> {
        if (!this.isConnected) {
            return Promise.reject(new Error('WebSocket not connected'));
        }

        try {
            this.ws!.send(JSON.stringify(data));
            return Promise.resolve();
        } catch (error) {
            console.error('Send error:', error);
            return Promise.reject(error);
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 5)) {
            return this.handleError('Max reconnection attempts reached');
        }

        this.reconnectAttempts++;
        console.log(`Reconnecting (attempt ${this.reconnectAttempts})`);

        setTimeout(() => this.connect('', ''), this.options.reconnectDelay);
    }

    private handleError(error: string): void {
        console.error('Signaling error:', error);
        this.onError(error);
        this.cleanup();
    }

    private cleanup(): void {
        this.clearTimeout(this.connectionTimeout);
        if (this.resolveConnection) {
            this.resolveConnection();
            this.resolveConnection = null;
        }
        this.connectionPromise = null;
    }

    private clearTimeout(timer: NodeJS.Timeout | null): void {
        if (timer) clearTimeout(timer);
    }

    public close(): void {
        this.cleanup();
        this.ws?.close();
    }
}