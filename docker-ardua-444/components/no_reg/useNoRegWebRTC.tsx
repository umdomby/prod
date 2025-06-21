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
    const isJoining = useRef(false); // Флаг для предотвращения параллельных joinRoom
    const username = `guest_${Math.floor(Math.random() * 1000)}`;
    const preferredCodec = 'VP8';
    const MAX_RETRIES = 10;
    const VIDEO_CHECK_TIMEOUT = 12000; // Увеличили до 12 сек
    const WS_TIMEOUT = 5000; // Синхронизировали с useWebRTC.ts

    // Проверка платформы
    const detectPlatform = () => {
        const ua = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isSafari = /^((?!chrome|android).)*safari/i.test(ua) || isIOS;
        return { isIOS, isSafari, isHuawei: /huawei/i.test(ua) };
    };

    const leaveRoom = () => {
        console.log('Выполняется leaveRoom');
        if (ws.current?.readyState === WebSocket.OPEN) {
            try {
                sendWebSocketMessage({
                    type: 'leave',
                    room: roomId.replace(/-/g, ''),
                    username,
                    preferredCodec,
                });
                console.log('Отправлено сообщение leave:', { type: 'leave', room: roomId.replace(/-/g, ''), username, preferredCodec });
            } catch (e) {
                console.error('Ошибка отправки сообщения leave:', e);
            }
        }

        if (videoCheckTimeout.current) clearTimeout(videoCheckTimeout.current);
        if (connectionTimeout.current) clearTimeout(connectionTimeout.current);
        if (webRTCRetryTimeoutRef.current) clearTimeout(webRTCRetryTimeoutRef.current);

        if (pc.current) {
            pc.current.onicecandidate = null;
            pc.current.ontrack = null;
            pc.current.oniceconnectionstatechange = null;
            try {
                pc.current.close();
            } catch (e) {
                console.warn('Ошибка при закрытии PeerConnection:', e);
            }
            pc.current = null;
        }

        if (remoteStream) {
            remoteStream.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (e) {
                    console.warn('Ошибка при остановке трека:', e);
                }
            });
            setRemoteStream(null);
        }

        if (ws.current) {
            ws.current.onmessage = null;
            ws.current.onopen = null;
            ws.current.onclose = null;
            ws.current.onerror = null;
            try {
                ws.current.close();
            } catch (e) {
                console.warn('Ошибка при закрытии WebSocket:', e);
            }
            ws.current = null;
        }

        setIsConnected(false);
        setIsInRoom(false);
        setError(null);
        retryAttempts.current = 0;
        setRetryCount(0);
        isJoining.current = false;
    };

    const startVideoCheckTimer = () => {
        if (videoCheckTimeout.current) {
            clearTimeout(videoCheckTimeout.current);
            console.log('Очищен предыдущий таймер проверки видео');
        }
        console.log('Запуск таймера проверки видео');
        videoCheckTimeout.current = setTimeout(() => {
            const videoElement = videoRef.current;
            const hasVideoContent = videoElement && videoElement.videoWidth > 0 && videoElement.videoHeight > 0;
            console.log('Проверка видео:', {
                remoteStream: !!remoteStream,
                videoTracks: remoteStream?.getVideoTracks().length || 0,
                firstTrackEnabled: remoteStream?.getVideoTracks()[0]?.enabled,
                firstTrackReadyState: remoteStream?.getVideoTracks()[0]?.readyState,
                hasVideoContent,
            });
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
                console.log('WebSocket уже открыт');
                resolve(true);
                return;
            }

            let retryCount = 0;
            const maxRetries = 3;

            const attemptConnection = () => {
                try {
                    ws.current = new WebSocket(process.env.WEBSOCKET_URL_WSGO || 'wss://ardua.site:444/wsgo');
                    console.log('Инициализация WebSocket...');

                    const onOpen = () => {
                        console.log('WebSocket успешно подключен');
                        cleanupEvents();
                        setIsConnected(true);
                        setError(null);
                        resolve(true);
                    };

                    const onError = (event: Event) => {
                        console.error('Ошибка WebSocket:', event);
                        cleanupEvents();
                        if (retryCount < maxRetries) {
                            retryCount++;
                            console.log(`Повторная попытка подключения WebSocket (${retryCount}/${maxRetries})`);
                            setTimeout(attemptConnection, 2000);
                        } else {
                            setError('Ошибка подключения к WebSocket');
                            resolve(false);
                        }
                    };

                    const onClose = (event: CloseEvent) => {
                        console.log('WebSocket закрыт:', event.code, event.reason);
                        cleanupEvents();
                        setIsConnected(false);
                        if (retryCount < maxRetries) {
                            retryCount++;
                            console.log(`Повторная попытка подключения WebSocket (${retryCount}/${maxRetries})`);
                            setTimeout(attemptConnection, 2000);
                        } else {
                            setError(event.code !== 1000 ? `WebSocket закрыт: ${event.reason || 'код ' + event.code}` : null);
                            resolve(false);
                        }
                    };

                    const cleanupEvents = () => {
                        ws.current?.removeEventListener('open', onOpen);
                        ws.current?.removeEventListener('error', onError);
                        ws.current?.removeEventListener('close', onClose);
                        if (connectionTimeout.current) {
                            clearTimeout(connectionTimeout.current);
                        }
                    };

                    connectionTimeout.current = setTimeout(() => {
                        console.error('Таймаут подключения WebSocket');
                        cleanupEvents();
                        if (ws.current) {
                            ws.current.close();
                            ws.current = null;
                        }
                        if (retryCount < maxRetries) {
                            retryCount++;
                            console.log(`Повторная попытка подключения WebSocket (${retryCount}/${maxRetries})`);
                            setTimeout(attemptConnection, 2000);
                        } else {
                            setError('Таймаут подключения WebSocket');
                            resolve(false);
                        }
                    }, WS_TIMEOUT);

                    ws.current.addEventListener('open', onOpen);
                    ws.current.addEventListener('error', onError);
                    ws.current.addEventListener('close', onClose);
                } catch (err) {
                    console.error('Ошибка создания WebSocket:', err);
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`Повторная попытка подключения WebSocket (${retryCount}/${maxRetries})`);
                        setTimeout(attemptConnection, 2000);
                    } else {
                        setError('Не удалось создать WebSocket');
                        resolve(false);
                    }
                }
            };

            attemptConnection();
        });
    };

    const initializeWebRTC = async () => {
        if (pc.current) {
            console.log('PeerConnection уже существует, очищаем...');
            pc.current.close();
            pc.current = null;
        }

        const { isIOS, isSafari, isHuawei } = detectPlatform();
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
            iceTransportPolicy: 'all',
            sdpSemantics: 'unified-plan',
        });

        // Платформенные проверки ICE
        if (isIOS || isSafari || isHuawei) {
            pc.current.oniceconnectionstatechange = () => {
                if (!pc.current) return;
                console.log(`${isHuawei ? 'Huawei' : 'iOS/Safari'} ICE состояние:`, pc.current.iceConnectionState);
                if (
                    pc.current.iceConnectionState === 'disconnected' ||
                    pc.current.iceConnectionState === 'failed'
                ) {
                    console.log(`${isHuawei ? 'Huawei' : 'iOS/Safari'}: ICE прервано, переподключение...`);
                    resetConnection();
                } else if (pc.current.iceConnectionState === 'connected') {
                    console.log('ICE соединение установлено');
                }
            };
        }

        pc.current.onicecandidate = (event) => {
            if (event.candidate && ws.current?.readyState === WebSocket.OPEN) {
                console.log('Отправка ICE кандидата:', event.candidate);
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
            console.log('Получен поток в ontrack:', {
                streamId: event.streams[0]?.id,
                videoTracks: event.streams[0]?.getVideoTracks().length,
                audioTracks: event.streams[0]?.getAudioTracks().length,
                videoTrackEnabled: event.streams[0]?.getVideoTracks()[0]?.enabled,
                videoTrackReadyState: event.streams[0]?.getVideoTracks()[0]?.readyState,
            });
            if (event.streams && event.streams[0]) {
                const stream = event.streams[0];
                const newRemoteStream = new MediaStream();
                stream.getTracks().forEach(track => {
                    newRemoteStream.addTrack(track);
                    console.log(`Добавлен ${track.kind} трек в remoteStream:`, track.id);
                });
                setRemoteStream(newRemoteStream);
                setIsInRoom(true);
                if (videoCheckTimeout.current) {
                    clearTimeout(videoCheckTimeout.current);
                    console.log('Таймер проверки видео очищен');
                }
                startVideoCheckTimer();
            } else {
                console.warn('Получен пустой поток в ontrack');
                startVideoCheckTimer();
            }
        };

        pc.current.oniceconnectionstatechange = () => {
            if (!pc.current) return;
            console.log('Состояние ICE:', pc.current.iceConnectionState);
            if (
                pc.current.iceConnectionState === 'failed' ||
                pc.current.iceConnectionState === 'disconnected'
            ) {
                console.warn('ICE соединение прервано, переподключение...');
                resetConnection();
            } else if (pc.current.iceConnectionState === 'connected') {
                console.log('ICE соединение установлено');
            }
        };
    };

    const sendWebSocketMessage = (message: WebSocketMessage) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            console.log('Отправка WebSocket-сообщения:', message);
            ws.current.send(JSON.stringify(message));
        } else {
            console.error('WebSocket не открыт для отправки:', message);
        }
    };

    const setupWebSocketListeners = () => {
        if (!ws.current) return;

        ws.current.onmessage = async (event) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data);
                console.log('Получено сообщение:', JSON.stringify(data, null, 2));

                switch (data.type) {
                    case 'room_info':
                        console.log('Получено room_info, пользователь в комнате');
                        setIsInRoom(true);
                        startVideoCheckTimer();
                        break;

                    case 'offer':
                        if (pc.current && data.sdp) {
                            console.log('Получен offer:', data.sdp);
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
                            console.log('Отправлен answer:', answer);
                        }
                        break;

                    case 'ice_candidate':
                        if (pc.current && data.ice) {
                            console.log('Добавление ICE кандидата:', data.ice);
                            await pc.current.addIceCandidate(new RTCIceCandidate(data.ice));
                        }
                        break;

                    case 'error':
                        console.error('Ошибка от сервера:', data.data);
                        setError(data.data || 'Ошибка сервера');
                        if (data.data === 'Room does not exist. Leader must join first.') {
                            if (retryAttempts.current < MAX_RETRIES) {
                                console.log('Комната не существует, повторная попытка через 5 секунд');
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
                        console.log('Принудительное отключение');
                        setError('Отключен: другой пользователь подключился');
                        leaveRoom();
                        break;

                    default:
                        console.warn('Неизвестный тип сообщения:', data.type);
                }
            } catch (err) {
                console.error('Ошибка обработки сообщения:', err);
                setError('Ошибка обработки сообщения');
            }
        };
    };

    const joinRoom = async () => {
        if (isJoining.current) {
            console.log('joinRoom уже выполняется, пропускаем...');
            return;
        }
        isJoining.current = true;
        console.log('Запуск joinRoom, полная очистка перед новым соединением');
        leaveRoom();
        setError(null);

        try {
            const normalizedRoomId = roomId.replace(/-/g, '');
            console.log('Отправка joinRoomViaProxy с roomId:', normalizedRoomId);
            const response = await joinRoomViaProxy(normalizedRoomId);
            if ('error' in response) {
                throw new Error(response.error);
            }
            const { roomId: targetRoomId } = response;
            console.log('Получен targetRoomId:', targetRoomId);

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

                const onMessage = (event: MessageEvent) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Получено сообщение в joinRoom:', JSON.stringify(data, null, 2));
                        if (data.type === 'room_info') {
                            console.log('Успешно подключено к комнате');
                            cleanupEvents();
                            setIsInRoom(true);
                            resolve();
                        } else if (data.type === 'error') {
                            console.error('Ошибка при подключении:', data.data);
                            cleanupEvents();
                            setError(data.data);
                            reject(new Error(data.data));
                        }
                    } catch (err) {
                        console.error('Ошибка обработки сообщения:', err);
                        cleanupEvents();
                        setError('Ошибка обработки сообщения');
                        reject(err);
                    }
                };

                const cleanupEvents = () => {
                    ws.current?.removeEventListener('message', onMessage);
                    if (connectionTimeout.current) {
                        clearTimeout(connectionTimeout.current);
                        connectionTimeout.current = null;
                    }
                };

                connectionTimeout.current = setTimeout(() => {
                    cleanupEvents();
                    console.error('Таймаут ожидания ответа от сервера');
                    setError('Таймаут ожидания ответа от сервера');
                    reject(new Error('Таймаут ожидания ответа от сервера'));
                }, WS_TIMEOUT);

                ws.current.addEventListener('message', onMessage);

                sendWebSocketMessage({
                    type: 'join',
                    room: targetRoomId,
                    username,
                    isLeader: false,
                    preferredCodec,
                });
                console.log('Отправлен запрос на подключение:', {
                    action: 'join',
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
                console.log('Планируем повторную попытку через 5 секунд');
                webRTCRetryTimeoutRef.current = setTimeout(() => {
                    retryAttempts.current += 1;
                    setRetryCount(retryAttempts.current);
                    joinRoom();
                }, 5000);
            }
        } finally {
            isJoining.current = false;
        }
    };

    const resetConnection = () => {
        console.log('Переподключение WebRTC...');
        joinRoom();
    };

    useEffect(() => {
        if (roomId && !isJoining.current) {
            joinRoom();
        }
        return () => leaveRoom();
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