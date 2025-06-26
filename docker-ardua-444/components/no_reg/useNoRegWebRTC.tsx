// file: docker-ardua-444/components/no_reg/useNoRegWebRTC.tsx
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
    mediaType?: 'none' | 'audio' | 'audio-video';
    setIsCameraEnabled?: (enabled: boolean) => void; // Новый пропс
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

export default function UseNoRegWebRTC({ roomId, setLeaveRoom, videoTransform, setWebSocket, useBackCamera, mediaType = 'none', setIsCameraEnabled }: NoRegWebRTCProps) {
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isInRoom, setIsInRoom] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [connectionState, setConnectionState] = useState<{
        ice: string | null;
        signaling: string | null;
    }>({ ice: null, signaling: null });
    const [isCameraEnabled, setIsCameraEnabledState] = useState(false); // Переименовано для избежания конфликта
    const [isMuted, setIsMuted] = useState<boolean>(true);
    const [flashlightState, setFlashlightState] = useState<boolean>(false);
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
    const MAX_RETRIES = 10;
    const VIDEO_CHECK_TIMEOUT = 12000;
    const WS_TIMEOUT = 10000;
    const MAX_JOIN_MESSAGE_RETRIES = 10;

    // Синхронизация isCameraEnabled с родительским компонентом
    const setCameraEnabled = (enabled: boolean) => {
        setIsCameraEnabledState(enabled);
        if (setIsCameraEnabled) {
            setIsCameraEnabled(enabled);
        }
    };

    const detectPlatform = () => {
        const ua = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isSafari = /^((?!chrome|android).)*safari/i.test(ua) || isIOS;
        return { isIOS, isSafari, isHuawei: /huawei/i.test(ua) };
    };

    const getVideoConstraints = () => {
        const { isHuawei, isSafari, isIOS } = detectPlatform();
        if (isHuawei) {
            return {
                width: { ideal: 480, max: 640 },
                height: { ideal: 360, max: 480 },
                frameRate: { ideal: 20, max: 24 },
                facingMode: useBackCamera ? 'environment' : 'user',
                resizeMode: 'crop-and-scale'
            };
        }

        const baseConstraints = {
            width: { ideal: isIOS ? 640 : 1280 },
            height: { ideal: isIOS ? 480 : 720 },
            frameRate: { ideal: isIOS ? 24 : 30 },
            facingMode: useBackCamera ? 'environment' : 'user'
        };

        if (isSafari || isIOS) {
            return {
                ...baseConstraints,
                frameRate: { ideal: 24 },
                advanced: [
                    { frameRate: { max: 24 } },
                    { width: { max: 640 }, height: { max: 480 } }
                ]
            };
        }

        return baseConstraints;
    };

    const configureVideoSender = (sender: RTCRtpSender) => {
        const { isHuawei } = detectPlatform();
        if (isHuawei && sender.track?.kind === 'video') {
            const parameters = sender.getParameters();
            if (!parameters.encodings) {
                parameters.encodings = [{}];
            }
            parameters.encodings[0] = {
                ...parameters.encodings[0],
                maxBitrate: 300000,
                scaleResolutionDownBy: 1,
                maxFramerate: 15,
                priority: 'high',
                networkPriority: 'high'
            };
            try {
                sender.setParameters(parameters);
            } catch (err) {
                console.error('Ошибка настройки параметров видео:', err);
            }
        }
    };

    const toggleMicrophone = (mute: boolean) => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !mute;
                console.log(`Аудиотрек ${track.id} установлен в enabled=${track.enabled}`);
            });
        }
        setIsMuted(mute);
    };

    const enableCamera = async (muteLocalAudio: boolean) => {
        if (isCameraEnabled) {
            console.log('Камера уже включена');
            return;
        }
        try {
            const constraints = {
                video: getVideoConstraints(),
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Получен медиапоток:', {
                videoTracks: mediaStream.getVideoTracks().length,
                audioTracks: mediaStream.getAudioTracks().length,
                videoTrackEnabled: mediaStream.getVideoTracks()[0]?.enabled,
                videoTrackReadyState: mediaStream.getVideoTracks()[0]?.readyState
            });

            mediaStream.getAudioTracks().forEach(track => {
                track.enabled = !muteLocalAudio;
                console.log(`Аудиотрек ${track.id} установлен в enabled=${track.enabled}`);
            });

            // Очищаем старый локальный поток, если он существует
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    track.stop();
                    if (pc.current) {
                        const sender = pc.current.getSenders().find(s => s.track === track);
                        if (sender) {
                            pc.current.removeTrack(sender);
                        }
                    }
                });
            }

            setLocalStream(mediaStream);
            if (pc.current) {
                mediaStream.getTracks().forEach(track => {
                    const sender = pc.current!.getSenders().find(s => s.track?.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        pc.current!.addTrack(track, mediaStream);
                    }
                    if (track.kind === 'video') {
                        configureVideoSender(pc.current!.getSenders().find(s => s.track === track)!);
                    }
                });
            }

            if (pc.current && isInRoom) {
                try {
                    const offer = await pc.current.createOffer({
                        offerToReceiveAudio: true,
                        offerToReceiveVideo: true
                    });
                    await pc.current.setLocalDescription(offer);
                    sendWebSocketMessage({
                        type: 'offer',
                        sdp: offer,
                        room: roomId.replace(/-/g, ''),
                        username,
                        preferredCodec
                    });
                    console.log('Отправлен новый offer для пересогласования:', offer);
                } catch (err) {
                    console.error('Ошибка при создании offer для пересогласования:', err);
                    setError('Ошибка пересогласования WebRTC');
                }
            }

            setCameraEnabled(true); // Обновляем состояние
            console.log('Камера и микрофон успешно включены');
        } catch (err) {
            console.error('Ошибка включения камеры и микрофона:', err);
            setError(`Ошибка включения медиа: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const disableCamera = async () => {
        if (!isCameraEnabled || !localStream) {
            console.log('Камера и микрофон уже отключены или локальный поток отсутствует');
            return;
        }
        try {
            localStream.getTracks().forEach(track => {
                track.enabled = false;
                track.stop();
                console.log(`Трек ${track.kind} (${track.id}) отключен и остановлен: enabled=${track.enabled}`);
            });

            if (pc.current) {
                pc.current.getSenders().forEach(sender => {
                    if (sender.track) {
                        sender.replaceTrack(null);
                        console.log(`${sender.track.kind} трек удалён из PeerConnection`);
                    }
                });

                if (isInRoom) {
                    try {
                        const offer = await pc.current.createOffer({
                            offerToReceiveAudio: true,
                            offerToReceiveVideo: true
                        });
                        await pc.current.setLocalDescription(offer);
                        sendWebSocketMessage({
                            type: 'offer',
                            sdp: offer,
                            room: roomId.replace(/-/g, ''),
                            username,
                            preferredCodec
                        });
                        console.log('Отправлен новый offer для пересогласования после отключения:', offer);
                    } catch (err) {
                        console.error('Ошибка при создании offer для пересогласования:', err);
                        setError('Ошибка пересогласования WebRTC');
                    }
                }
            }

            setLocalStream(null);
            setCameraEnabled(false); // Обновляем состояние
            console.log('Камера и микрофон успешно отключены');
        } catch (err) {
            console.error('Ошибка отключения камеры и микрофона:', err);
            setError(`Ошибка отключения медиа: ${err instanceof Error ? err.message : String(err)}`);
        }
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
                console.log('Отправлено leave сообщение:', { type: 'leave', room: roomId.replace(/-/g, ''), username, preferredCodec });
            } catch (e) {
                console.error('Ошибка отправки leave сообщения:', e);
            }
        }

        if (videoCheckTimeout.current) clearTimeout(videoCheckTimeout.current);
        if (connectionTimeout.current) clearTimeout(connectionTimeout.current);
        if (webRTCRetryTimeoutRef.current) clearTimeout(webRTCRetryTimeoutRef.current);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
                console.log(`Локальный трек ${track.kind} (${track.id}) остановлен`);
            });
            setLocalStream(null);
        }

        if (pc.current) {
            pc.current.onicecandidate = null;
            pc.current.ontrack = null;
            pc.current.oniceconnectionstatechange = null;
            pc.current.onsignalingstatechange = null;
            try {
                pc.current.close();
            } catch (e) {
                console.warn('Ошибка закрытия PeerConnection:', e);
            }
            pc.current = null;
        }

        if (remoteStream) {
            remoteStream.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (e) {
                    console.warn('Ошибка остановки трека:', e);
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
                console.warn('Ошибка закрытия WebSocket:', e);
            }
            ws.current = null;
        }

        setIsConnected(false);
        setIsInRoom(false);
        setCameraEnabled(false); // Сбрасываем состояние камеры
        setError(null);
        setConnectionState({ ice: null, signaling: null });
        retryAttempts.current = 0;
        setRetryCount(0);
        joinMessageRetries.current = 0;
        isJoining.current = false;
        isReconnecting.current = false;
        isConnectionStable.current = false;
        if (setWebSocket) setWebSocket(null);
        if (setLeaveRoom) setLeaveRoom(leaveRoom); // Передаем leaveRoom в родительский компонент
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
            iceTransportPolicy: 'all'
        });

        if (mediaType === 'audio' || mediaType === 'audio-video') {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: mediaType === 'audio-video' ? getVideoConstraints() : false,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            setLocalStream(stream);
            stream.getTracks().forEach(track => {
                pc.current?.addTrack(track, stream);
                console.log(`Добавлен ${track.kind} трек в PeerConnection:`, track.id);
                if (track.kind === 'video') {
                    configureVideoSender(pc.current!.getSenders().find(s => s.track === track)!);
                }
            });
            setCameraEnabled(true); // Устанавливаем при инициализации
        } else {
            setCameraEnabled(false); // Устанавливаем при отсутствии медиа
        }

        pc.current.onsignalingstatechange = () => {
            if (!pc.current) return;
            console.log('Состояние сигнализации:', pc.current.signalingState);
            setConnectionState(prev => ({ ...prev, signaling: pc.current?.signalingState || null }));
        };

        if (isIOS || isSafari || isHuawei) {
            pc.current.oniceconnectionstatechange = () => {
                if (!pc.current) return;
                console.log(`${isHuawei ? 'Huawei' : 'iOS/Safari'} ICE состояние:`, pc.current.iceConnectionState);
                setConnectionState(prev => ({ ...prev, ice: pc.current?.iceConnectionState || null }));
                if (
                    pc.current.iceConnectionState === 'disconnected' ||
                    pc.current.iceConnectionState === 'failed'
                ) {
                    console.log(`${isHuawei ? 'Huawei' : 'iOS/Safari'}: ICE прервано, проверяем переподключение...`);
                    if (!isReconnecting.current && !isConnectionStable.current) {
                        resetConnection();
                    }
                } else if (pc.current.iceConnectionState === 'connected') {
                    console.log('ICE соединение установлено');
                    isReconnecting.current = false;
                    if (remoteStream) isConnectionStable.current = true;
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
                    if (track.kind === 'audio') {
                        track.enabled = !isMuted;
                    }
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
            setConnectionState(prev => ({ ...prev, ice: pc.current?.iceConnectionState || null }));
            if (
                pc.current.iceConnectionState === 'failed' ||
                pc.current.iceConnectionState === 'disconnected'
            ) {
                console.warn('ICE соединение прервано, проверяем переподключение...');
                if (!isReconnecting.current && !isConnectionStable.current) {
                    resetConnection();
                }
            } else if (pc.current.iceConnectionState === 'connected') {
                console.log('ICE соединение установлено');
                isReconnecting.current = false;
                if (remoteStream) isConnectionStable.current = true;
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

                switch (data.type.toLowerCase()) {
                    case 'room_info':
                        console.log('Получено room_info, пользователь в комнате');
                        setIsInRoom(true);
                        joinMessageRetries.current = 0;
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
                        console.error('Ошибка сервера:', data.data);
                        setError(`Ошибка сервера: ${data.data || 'Неизвестная ошибка'}`);
                        if (data.data === 'Room does not exist. Leader must join first.') {
                            if (retryAttempts.current < MAX_RETRIES) {
                                console.log('Комната не существует, повторная попытка через 5 секунд');
                                webRTCRetryTimeoutRef.current = setTimeout(() => {
                                    retryAttempts.current += 1;
                                    setRetryCount(retryAttempts.current);
                                    if (!isReconnecting.current && !isConnectionStable.current) {
                                        resetConnection();
                                    }
                                }, 5000);
                            } else {
                                setError('Не удалось подключиться: лидер не в комнате');
                            }
                        } else if (joinMessageRetries.current < MAX_JOIN_MESSAGE_RETRIES) {
                            joinMessageRetries.current += 1;
                            console.log(`Повторная отправка join сообщения (${joinMessageRetries.current}/${MAX_JOIN_MESSAGE_RETRIES})`);
                            sendWebSocketMessage({
                                type: 'join',
                                room: roomId.replace(/-/g, ''),
                                username,
                                isLeader: false,
                                preferredCodec,
                            });
                        } else {
                            setError(`Не удалось подключиться к комнате: ${data.data}`);
                            if (!isConnectionStable.current) resetConnection();
                        }
                        break;

                    case 'force_disconnect':
                        console.log('Принудительное отключение');
                        setError('Отключен: другой пользователь подключился');
                        leaveRoom();
                        break;

                    case 'pong':
                        console.log('Получен pong, WebSocket жив');
                        break;

                    case 'camera_switched':
                        console.log('Камера переключена на:', data.data.useBackCamera ? 'заднюю' : 'фронтальную');
                        if (data.data.useBackCamera !== undefined) {
                            console.log('Подтверждение переключения камеры:', data.data.useBackCamera);
                        }
                        break;

                    case 'flashlight_toggled':
                        console.log('Фонарик:', data.data.isOn ? 'включен' : 'выключен');
                        setFlashlightState(data.data.isOn);
                        break;

                    default:
                        console.warn('Неизвестный тип сообщения:', data.type);
                }
            } catch (err) {
                console.error('Ошибка обработки сообщения:', err);
                setError('Ошибка обработки сообщения сервера');
            }
        };
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
                iceConnectionState: pc.current?.iceConnectionState,
                signalingState: pc.current?.signalingState,
            });
            if (
                isConnectionStable.current ||
                (remoteStream &&
                    remoteStream.getVideoTracks().length > 0 &&
                    remoteStream.getVideoTracks()[0]?.enabled &&
                    remoteStream.getVideoTracks()[0]?.readyState === 'live' &&
                    hasVideoContent) ||
                pc.current?.iceConnectionState === 'connected' ||
                pc.current?.iceConnectionState === 'checking' ||
                ws.current?.readyState === WebSocket.OPEN
            ) {
                console.log('Соединение стабильно или видео активно, переподключение не требуется');
                if (pc.current?.iceConnectionState === 'connected' && hasVideoContent) {
                    isConnectionStable.current = true;
                }
            } else {
                console.warn('Видео не получено и соединение не активно, переподключение...');
                resetConnection();
            }
        }, VIDEO_CHECK_TIMEOUT);
    };

    const connectWebSocket = async (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                console.log('WebSocket уже открыт');
                if (setWebSocket) setWebSocket(ws.current);
                resolve(true);
                return;
            }

            let retryCount = 0;
            const maxRetries = 10;

            const attemptConnection = () => {
                console.log(`Попытка подключения WebSocket ${retryCount + 1}/${maxRetries + 1}`);
                try {
                    ws.current = new WebSocket(process.env.WEBSOCKET_URL_WSGO || 'wss://ardua.site:444/wsgo');
                    console.log('Инициализация WebSocket...');

                    const onOpen = () => {
                        console.log('WebSocket успешно подключен');
                        cleanupEvents();
                        setIsConnected(true);
                        setError(null);
                        if (setWebSocket) setWebSocket(ws.current);
                        pingIntervalRef.current = setInterval(() => {
                            if (ws.current?.readyState === WebSocket.OPEN) {
                                sendWebSocketMessage({ type: 'ping' });
                                console.log('Отправлен ping для поддержания WebSocket');
                            }
                        }, 30000);
                        resolve(true);
                    };

                    const onError = (event: Event) => {
                        console.error('Ошибка WebSocket:', event);
                        cleanupEvents();
                        if (retryCount < maxRetries) {
                            retryCount++;
                            console.log(`Повторная попытка подключения WebSocket (${retryCount}/${maxRetries})`);
                            setTimeout(attemptConnection, 3000);
                        } else {
                            setError('Не удалось подключиться к WebSocket');
                            resolve(false);
                        }
                    };

                    const onClose = (event: CloseEvent) => {
                        console.log('WebSocket закрыт:', event.code, event.reason);
                        cleanupEvents();
                        setIsConnected(false);
                        if (setWebSocket) setWebSocket(null);
                        if (retryCount < maxRetries) {
                            retryCount++;
                            console.log(`Повторная попытка подключения WebSocket (${retryCount}/${maxRetries})`);
                            setTimeout(attemptConnection, 3000);
                        } else {
                            setError(event.code !== 1000 ? `WebSocket закрыт: ${event.reason || 'код ' + event.code}` : null);
                            resolve(false);
                        }
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
                        console.error('Таймаут подключения WebSocket');
                        cleanupEvents();
                        if (ws.current && ws.current.readyState !== WebSocket.OPEN) {
                            ws.current.close();
                            ws.current = null;
                            if (setWebSocket) setWebSocket(null);
                        }
                        if (retryCount < maxRetries) {
                            retryCount++;
                            console.log(`Повторная попытка подключения WebSocket (${retryCount}/${maxRetries})`);
                            setTimeout(attemptConnection, 3000);
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
                        setTimeout(attemptConnection, 3000);
                    } else {
                        setError('Не удалось создать WebSocket');
                        resolve(false);
                    }
                }
            };

            attemptConnection();
        });
    };

    const joinRoom = async (mediaType: 'none' | 'audio' | 'audio-video' = 'none') => {
        if (isJoining.current) {
            console.log('joinRoom уже выполняется, пропускаем...');
            return;
        }
        isJoining.current = true;
        console.log('Запуск joinRoom, полная очистка перед новым соединением, mediaType:', mediaType);
        leaveRoom();
        setError(null);
        joinMessageRetries.current = 0;

        try {
            const normalizedRoomId = roomId.replace(/-/g, '');
            console.log('Отправка joinRoomViaProxy с roomId:', normalizedRoomId);
            const response = await joinRoomViaProxy(normalizedRoomId);
            if ('error' in response) {
                console.error('joinRoomViaProxy ошибка:', response.error);
                throw new Error(response.error);
            }
            const { roomId: targetRoomId } = response;
            console.log('Получен targetRoomId:', targetRoomId);

            if (!(await connectWebSocket())) {
                throw new Error('Не удалось подключиться к WebSocket');
            }

            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('Задержка после connectWebSocket завершена');

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
                            setError(`Error ${data.error}: ${data.message}`);
                            if (joinMessageRetries.current < MAX_JOIN_MESSAGE_RETRIES) {
                                joinMessageRetries.current += 1;
                                console.log(`Повторная отправка join сообщения (${joinMessageRetries.current}/${MAX_JOIN_MESSAGE_RETRIES})`);
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
                        console.error('Ошибка обработки сообщения:', err);
                        cleanupEvents();
                        setError('Ошибка обработки сообщения сервера');
                        reject(err);
                    }
                };

                const cleanupEvents = () => {
                    if (ws.current) {
                        ws.current.removeEventListener('message', onMessage);
                    }
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
                console.log('Отправлен запрос на подключение:', {
                    action: 'join',
                    room: targetRoomId,
                    username,
                    isLeader: false,
                    preferredCodec,
                });

                if (useBackCamera !== undefined) {
                    sendWebSocketMessage({
                        type: 'switch_camera',
                        useBackCamera,
                        room: targetRoomId,
                        username
                    });
                    console.log('Отправлена начальная команда switch_camera:', { useBackCamera });
                }
            });

            startVideoCheckTimer();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Join room ошибка:', errorMessage);
            setError(`Ошибка подключения: ${errorMessage}`);
            if (retryAttempts.current < MAX_RETRIES && !isConnectionStable.current) {
                console.log('Планируем повторную попытку через 5 секунд');
                webRTCRetryTimeoutRef.current = setTimeout(() => {
                    retryAttempts.current += 1;
                    setRetryCount(retryAttempts.current);
                    if (!isReconnecting.current && !isConnectionStable.current) {
                        resetConnection();
                    }
                }, 5000);
            } else {
                setError(`Не удалось подключиться после ${MAX_RETRIES} попыток: ${errorMessage}`);
            }
        } finally {
            isJoining.current = false;
        }
    };

    const lastRetryTimestamp = useRef(0);
    const resetConnection = () => {
        const now = Date.now();
        if (isReconnecting.current || now - lastRetryTimestamp.current < 5000) {
            console.log('Переподключение уже выполняется или слишком рано, пропускаем...');
            return;
        }
        lastRetryTimestamp.current = now;
        if (isConnectionStable.current) {
            console.log('Соединение стабильно, переподключение запрещено:', {
                iceConnectionState: pc.current?.iceConnectionState,
                signalingState: pc.current?.signalingState,
                wsState: ws.current?.readyState,
            });
            return;
        }
        if (
            pc.current &&
            (pc.current.iceConnectionState === 'connected' ||
                pc.current.iceConnectionState === 'checking' ||
                pc.current.signalingState === 'have-remote-offer' ||
                ws.current?.readyState === WebSocket.OPEN)
        ) {
            console.log('Соединение активно или в процессе установления, переподключение запрещено:', {
                iceConnectionState: pc.current?.iceConnectionState,
                signalingState: pc.current?.signalingState,
                wsState: ws.current?.readyState,
            });
            return;
        }
        isReconnecting.current = true;
        console.log('Переподключение WebRTC...');
        joinRoom(mediaType);
    };

    useEffect(() => {
        if (setLeaveRoom) {
            setLeaveRoom(leaveRoom);
        }
    }, [setLeaveRoom]);

    useEffect(() => {
        if (roomId && !isJoining.current) {
            joinRoom(mediaType);
        }
        return () => leaveRoom();
    }, [roomId, mediaType]);

    // Передаем методы в родительский компонент
    useEffect(() => {
        if (setLeaveRoom) {
            setLeaveRoom(leaveRoom);
        }
        // Экспортируем методы через реф
        (window as any).webRTCRef = {
            joinRoom,
            leaveRoom,
            isCameraEnabled,
            enableCamera,
            disableCamera,
            toggleMicrophone,
            localStream
        };
    }, [isCameraEnabled, localStream, setLeaveRoom]);

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