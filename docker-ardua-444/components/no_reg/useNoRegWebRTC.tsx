'use client';
import { useEffect, useRef, useState } from 'react';
import { VideoPlayer } from '@/components/webrtc/components/VideoPlayer';
import { joinRoomViaProxy } from '@/app/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NoRegWebRTCProps {
    roomId: string;
    setLeaveRoom?: (leaveRoom: () => void) => void;
    videoTransform?: string;
    setWebSocket?: (ws: WebSocket | null) => void;
    useBackCamera?: boolean;
}

interface WebSocketMessage {
    type: string;
    data?: any;
    sdp?: RTCSessionDescriptionInit;
    ice?: RTCIceCandidateInit;
    room?: string;
    username?: string;
    isLeader?: boolean;
    useBackCamera?: boolean;
    force_disconnect?: boolean;
    preferredCodec?: string;
}

export default function UseNoRegWebRTC({ roomId, setLeaveRoom, videoTransform, setWebSocket, useBackCamera }: NoRegWebRTCProps) {
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isInRoom, setIsInRoom] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [connectionState, setConnectionState] = useState<{
        ice: string | null;
        signaling: string | null;
    }>({ ice: null, signaling: null });
    const ws = useRef<WebSocket | null>(null);
    const pc = useRef<RTCPeerConnection | null>(null);
    const retryAttempts = useRef(0);
    const videoCheckTimeout = useRef<NodeJS.Timeout | null>(null);
    const connectionTimeout = useRef<NodeJS.Timeout | null>(null);
    const webRTCRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const joinMessageRetries = useRef(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const isJoining = useRef(false);
    const isReconnecting = useRef(false);
    const isConnectionStable = useRef(false);
    const username = `guest_${Math.floor(Math.random() * 1000)}`;
    const preferredCodec = 'VP8';
    const MAX_RETRIES = 5; // Уменьшено для старых устройств
    const VIDEO_CHECK_TIMEOUT = 15000; // Увеличен таймаут для медленных сетей
    const WS_TIMEOUT = 8000; // Уменьшен таймаут для быстрого обнаружения проблем
    const MAX_JOIN_MESSAGE_RETRIES = 5; // Уменьшено для старых устройств
    const [isMuted, setIsMuted] = useState<boolean>(true);
    const [flashlightState, setFlashlightState] = useState<boolean>(false);

    // Проверка платформы и браузера
    const detectPlatform = () => {
        const ua = navigator.userAgent;
        const isAndroid = /android/i.test(ua);
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isSafari = /^((?!chrome|android).)*safari/i.test(ua) || isIOS;
        const isOldAndroid = isAndroid && parseFloat(ua.match(/android\s([0-9\.]*)/i)?.[1] || '0') < 7;
        return { isIOS, isSafari, isOldAndroid, isHuawei: /huawei/i.test(ua) };
    };

    // Проверка поддержки WebSocket
    const isWebSocketSupported = () => {
        return typeof WebSocket !== 'undefined' && !!WebSocket;
    };

    // Очистка и завершение соединения
    const leaveRoom = () => {
        console.log('leaveRoom: Очистка соединения');
        if (ws.current?.readyState === WebSocket.OPEN) {
            try {
                sendWebSocketMessage({
                    type: 'leave',
                    room: roomId.replace(/-/g, ''),
                    username,
                    preferredCodec,
                });
                console.log('leaveRoom: Отправлено сообщение leave');
            } catch (e) {
                console.error('leaveRoom: Ошибка отправки leave:', e);
            }
        }

        // Очистка таймеров
        [videoCheckTimeout, connectionTimeout, webRTCRetryTimeoutRef, pingIntervalRef].forEach(ref => {
            if (ref.current) {
                clearTimeout(ref.current);
                ref.current = null;
            }
        });

        // Закрытие PeerConnection
        if (pc.current) {
            pc.current.onicecandidate = null;
            pc.current.ontrack = null;
            pc.current.oniceconnectionstatechange = null;
            pc.current.onsignalingstatechange = null;
            try {
                pc.current.close();
            } catch (e) {
                console.warn('leaveRoom: Ошибка закрытия PeerConnection:', e);
            }
            pc.current = null;
        }

        // Остановка потоков
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (e) {
                    console.warn('leaveRoom: Ошибка остановки трека:', e);
                }
            });
            setRemoteStream(null);
        }

        // Закрытие WebSocket
        if (ws.current) {
            ws.current.onmessage = null;
            ws.current.onopen = null;
            ws.current.onclose = null;
            ws.current.onerror = null;
            try {
                ws.current.close();
            } catch (e) {
                console.warn('leaveRoom: Ошибка закрытия WebSocket:', e);
            }
            ws.current = null;
        }

        // Сброс состояний
        setIsConnected(false);
        setIsInRoom(false);
        setError(null);
        setConnectionState({ ice: null, signaling: null });
        retryAttempts.current = 0;
        setRetryCount(0);
        joinMessageRetries.current = 0;
        isJoining.current = false;
        isReconnecting.current = false;
        isConnectionStable.current = false;
        if (setWebSocket) setWebSocket(null);
        console.log('leaveRoom: Очистка завершена');
    };

    useEffect(() => {
        if (setLeaveRoom) {
            setLeaveRoom(leaveRoom);
        }
    }, [setLeaveRoom]);

    // Проверка активности видео
    const startVideoCheckTimer = () => {
        if (videoCheckTimeout.current) {
            clearTimeout(videoCheckTimeout.current);
            console.log('startVideoCheckTimer: Очищен предыдущий таймер');
        }
        console.log('startVideoCheckTimer: Запуск проверки видео');
        videoCheckTimeout.current = setTimeout(() => {
            const videoElement = videoRef.current;
            const hasVideoContent = videoElement && videoElement.videoWidth > 0 && videoElement.videoHeight > 0;
            console.log('startVideoCheckTimer: Проверка видео:', {
                remoteStream: !!remoteStream,
                videoTracks: remoteStream?.getVideoTracks().length || 0,
                hasVideoContent,
                iceConnectionState: pc.current?.iceConnectionState,
            });
            if (
                isConnectionStable.current ||
                (remoteStream &&
                    remoteStream.getVideoTracks().length > 0 &&
                    remoteStream.getVideoTracks()[0]?.readyState === 'live' &&
                    hasVideoContent)
            ) {
                console.log('startVideoCheckTimer: Видео активно, переподключение не требуется');
                isConnectionStable.current = true;
            } else {
                console.warn('startVideoCheckTimer: Видео не активно, переподключение...');
                if (!isReconnecting.current) resetConnection();
            }
        }, VIDEO_CHECK_TIMEOUT);
    };

    // Подключение WebSocket с fallback
    const connectWebSocket = async (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (!isWebSocketSupported()) {
                setError('WebSocket не поддерживается вашим устройством');
                console.error('connectWebSocket: WebSocket не поддерживается');
                resolve(false);
                return;
            }

            if (ws.current?.readyState === WebSocket.OPEN) {
                console.log('connectWebSocket: WebSocket уже открыт');
                if (setWebSocket) setWebSocket(ws.current);
                resolve(true);
                return;
            }

            let retryCount = 0;
            const wsUrl = process.env.WEBSOCKET_URL_WSGO || 'wss://ardua.site:444/wsgo'; // Оставляем только основной URL

            // Функция retryOrFallback вынесена на уровень connectWebSocket
            const retryOrFallback = (event?: Event) => {
                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Экспоненциальная задержка
                    console.log(`connectWebSocket: Повторная попытка через ${delay} мс`);
                    setTimeout(() => attemptConnection(), delay);
                } else {
                    const errorMessage = event instanceof CloseEvent
                        ? `WebSocket закрыт: ${event.reason || 'код ' + event.code}`
                        : 'WebSocket закрыт: неизвестная ошибка';
                    setError(errorMessage);
                    console.error('connectWebSocket: Окончательная ошибка:', errorMessage);
                    resolve(false);
                }
            };

            const attemptConnection = () => {
                console.log(`connectWebSocket: Попытка подключения к ${wsUrl} (${retryCount + 1}/${MAX_RETRIES})`);

                try {
                    ws.current = new WebSocket(wsUrl);
                    console.log('connectWebSocket: Инициализация WebSocket...');

                    const onOpen = () => {
                        console.log('connectWebSocket: WebSocket подключен');
                        cleanupEvents();
                        setIsConnected(true);
                        setError(null);
                        if (setWebSocket) setWebSocket(ws.current);
                        pingIntervalRef.current = setInterval(() => {
                            if (ws.current?.readyState === WebSocket.OPEN) {
                                sendWebSocketMessage({ type: 'ping' });
                                console.log('connectWebSocket: Отправлен ping');
                            }
                        }, 30000);
                        resolve(true);
                    };

                    const onError = (event: Event) => {
                        console.error('connectWebSocket: Ошибка WebSocket:', event);
                        cleanupEvents();
                        retryOrFallback(event);
                    };

                    const onClose = (event: CloseEvent) => {
                        console.log('connectWebSocket: WebSocket закрыт:', event.code, event.reason);
                        cleanupEvents();
                        setIsConnected(false);
                        if (setWebSocket) setWebSocket(null);
                        retryOrFallback(event);
                    };

                    const cleanupEvents = () => {
                        if (ws.current) {
                            ws.current.removeEventListener('open', onOpen);
                            ws.current.removeEventListener('error', onError);
                            ws.current.removeEventListener('close', onClose);
                        }
                        if (connectionTimeout.current) {
                            clearTimeout(connectionTimeout.current);
                            connectionTimeout.current = null;
                        }
                    };

                    connectionTimeout.current = setTimeout(() => {
                        console.error('connectWebSocket: Таймаут подключения');
                        cleanupEvents();
                        if (ws.current && ws.current.readyState !== WebSocket.OPEN) {
                            ws.current.close();
                            ws.current = null;
                            if (setWebSocket) setWebSocket(null);
                        }
                        retryOrFallback();
                    }, WS_TIMEOUT);

                    ws.current.addEventListener('open', onOpen);
                    ws.current.addEventListener('error', onError);
                    ws.current.addEventListener('close', onClose);
                } catch (err) {
                    console.error('connectWebSocket: Ошибка создания WebSocket:', err);
                    retryOrFallback();
                }
            };

            attemptConnection();
        });
    };

    // Инициализация WebRTC
    const initializeWebRTC = async () => {
        if (pc.current) {
            console.log('initializeWebRTC: Очистка существующего PeerConnection');
            pc.current.close();
            pc.current = null;
        }

        const { isOldAndroid, isIOS, isSafari, isHuawei } = detectPlatform();
        pc.current = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    urls: 'turn:ardua.site:3478',
                    username: 'user1',
                    credential: 'pass1',
                },
            ],
            iceTransportPolicy: isOldAndroid ? 'relay' : 'all', // Для старых Android используем только TURN
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
        });

        pc.current.onsignalingstatechange = () => {
            if (!pc.current) return;
            console.log('initializeWebRTC: Состояние сигнализации:', pc.current.signalingState);
            setConnectionState(prev => ({ ...prev, signaling: pc.current?.signalingState || null }));
        };

        pc.current.oniceconnectionstatechange = () => {
            if (!pc.current) return;
            console.log('initializeWebRTC: Состояние ICE:', pc.current.iceConnectionState);
            setConnectionState(prev => ({ ...prev, ice: pc.current?.iceConnectionState || null }));
            if (
                pc.current.iceConnectionState === 'failed' ||
                pc.current.iceConnectionState === 'disconnected'
            ) {
                console.warn('initializeWebRTC: ICE прервано, переподключение...');
                if (!isReconnecting.current && !isConnectionStable.current) resetConnection();
            } else if (pc.current.iceConnectionState === 'connected') {
                console.log('initializeWebRTC: ICE соединение установлено');
                isReconnecting.current = false;
                if (remoteStream) isConnectionStable.current = true;
            }
        };

        pc.current.onicecandidate = (event) => {
            if (event.candidate && ws.current?.readyState === WebSocket.OPEN) {
                console.log('initializeWebRTC: Отправка ICE кандидата:', event.candidate);
                sendWebSocketMessage({
                    type: 'ice_candidate',
                    ice: event.candidate.toJSON(),
                    room: roomId.replace(/-/g, ''),
                    username,
                    preferredCodec,
                });
            }
        };

        pc.current.ontrack = (event) => {
            console.log('initializeWebRTC: Получен поток:', {
                streamId: event.streams[0]?.id,
                videoTracks: event.streams[0]?.getVideoTracks().length,
            });
            if (event.streams && event.streams[0]) {
                const stream = event.streams[0];
                const newRemoteStream = new MediaStream();
                stream.getTracks().forEach(track => {
                    newRemoteStream.addTrack(track);
                    console.log(`initializeWebRTC: Добавлен ${track.kind} трек:`, track.id);
                    if (track.kind === 'audio') track.enabled = !isMuted;
                });
                setRemoteStream(newRemoteStream);
                setIsInRoom(true);
                startVideoCheckTimer();
            } else {
                console.warn('initializeWebRTC: Пустой поток');
                startVideoCheckTimer();
            }
        };
    };

    // Отправка сообщений WebSocket
    const sendWebSocketMessage = (message: WebSocketMessage) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            console.log('sendWebSocketMessage: Отправка:', message);
            ws.current.send(JSON.stringify(message));
        } else {
            console.error('sendWebSocketMessage: WebSocket не открыт:', message);
        }
    };

    // Обработка сообщений WebSocket
    const setupWebSocketListeners = () => {
        if (!ws.current) return;

        ws.current.onmessage = async (event) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data);
                console.log('setupWebSocketListeners: Получено:', data);

                switch (data.type.toLowerCase()) {
                    case 'room_info':
                        console.log('setupWebSocketListeners: Пользователь в комнате');
                        setIsInRoom(true);
                        joinMessageRetries.current = 0;
                        startVideoCheckTimer();
                        break;

                    case 'offer':
                        if (pc.current && data.sdp) {
                            console.log('setupWebSocketListeners: Получен offer:', data.sdp);
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
                            console.log('setupWebSocketListeners: Отправлен answer:', answer);
                        }
                        break;

                    case 'ice_candidate':
                        if (pc.current && data.ice) {
                            console.log('setupWebSocketListeners: Добавление ICE кандидата:', data.ice);
                            await pc.current.addIceCandidate(new RTCIceCandidate(data.ice));
                        }
                        break;

                    case 'error':
                        console.error('setupWebSocketListeners: Ошибка сервера:', data.data);
                        setError(`Ошибка сервера: ${data.data || 'Неизвестная ошибка'}`);
                        if (data.data === 'Room does not exist. Leader must join first.') {
                            if (retryAttempts.current < MAX_RETRIES) {
                                console.log('setupWebSocketListeners: Комната не существует, повтор через 5 сек');
                                webRTCRetryTimeoutRef.current = setTimeout(() => {
                                    retryAttempts.current += 1;
                                    setRetryCount(retryAttempts.current);
                                    if (!isReconnecting.current && !isConnectionStable.current) resetConnection();
                                }, 5000);
                            } else {
                                setError('Лидер не в комнате');
                            }
                        } else if (joinMessageRetries.current < MAX_JOIN_MESSAGE_RETRIES) {
                            joinMessageRetries.current += 1;
                            console.log(`setupWebSocketListeners: Повтор join (${joinMessageRetries.current}/${MAX_JOIN_MESSAGE_RETRIES})`);
                            sendWebSocketMessage({
                                type: 'join',
                                room: roomId.replace(/-/g, ''),
                                username,
                                isLeader: false,
                                preferredCodec,
                            });
                        } else {
                            setError(`Ошибка подключения: ${data.data}`);
                            if (!isConnectionStable.current) resetConnection();
                        }
                        break;

                    case 'force_disconnect':
                        console.log('setupWebSocketListeners: Принудительное отключение');
                        setError('Отключен: другой пользователь подключился');
                        leaveRoom();
                        break;

                    case 'pong':
                        console.log('setupWebSocketListeners: Получен pong');
                        break;

                    case 'camera_switched':
                        console.log('setupWebSocketListeners: Камера переключена:', data.data.useBackCamera);
                        break;

                    case 'flashlight_toggled':
                        console.log('setupWebSocketListeners: Фонарик:', data.data.isOn ? 'вкл' : 'выкл');
                        setFlashlightState(data.data.isOn);
                        break;

                    default:
                        console.warn('setupWebSocketListeners: Неизвестный тип:', data.type);
                }
            } catch (err) {
                console.error('setupWebSocketListeners: Ошибка обработки:', err);
                setError('Ошибка обработки сообщения');
            }
        };
    };

    // Подключение к комнате
    const joinRoom = async () => {
        if (isJoining.current) {
            console.log('joinRoom: Уже выполняется, пропуск');
            return;
        }
        isJoining.current = true;
        console.log('joinRoom: Начало подключения');
        leaveRoom();
        setError(null);
        joinMessageRetries.current = 0;

        try {
            const normalizedRoomId = roomId.replace(/-/g, '');
            console.log('joinRoom: Отправка joinRoomViaProxy:', normalizedRoomId);
            const response = await joinRoomViaProxy(normalizedRoomId);
            if ('error' in response) {
                throw new Error(response.error);
            }
            const { roomId: targetRoomId } = response;
            console.log('joinRoom: Получен targetRoomId:', targetRoomId);

            if (!(await connectWebSocket())) {
                throw new Error('Не удалось подключиться к WebSocket');
            }

            await new Promise(resolve => setTimeout(resolve, 1000)); // Увеличена задержка для старых устройств
            console.log('joinRoom: Задержка завершена');

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
                        console.log('joinRoom: Получено:', data);
                        if (data.type === 'room_info') {
                            console.log('joinRoom: Успешно подключено');
                            cleanupEvents();
                            setIsInRoom(true);
                            resolve();
                        } else if (data.type === 'error') {
                            console.error('joinRoom: Ошибка:', data.data);
                            setError(`Ошибка ${data.error}: ${data.message}`);
                            cleanupEvents();
                            if (joinMessageRetries.current < MAX_JOIN_MESSAGE_RETRIES) {
                                joinMessageRetries.current += 1;
                                console.log(`joinRoom: Повтор join (${joinMessageRetries.current}/${MAX_JOIN_MESSAGE_RETRIES})`);
                                sendWebSocketMessage({
                                    type: 'join',
                                    room: targetRoomId,
                                    username,
                                    isLeader: false,
                                    preferredCodec,
                                });
                            } else {
                                reject(new Error(data.data));
                            }
                        }
                    } catch (err) {
                        console.error('joinRoom: Ошибка обработки:', err);
                        cleanupEvents();
                        setError('Ошибка обработки сообщения');
                        reject(err);
                    }
                };

                const cleanupEvents = () => {
                    if (ws.current) ws.current.removeEventListener('message', onMessage);
                    if (connectionTimeout.current) {
                        clearTimeout(connectionTimeout.current);
                        connectionTimeout.current = null;
                    }
                };

                ws.current.addEventListener('message', onMessage);

                sendWebSocketMessage({
                    type: 'join',
                    room: targetRoomId,
                    username,
                    isLeader: false,
                    preferredCodec,
                });
                console.log('joinRoom: Отправлен join:', { room: targetRoomId, username });

                if (useBackCamera !== undefined) {
                    sendWebSocketMessage({
                        type: 'switch_camera',
                        useBackCamera,
                        room: targetRoomId,
                        username,
                    });
                    console.log('joinRoom: Отправлена команда switch_camera:', { useBackCamera });
                }
            });

            startVideoCheckTimer();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('joinRoom: Ошибка:', errorMessage);
            setError(`Ошибка подключения: ${errorMessage}`);
            if (retryAttempts.current < MAX_RETRIES && !isConnectionStable.current) {
                console.log('joinRoom: Планируем повтор через 5 сек');
                webRTCRetryTimeoutRef.current = setTimeout(() => {
                    retryAttempts.current += 1;
                    setRetryCount(retryAttempts.current);
                    if (!isReconnecting.current && !isConnectionStable.current) resetConnection();
                }, 5000);
            } else {
                setError(`Не удалось подключиться после ${MAX_RETRIES} попыток: ${errorMessage}`);
            }
        } finally {
            isJoining.current = false;
            console.log('joinRoom: Завершено, isJoining сброшено');
        }
    };

    // Переподключение
    const lastRetryTimestamp = useRef(0);
    const resetConnection = () => {
        const now = Date.now();
        if (isReconnecting.current || now - lastRetryTimestamp.current < 5000) {
            console.log('resetConnection: Переподключение уже выполняется или слишком рано');
            return;
        }
        lastRetryTimestamp.current = now;
        if (isConnectionStable.current) {
            console.log('resetConnection: Соединение стабильно, переподключение запрещено');
            return;
        }
        isReconnecting.current = true;
        console.log('resetConnection: Переподключение...');
        joinRoom();
    };

    useEffect(() => {
        if (roomId && !isJoining.current) {
            console.log('useEffect: Инициация подключения к комнате:', roomId);
            joinRoom();
        }
        return () => {
            console.log('useEffect: Очистка при размонтировании');
            leaveRoom();
        };
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
                        {retryCount > 0 && <p>Попытка переподключения: {retryCount} из {MAX_RETRIES}</p>}
                    </DialogContent>
                </Dialog>
            )}
            <VideoPlayer
                stream={remoteStream}
                videoRef={videoRef}
                muted={isMuted}
                className="w-full h-full"
                transform={videoTransform}
            />
        </div>
    );
}