// file: client/app/webrtc/types.ts
export interface RoomInfo {
    users: string[];
}

export type SignalingMessage =
    | { type: 'room_info'; data: RoomInfo }
    | { type: 'error'; data: string }
    | { type: 'offer'; sdp: RTCSessionDescriptionInit }
    | { type: 'answer'; sdp: RTCSessionDescriptionInit }
    | { type: 'candidate'; candidate: RTCIceCandidateInit }
    | { type: 'join'; data: string }
    | { type: 'leave'; data: string };

export interface User {
    username: string;
    stream?: MediaStream;
    peerConnection?: RTCPeerConnection;
}

export interface SignalingClientOptions {
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
    connectionTimeout?: number;
}