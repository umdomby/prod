// file: client/app/webrtc/hooks/useWebRTC.ts
import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
    type: string;
    data?: any;
    sdp?: RTCSessionDescriptionInit;
    ice?: RTCIceCandidateInit;
    room?: string;
    username?: string;
}

export const useWebRTC = (
    deviceIds: { video: string; audio: string },
    username: string,
    roomId: string
) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [users, setUsers] = useState<string[]>([]);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isInRoom, setIsInRoom] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ws = useRef<WebSocket | null>(null);
    const pc = useRef<RTCPeerConnection | null>(null);
    const pendingIceCandidates = useRef<RTCIceCandidate[]>([]);

    const cleanup = () => {
        if (pc.current) {
            pc.current.onicecandidate = null;
            pc.current.ontrack = null;
            pc.current.onnegotiationneeded = null;
            pc.current.oniceconnectionstatechange = null;
            pc.current.close();
            pc.current = null;
        }

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }

        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            setRemoteStream(null);
        }

        setIsCallActive(false);
        pendingIceCandidates.current = [];
    };

    const leaveRoom = () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'leave',
                room: roomId,
                username
            }));
        }
        cleanup();
        setUsers([]);
        setIsInRoom(false);
        ws.current?.close();
        ws.current = null;
    };

    const connectWebSocket = () => {
        try {
            ws.current = new WebSocket('wss://anybet.site/ws');

            ws.current.onopen = () => {
                setIsConnected(true);
                setError(null);
                console.log('WebSocket connected');
            };

            ws.current.onerror = (event) => {
                console.error('WebSocket error:', event);
                setError('Ошибка подключения');
                setIsConnected(false);
            };

            ws.current.onclose = (event) => {
                console.log('WebSocket disconnected, code:', event.code, 'reason:', event.reason);
                setIsConnected(false);
                setIsInRoom(false);
            };

            ws.current.onmessage = async (event) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    console.log('Received message:', data);

                    if (data.type === 'room_info') {
                        setUsers(data.data.users || []);
                    }
                    else if (data.type === 'error') {
                        setError(data.data);
                    }
                    else if (data.type === 'offer') {
                        if (pc.current && ws.current?.readyState === WebSocket.OPEN && data.sdp) {
                            await pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));

                            const answer = await pc.current.createAnswer({
                                offerToReceiveAudio: true,
                                offerToReceiveVideo: true
                            });
                            await pc.current.setLocalDescription(answer);

                            ws.current.send(JSON.stringify({
                                type: 'answer',
                                sdp: answer,
                                room: roomId,
                                username
                            }));

                            setIsCallActive(true);
                        }
                    }
                    else if (data.type === 'answer') {
                        if (pc.current && pc.current.signalingState !== 'stable' && data.sdp) {
                            await pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                            setIsCallActive(true);

                            pendingIceCandidates.current.forEach(candidate => {
                                pc.current?.addIceCandidate(new RTCIceCandidate(candidate));
                            });
                            pendingIceCandidates.current = [];
                        }
                    }
                    else if (data.type === 'ice_candidate') {
                        if (data.ice) {
                            const candidate = new RTCIceCandidate(data.ice);

                            if (pc.current && pc.current.remoteDescription) {
                                await pc.current.addIceCandidate(candidate);
                            } else {
                                pendingIceCandidates.current.push(candidate);
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error processing message:', err);
                    setError('Ошибка обработки сообщения сервера');
                }
            };

            return true;
        } catch (err) {
            console.error('WebSocket connection error:', err);
            setError('Не удалось подключиться к серверу');
            return false;
        }
    };

    const initializeWebRTC = async () => {
        try {
            cleanup();

            const config = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ],
                sdpSemantics: 'unified-plan' as const,
                bundlePolicy: 'max-bundle' as const,
                rtcpMuxPolicy: 'require' as const,
                iceTransportPolicy: 'all' as const
            };

            pc.current = new RTCPeerConnection(config);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: deviceIds.video ? {
                    deviceId: { exact: deviceIds.video },
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 24 }
                } : false,
                audio: deviceIds.audio ? {
                    deviceId: { exact: deviceIds.audio },
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } : false
            });

            setLocalStream(stream);
            stream.getTracks().forEach(track => {
                pc.current?.addTrack(track, stream);
            });

            pc.current.onicecandidate = (event) => {
                if (event.candidate && ws.current?.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({
                        type: 'ice_candidate',
                        ice: event.candidate,
                        room: roomId,
                        username
                    }));
                }
            };

            pc.current.ontrack = (event) => {
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                }
            };

            pc.current.oniceconnectionstatechange = () => {
                if (pc.current?.iceConnectionState === 'disconnected' ||
                    pc.current?.iceConnectionState === 'failed') {
                    console.log('ICE connection failed, attempting to restart...');
                    reconnect();
                }
            };

            return true;
        } catch (err) {
            console.error('WebRTC initialization error:', err);
            setError('Не удалось инициализировать WebRTC');
            cleanup();
            return false;
        }
    };

    const reconnect = async () => {
        cleanup();

        if (ws.current) {
            ws.current.close();
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (isInRoom) {
            await joinRoom(username);
        }
    };

    const joinRoom = async (uniqueUsername: string) => {
        setError(null);

        if (!connectWebSocket()) {
            return;
        }

        if (!(await initializeWebRTC())) {
            return;
        }
        const preferredCodec = 'H264'; // Всегда H.264
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                action: "join",
                room: roomId,
                username: uniqueUsername,
                isLeader: false,
                preferredCodec // VP8 для Chrome, H264 для остальных
            }));
            setIsInRoom(true);

            // Автоматически начинаем звонок при входе в комнату
            if (pc.current) {
                const offer = await pc.current.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true
                });
                await pc.current.setLocalDescription(offer);
                ws.current.send(JSON.stringify({
                    type: "offer",
                    sdp: offer,
                    room: roomId,
                    username: uniqueUsername,
                    isLeader: false,
                    preferredCodec
                }));
                setIsCallActive(true);
            }
        }
    };

    useEffect(() => {
        return () => {
            leaveRoom();
        };
    }, []);

    return {
        localStream,
        remoteStream,
        users,
        joinRoom,
        leaveRoom,
        isCallActive,
        isConnected,
        isInRoom,
        error
    };
};