'use client';
import { useEffect, useRef, useState } from 'react';
import { VideoPlayer } from '@/components/webrtc/components/VideoPlayer';
import { joinRoomViaProxy } from '@/app/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NoRegWebRTCProps {
    roomId: string;
}

interface WebSocketMessage {
    type: string;
    data?: any;
    sdp?: RTCSessionDescriptionInit;
    ice?: RTCIceCandidateInit;
    room?: string;
    username?: string;
    isLeader?: boolean;
    force_disconnect?: boolean;
    preferredCodec?: string;
}

export default function UseNoRegWebRTC({ roomId }: NoRegWebRTCProps) {
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isInRoom, setIsInRoom] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const ws = useRef<WebSocket | null>(null);
    const pc = useRef<RTCPeerConnection | null>(null);
    const retryAttempts = useRef(0);
    const videoCheckTimeout = useRef<NodeJS.Timeout | null>(null);
    const connectionTimeout = useRef<NodeJS.Timeout | null>(null);
    const webRTCRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const username = `guest_${Math.floor(Math.random() * 1000)}`;
    const preferredCodec = 'VP8';
    const MAX_RETRIES = 10;
    const VIDEO_CHECK_TIMEOUT = 8000;

    const cleanup = () => {
        console.log('Очистка ресурсов WebRTC');
        if (videoCheckTimeout.current) clearTimeout(videoCheckTimeout.current);
        if (connectionTimeout.current) clearTimeout(connectionTimeout.current);
        if (webRTCRetryTimeoutRef.current) clearTimeout(webRTCRetryTimeoutRef.current);

        if (pc.current) {
            pc.current.onicecandidate = null;
            pc.current.ontrack = null;
            pc.current.oniceconnectionstatechange = null;
            pc.current.close();
            pc.current = null;
        }

        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            setRemoteStream(null);
        }

        if (ws.current) {
            ws.current.onmessage = null;
            ws.current.onopen = null;
            ws.current.onclose = null;
            ws.current.onerror = null;
            ws.current.close();
            ws.current = null;
        }

        setIsConnected(false);
        setIsInRoom(false);
        setError(null);
        retryAttempts.current = 0;
        setRetryCount(0);
    };

    const startVideoCheckTimer = () => {
        if (videoCheckTimeout.current) clearTimeout(videoCheckTimeout.current);
        videoCheckTimeout.current = setTimeout(() => {
            const videoElement = document.querySelector('video');
            const hasVideoContent = videoElement && videoElement.videoWidth > 0 && videoElement.videoHeight > 0;
            if (
                !remoteStream ||
                remoteStream.getVideoTracks().length === 0 ||
                !remoteStream.getVideoTracks()[0]?.enabled ||
                remoteStream.getVideoTracks()[0]?.readyState !== 'live' ||
                !hasVideoContent
            ) {
                console.warn('Видео не получено, переподключение...');
                resetConnection();
            }
        }, VIDEO_CHECK_TIMEOUT);
    };

    const connectWebSocket = async (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                resolve(true);
                return;
            }

            try {
                ws.current = new WebSocket('wss://ardua.site:444/wsgo');
                ws.current.onopen = () => {
                    setIsConnected(true);
                    resolve(true);
                };
                ws.current.onerror = () => {
                    setError('Ошибка WebSocket');
                    resolve(false);
                };
                ws.current.onclose = (event) => {
                    setIsConnected(false);
                    setError(event.code !== 1000 ? `WebSocket закрыт: ${event.reason || 'код ' + event.code}` : null);
                    resolve(false);
                };
            } catch (err) {
                setError('Не удалось создать WebSocket');
                resolve(false);
            }
        });
    };

    const initializeWebRTC = async () => {
        cleanup();

        pc.current = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:ardua.site:3478' },
                {
                    urls: 'turn:ardua.site:3478',
                    username: 'user1',
                    credential: 'pass1',
                },
            ],
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
        });

        pc.current.onicecandidate = (event) => {
            if (event.candidate && ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(
                    JSON.stringify({
                        type: 'ice_candidate',
                        ice: event.candidate.toJSON(),
                        room: roomId.replace(/-/g, ''),
                        username,
                        preferredCodec,
                    })
                );
            }
        };

        pc.current.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                const stream = event.streams[0];
                setRemoteStream(stream);
                setIsInRoom(true);
                if (videoCheckTimeout.current) clearTimeout(videoCheckTimeout.current);
                startVideoCheckTimer();
            }
        };

        pc.current.oniceconnectionstatechange = () => {
            if (!pc.current) return;
            if (
                pc.current.iceConnectionState === 'failed' ||
                pc.current.iceConnectionState === 'disconnected'
            ) {
                resetConnection();
            }
        };
    };

    const sendWebSocketMessage = (message: WebSocketMessage) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }
    };

    const setupWebSocketListeners = () => {
        if (!ws.current) return;

        ws.current.onmessage = async (event) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data);
                console.log('Получено сообщение:', data);

                switch (data.type) {
                    case 'room_info':
                        setIsInRoom(true);
                        startVideoCheckTimer();
                        break;

                    case 'offer':
                        if (pc.current && data.sdp) {
                            await pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                            const answer = await pc.current.createAnswer();
                            await pc.current.setLocalDescription(answer);
                            sendWebSocketMessage({
                                type: 'answer',
                                sdp: answer,
                                room: roomId.replace(/-/g, ''),
                                username,
                                preferredCodec,
                            });
                        }
                        break;

                    case 'ice_candidate':
                        if (pc.current && data.ice) {
                            await pc.current.addIceCandidate(new RTCIceCandidate(data.ice));
                        }
                        break;

                    case 'error':
                        setError(data.data || 'Ошибка сервера');
                        if (data.data === 'Room does not exist. Leader must join first.') {
                            if (retryAttempts.current < MAX_RETRIES) {
                                webRTCRetryTimeoutRef.current = setTimeout(() => {
                                    retryAttempts.current += 1;
                                    setRetryCount(retryAttempts.current);
                                    joinRoom();
                                }, 5000);
                            } else {
                                setError('Не удалось подключиться: лидер не в комнате');
                            }
                        }
                        break;

                    case 'force_disconnect':
                        setError('Отключен: другой пользователь подключился');
                        cleanup();
                        break;
                }
            } catch (err) {
                setError('Ошибка обработки сообщения');
            }
        };
    };

    const joinRoom = async () => {
        console.log('Попытка подключения к комнате:', roomId);
        cleanup();
        setError(null);

        try {
            const normalizedRoomId = roomId.replace(/-/g, '');
            console.log('Отправка joinRoomViaProxy с roomId:', normalizedRoomId);
            const response = await joinRoomViaProxy(normalizedRoomId);
            if ('error' in response) {
                throw new Error(response.error);
            }
            const { roomId: targetRoomId } = response;

            if (!(await connectWebSocket())) {
                throw new Error('Не удалось подключиться к WebSocket');
            }

            setupWebSocketListeners();
            await initializeWebRTC();

            await new Promise<void>((resolve, reject) => {
                if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
                    reject(new Error('WebSocket не подключен'));
                    return;
                }

                ws.current.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'room_info') {
                        setIsInRoom(true);
                        resolve();
                    } else if (data.type === 'error') {
                        setError(data.data);
                        reject(new Error(data.data));
                    }
                };

                sendWebSocketMessage({
                    type: 'join',
                    room: targetRoomId,
                    username,
                    isLeader: false,
                    preferredCodec,
                });
            });

            startVideoCheckTimer();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Join room error:', errorMessage);
            setError(`Ошибка подключения: ${errorMessage}`);
            if (retryAttempts.current < MAX_RETRIES) {
                webRTCRetryTimeoutRef.current = setTimeout(() => {
                    retryAttempts.current += 1;
                    setRetryCount(retryAttempts.current);
                    joinRoom();
                }, 5000);
            }
        }
    };

    const resetConnection = () => {
        console.log('Переподключение WebRTC...');
        joinRoom();
    };

    useEffect(() => {
        if (roomId) {
            joinRoom();
        }
        return () => cleanup();
    }, [roomId]);

    return (
        <div className="relative w-full h-full">
            {error && (
                <Dialog open={!!error} onOpenChange={() => {}}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ошибка подключения</DialogTitle>
                        </DialogHeader>
                        <p>{error}</p>
                        {retryCount > 0 && <p>Попытка переподключения: {retryCount} из 10</p>}
                    </DialogContent>
                </Dialog>
            )}
            <VideoPlayer
                stream={remoteStream}
                videoRef={videoRef}
                muted={false}
                className="w-full h-full"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                Статус: {isConnected ? (isInRoom ? 'В комнате' : 'Подключено') : 'Отключено'}
            </div>
        </div>
    );
}