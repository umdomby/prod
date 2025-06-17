// file: docker-ardua/components/webrtc/hooks/useWebRTC.ts
import { useEffect, useRef, useState } from 'react';
import {RoomInfo} from "@/components/webrtc/types";

interface WebSocketMessage {
    type: string;
    data?: any;
    // sdp?: {
    //     type: RTCSdpType;
    //     sdp: string;
    // };
    sdp?: RTCSessionDescriptionInit;
    ice?: RTCIceCandidateInit;
    room?: string;
    username?: string;
    isLeader?: boolean;
    force_disconnect?: boolean;
    preferredCodec?: string;
}

interface RoomInfoMessage extends WebSocketMessage {
    type: 'room_info';
    data: RoomInfo;
}

interface CustomRTCRtpCodecParameters extends RTCRtpCodecParameters {
    parameters?: {
        'level-asymmetry-allowed'?: number;
        'packetization-mode'?: number;
        'profile-level-id'?: string;
        [key: string]: any;
    };
}

export const useWebRTC = (
    deviceIds: { video: string; audio: string },
    username: string,
    roomId: string,
    preferredCodec: 'VP8' | 'H264' // Новый параметр
) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [users, setUsers] = useState<string[]>([]);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isInRoom, setIsInRoom] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isLeader, setIsLeader] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const pc = useRef<RTCPeerConnection | null>(null);
    const pendingIceCandidates = useRef<RTCIceCandidate[]>([]);
    const isNegotiating = useRef(false);
    const shouldCreateOffer = useRef(false);
    const connectionTimeout = useRef<NodeJS.Timeout | null>(null);
    const statsInterval = useRef<NodeJS.Timeout | null>(null);
    const videoCheckTimeout = useRef<NodeJS.Timeout | null>(null);
    const retryAttempts = useRef(0);

    const [activeCodec, setActiveCodec] = useState<string | null>(null);

    const [roomInfo, setRoomInfo] = useState<any>({});
    const [stream, setStream] = useState<MediaStream | null>(null);
    const webRTCRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);



    // Добавляем функцию для определения платформы
    const detectPlatform = () => {
        const ua = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isSafari = /^((?!chrome|android).)*safari/i.test(ua) || isIOS;
        return {
            isIOS,
            isSafari,
            isChrome: /chrome/i.test(ua),
            isHuawei: /huawei/i.test(ua),
            isAndroid: /Android/i.test(ua),
            isMobile: isIOS || /Android/i.test(ua)
        };
    };

    // Максимальное количество попыток переподключения
    const MAX_RETRIES = 10;
    const VIDEO_CHECK_TIMEOUT = 8000; // 4 секунд для проверки видео



    // 1. Улучшенная функция для получения параметров видео для Huawei
    const getVideoConstraints = () => {
        const { isHuawei, isSafari, isIOS, isMobile } = detectPlatform();
        // Специальные параметры для Huawei
        if (isHuawei) {
            return {
                width: { ideal: 480, max: 640 },
                height: { ideal: 360, max: 480 },
                frameRate: { ideal: 20, max: 24 },
                // Huawei лучше работает с этими параметрами
                facingMode: 'environment',
                resizeMode: 'crop-and-scale'
            };
        }

        // Базовые параметры для всех устройств
        const baseConstraints = {
            width: { ideal: isMobile ? 640 : 1280 },
            height: { ideal: isMobile ? 480 : 720 },
            frameRate: { ideal: isMobile ? 24 : 30 }
        };

        // Специфичные настройки для Huawei
        if (isHuawei) {
            return {
                ...baseConstraints,
                width: { ideal: 480 },
                height: { ideal: 360 },
                frameRate: { ideal: 24 },
                advanced: [{ width: { max: 480 } }]
            };
        }
        if (isIOS) {
            return {
                ...baseConstraints,
                facingMode: 'user', // Фронтальная камера по умолчанию
                deviceId: deviceIds.video ? { exact: deviceIds.video } : undefined,
                advanced: [
                    { facingMode: 'user' }, // Приоритет фронтальной камеры
                    { width: { max: 640 } },
                    { height: { max: 480 } },
                    { frameRate: { max: 24 } }
                ]
            };
        }

        // Специфичные настройки для Safari
        if (isSafari || isIOS) {
            return {
                ...baseConstraints,
                frameRate: { ideal: 24 }, // Чуть меньше FPS для стабильности
                advanced: [
                    { frameRate: { max: 24 } },
                    { width: { max: 640 }, height: { max: 480 } }
                ]
            };
        }

        return baseConstraints;
    };

// 2. Конфигурация видео-трансмиттера для Huawei
    const configureVideoSender = (sender: RTCRtpSender) => {
        const { isHuawei } = detectPlatform();

        if (isHuawei && sender.track?.kind === 'video') {
            const parameters = sender.getParameters();

            if (!parameters.encodings) {
                parameters.encodings = [{}];
            }

            // Используем только стандартные параметры
            parameters.encodings[0] = {
                ...parameters.encodings[0],
                maxBitrate: 300000,    // 300 kbps
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



    // 4. Мониторинг производительности для Huawei
    const startHuaweiPerformanceMonitor = () => {
        const { isHuawei } = detectPlatform();
        if (!isHuawei) return () => {};


        const monitorInterval = setInterval(async () => {
            if (!pc.current || !isCallActive) return;

            try {
                const stats = await pc.current.getStats();
                let videoStats: any = null;
                let connectionStats: any = null;

                stats.forEach(report => {
                    if (report.type === 'inbound-rtp' && report.kind === 'video') {
                        console.log('Статистика видео:', {
                            bytesReceived: report.bytesReceived,
                            packetsLost: report.packetsLost,
                            jitter: report.jitter
                        });
                        if (report.bytesReceived === 0 && isCallActive) {
                            console.warn('Видео не передается (bytesReceived=0), инициируем переподключение');
                            resetConnection();
                        }
                    }
                });

                if (videoStats && connectionStats) {
                    // Адаптация при высокой потере пакетов или задержке
                    if (videoStats.packetsLost > 5 ||
                        (connectionStats.currentRoundTripTime && connectionStats.currentRoundTripTime > 0.5)) {
                        console.log('Высокие потери или задержка, уменьшаем качество');
                        adjustVideoQuality('lower');
                    }
                }
            } catch (err) {
                console.error('Ошибка мониторинга:', err);
            }
        }, 3000); // Более частый мониторинг для Huawei

        return () => clearInterval(monitorInterval);
    };

// 5. Функция адаптации качества видео
    const adjustVideoQuality = (direction: 'higher' | 'lower') => {
        const { isMobile } = detectPlatform();
        const senders = pc.current?.getSenders() || [];

        senders.forEach(sender => {
            if (sender.track?.kind === 'video') {
                const parameters = sender.getParameters();

                if (!parameters.encodings || parameters.encodings.length === 0) {
                    parameters.encodings = [{}];
                }

                // Базовые параметры для всех устройств
                const baseEncoding: RTCRtpEncodingParameters = {
                    ...parameters.encodings[0],
                    active: true,
                };

                // Для мобильных сетей используем более низкие битрейты
                if (isMobile) {
                    parameters.encodings[0] = {
                        ...baseEncoding,
                        maxBitrate: direction === 'higher' ? 300000 : 150000,
                        scaleResolutionDownBy: direction === 'higher' ? 1.0 : 1.5,
                        maxFramerate: direction === 'higher' ? 15 : 10,
                        priority: 'high',
                        networkPriority: 'high'
                    };
                } else {
                    // Для WiFi оставляем текущие настройки
                    parameters.encodings[0] = {
                        ...baseEncoding,
                        maxBitrate: direction === 'higher' ? 300000 : 150000,
                        scaleResolutionDownBy: direction === 'higher' ? 1.0 : 1.5,
                        maxFramerate: direction === 'higher' ? 15 : 10,
                        priority: 'high',
                        networkPriority: 'high'
                    };
                }

                try {
                    sender.setParameters(parameters);
                } catch (err) {
                    console.error('Ошибка изменения параметров:', err);
                }
            }
        });
    };

    const normalizeSdp = (sdp: string | undefined): string => {
        if (!sdp) {
            console.warn('No SDP provided for normalization');
            return '';
        }

        const { isHuawei, isSafari, isIOS } = detectPlatform();
        let optimized = sdp;

        // Найти payload types для видео
        let videoPayloadTypes: string[] = [];
        const lines = sdp.split('\n');
        for (const line of lines) {
            if (line.startsWith('m=video')) {
                const parts = line.split(' ');
                if (parts.length >= 4) {
                    videoPayloadTypes = parts.slice(3);
                    console.log(`Original m=video payload types: ${videoPayloadTypes.join(', ')}`);
                }
                break;
            }
        }

        // Проверить наличие H.264
        let h264PayloadType: string | null = null;
        for (const pt of videoPayloadTypes) {
            if (optimized.includes(`a=rtpmap:${pt} H264`)) {
                h264PayloadType = pt;
                break;
            }
        }

        // Если H.264 отсутствует и preferredCodec === 'H264', добавить его
        if (!h264PayloadType && preferredCodec === 'H264') {
            console.log('H.264 not found in SDP, adding manually');
            h264PayloadType = '126';
            const h264Lines = [
                `a=rtpmap:126 H264/90000`,
                `a=fmtp:126 profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1`,
                `a=rtcp-fb:126 ccm fir`,
                `a=rtcp-fb:126 nack`,
                `a=rtcp-fb:126 nack pli`
            ].join('\r\n') + '\r\n';

            let newLines: string[] = [];
            let videoSectionFound = false;
            for (const line of lines) {
                newLines.push(line);
                if (line.startsWith('m=video') && !videoSectionFound) {
                    videoSectionFound = true;
                    newLines[newLines.length - 1] = line.replace(
                        /(m=video\s+\d+\s+UDP\/TLS\/RTP\/SAVPF\s+)(.*)/,
                        `$1${h264PayloadType} $2`
                    );
                    newLines.push(h264Lines);
                }
            }
            optimized = newLines.join('\r\n');
        }

        // Приоритизировать H.264, если он есть
        if (h264PayloadType && preferredCodec === 'H264') {
            optimized = optimized.replace(
                /^(m=video\s+\d+\s+UDP\/TLS\/RTP\/SAVPF\s+)(.*)$/gm,
                (match, prefix, payloads) => {
                    const payloadList = payloads.split(' ').filter((pt: string) =>
                        pt === h264PayloadType ||
                        (!optimized.includes(`a=rtpmap:${pt} VP8`) &&
                            !optimized.includes(`a=rtpmap:${pt} VP9`) &&
                            !optimized.includes(`a=rtpmap:${pt} AV1`))
                    );
                    return `${prefix}${payloadList.join(' ')}`;
                }
            );
            console.log(`Reordered m=video to prioritize H.264 payload type: ${h264PayloadType}`);
        } else if (!h264PayloadType && preferredCodec === 'H264') {
            console.warn('H.264 not supported, falling back to VP8');
            setError('H.264 не поддерживается, используется VP8');
        }

        // Применить оптимизации для iOS/Safari
        if (isIOS || isSafari) {
            optimized = optimized
                .replace(/a=setup:actpass\r\n/g, 'a=setup:active\r\n')
                .replace(/a=ice-options:trickle\r\n/g, '')
                .replace(/a=rtcp-fb:\d+ goog-remb\r\n/g, '')
                .replace(/a=rtcp-fb:\d+ transport-cc\r\n/g, '')
                .replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:300\r\n');
        }

        // Применить оптимизации для Huawei
        if (isHuawei) {
            optimized = optimized
                .replace(/a=rtpmap:(\d+) H264\/\d+/g,
                    'a=rtpmap:$1 H264/90000\r\n' +
                    'a=fmtp:$1 profile-level-id=42e01f;packetization-mode=1;level-asymmetry-allowed=1\r\n')
                .replace(/a=mid:video\r\n/g,
                    'a=mid:video\r\n' +
                    'b=AS:250\r\n' +
                    'b=TIAS:250000\r\n' +
                    'a=rtcp-fb:* ccm fir\r\n' +
                    'a=rtcp-fb:* nack\r\n' +
                    'a=rtcp-fb:* nack pli\r\n');
        }

        console.log('Normalized SDP:\n', optimized);
        return optimized;
    };

// Добавляем очистку таймера в cleanup
    let cleanup = () => {
        console.log('Выполняется полная очистка ресурсов');

        // Очистка таймеров
        [connectionTimeout, statsInterval, videoCheckTimeout, webRTCRetryTimeoutRef].forEach(timer => {
            if (timer.current) {
                clearTimeout(timer.current);
                timer.current = null;
            }
        });

        // Полная очистка PeerConnection
        if (pc.current) {
            console.log('Закрытие PeerConnection');
            pc.current.onicecandidate = null;
            pc.current.ontrack = null;
            pc.current.onnegotiationneeded = null;
            pc.current.oniceconnectionstatechange = null;
            pc.current.onicegatheringstatechange = null;
            pc.current.onsignalingstatechange = null;
            pc.current.onconnectionstatechange = null;

            pc.current.getTransceivers().forEach(transceiver => {
                try {
                    transceiver.stop();
                } catch (err) {
                    console.warn('Ошибка при остановке трансцептора:', err);
                }
            });

            try {
                pc.current.close();
            } catch (err) {
                console.warn('Ошибка при закрытии PeerConnection:', err);
            }
            pc.current = null;
        }

        // Остановка и очистка медиапотоков
        [localStream, remoteStream].forEach(stream => {
            if (stream) {
                console.log(`Остановка ${stream === localStream ? 'локального' : 'удаленного'} потока`);
                stream.getTracks().forEach(track => {
                    try {
                        track.stop();
                        track.dispatchEvent(new Event('ended'));
                    } catch (err) {
                        console.warn('Ошибка при остановке трека:', err);
                    }
                });
            }
        });

        // Сброс состояний
        setLocalStream(null);
        setRemoteStream(null);
        pendingIceCandidates.current = [];
        isNegotiating.current = false;
        shouldCreateOffer.current = false;
        setIsCallActive(false);
        setIsInRoom(false);
        console.log('Очистка завершена');
    };


    const leaveRoom = () => {
        console.log('Выполняется leaveRoom');
        if (ws.current?.readyState === WebSocket.OPEN) {
            try {
                sendWebSocketMessage({
                    type: 'leave',
                    room: roomId,
                    username,
                    preferredCodec
                });
                console.log('Отправлено сообщение leave:', { type: 'leave', room: roomId, username, preferredCodec });
            } catch (e) {
                console.error('Ошибка отправки сообщения leave:', e);
            }
        }

        // Полная очистка WebRTC
        cleanup();
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

        // Очистка всех таймеров
        if (webRTCRetryTimeoutRef.current) {
            clearTimeout(webRTCRetryTimeoutRef.current);
            webRTCRetryTimeoutRef.current = null;
        }
        if (connectionTimeout.current) {
            clearTimeout(connectionTimeout.current);
            connectionTimeout.current = null;
        }
        if (statsInterval.current) {
            clearInterval(statsInterval.current);
            statsInterval.current = null;
        }
        if (videoCheckTimeout.current) {
            clearTimeout(videoCheckTimeout.current);
            videoCheckTimeout.current = null;
        }

        // Сброс всех состояний
        retryAttempts.current = 0;
        setRetryCount(0);
        shouldCreateOffer.current = false;
        isNegotiating.current = false;
        pendingIceCandidates.current = [];
        setUsers([]);
        setIsInRoom(false);
        setIsConnected(false);
        setIsCallActive(false);
        setIsLeader(false);
        setError(null);
        setLocalStream(null);
        setRemoteStream(null);
        setRoomInfo({});
        setStream(null);
        setActiveCodec(null);
        console.log('Состояния полностью сброшены после leaveRoom');
    };

    const startVideoCheckTimer = () => {
        if (videoCheckTimeout.current) {
            clearTimeout(videoCheckTimeout.current);
            videoCheckTimeout.current = null;
            console.log('Очищен предыдущий таймер проверки видео');
        }
        console.log('Запуск таймера проверки видео на 4 секунды');
        videoCheckTimeout.current = setTimeout(() => {
            console.log('Проверка видео:', {
                remoteStream: !!remoteStream,
                videoTracks: remoteStream?.getVideoTracks().length || 0,
                firstTrackEnabled: remoteStream?.getVideoTracks()[0]?.enabled,
                firstTrackReadyState: remoteStream?.getVideoTracks()[0]?.readyState
            });
            const videoElement = document.querySelector('video');
            const hasVideoContent =
                videoElement && videoElement.videoWidth > 0 && videoElement.videoHeight > 0;
            if (
                !remoteStream ||
                remoteStream.getVideoTracks().length === 0 ||
                !remoteStream.getVideoTracks()[0]?.enabled ||
                remoteStream.getVideoTracks()[0]?.readyState !== 'live' ||
                !hasVideoContent
            ) {
                console.log(
                    `Удаленное видео не получено или пустое в течение ${VIDEO_CHECK_TIMEOUT / 1000} секунд, перезапускаем соединение...`
                );
                resetConnection();
            } else {
                console.log('Видео активно, переподключение не требуется');
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
                ws.current = new WebSocket(process.env.WEBSOCKET_URL_WSGO || 'wss://ardua.site:444/wsgo');

                const onOpen = () => {
                    cleanupEvents();
                    setIsConnected(true);
                    setError(null);
                    console.log('WebSocket подключен');
                    resolve(true);
                };

                const onError = (event: Event) => {
                    cleanupEvents();
                    console.error('Ошибка WebSocket:', event);
                    setError('Ошибка подключения к WebSocket');
                    setIsConnected(false);
                    resolve(false);
                };

                const onClose = (event: CloseEvent) => {
                    cleanupEvents();
                    console.log('WebSocket отключен:', event.code, event.reason);
                    setIsConnected(false);
                    setIsInRoom(false);
                    setError(event.code !== 1000 ? `Соединение закрыто: ${event.reason || 'код ' + event.code}` : null);
                    resolve(false);
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
                    cleanupEvents();
                    setError('Таймаут подключения WebSocket');
                    resolve(false);
                }, 5000);

                ws.current.addEventListener('open', onOpen);
                ws.current.addEventListener('error', onError);
                ws.current.addEventListener('close', onClose);

            } catch (err) {
                console.error('Ошибка создания WebSocket:', err);
                setError('Не удалось создать WebSocket соединение');
                resolve(false);
            }
        });
    };

    // Функция для извлечения видеокодека из SDP
    const getVideoCodecFromSdp = (sdp: string | undefined): string | null => {
        if (!sdp) {
            console.warn('No SDP provided');
            return null;
        }
        console.log('Full SDP:\n', sdp); // Логируем полный SDP
        const lines = sdp.split('\n');
        let videoPayloadTypes: string[] = [];

        // Найти строку m=video и извлечь payload types
        for (const line of lines) {
            if (line.startsWith('m=video')) {
                const parts = line.split(' ');
                if (parts.length >= 4) {
                    videoPayloadTypes = parts.slice(3);
                    console.log(`Found m=video payload types: ${videoPayloadTypes.join(', ')}`);
                }
                break;
            }
        }

        if (videoPayloadTypes.length === 0) {
            console.warn('No video payload types found in SDP');
            return null;
        }

        // Найти первый подходящий кодек по payload type
        for (const pt of videoPayloadTypes) {
            for (const line of lines) {
                if (line.includes(`a=rtpmap:${pt} H264`)) {
                    console.log(`Found H264 for payload type ${pt}`);
                    return 'H264';
                }
                if (line.includes(`a=rtpmap:${pt} VP8`)) {
                    console.log(`Found VP8 for payload type ${pt}`);
                    return 'VP8';
                }
            }
        }

        console.warn('No matching codec found for payload types:', videoPayloadTypes);
        return null;
    };


    const setupWebSocketListeners = () => {
        if (!ws.current) return;

        const handleMessage = async (event: MessageEvent) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data);
                console.log('Получено сообщение:', data);
                console.log('Получено сообщение:', JSON.stringify(data, null, 2))

                if (data.type === 'rejoin_and_offer' && isLeader) {
                    console.log('Получена команда rejoin_and_offer для лидера');
                    if (pc.current && ws.current?.readyState === WebSocket.OPEN) {
                        try {
                            const localStream = await initializeWebRTC();
                            if (!localStream || localStream.getVideoTracks().length === 0) {
                                console.error('Нет видеотрека для лидера после initializeWebRTC');
                                throw new Error('Видеотрек отсутствует');
                            }
                            const offer = await pc.current.createOffer({
                                offerToReceiveAudio: true,
                                offerToReceiveVideo: false
                            });
                            const normalizedOffer = {
                                ...offer,
                                sdp: normalizeSdp(offer.sdp)
                            };
                            await pc.current.setLocalDescription(normalizedOffer);
                            sendWebSocketMessage({
                                type: 'offer',
                                sdp: normalizedOffer,
                                room: roomId,
                                username,
                                preferredCodec
                            });
                            console.log('Отправлен новый offer:', normalizedOffer);
                            startVideoCheckTimer();
                        } catch (err) {
                            console.error('Ошибка создания нового offer:', err);
                            setError('Ошибка при создании нового предложения');
                        }
                    }
                    return;
                }

                switch (data.type) {
                    case 'room_info':
                        console.log('Обработка room_info:', data.data);
                        setIsLeader(data.data?.leader === username);
                        setUsers(data.data?.users || []);
                        setIsInRoom(true);
                        if (data.data?.leader && data.data?.follower) {
                            console.log('Получены данные комнаты:', {
                                leader: data.data.leader,
                                follower: data.data.follower
                            });
                            if (videoCheckTimeout.current) {
                                clearTimeout(videoCheckTimeout.current);
                                console.log('Таймер проверки видео очищен при получении room_info');
                            }
                            startVideoCheckTimer();
                        }
                        break;

                    case 'offer':
                        console.log('Получен offer SDP:\n', data.sdp?.sdp);
                        if (!isLeader && pc.current && data.sdp) {
                            if (!data.sdp) {
                                console.error('Получен offer без SDP');
                                setError('Недействительное предложение от сервера');
                                return;
                            }
                            console.log('Получен offer:', data.sdp);
                            await pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                            console.log('Состояние сигнализации изменилось: have-remote-offer');
                            const answer = await pc.current.createAnswer();
                            const normalizedAnswer = {
                                ...answer,
                                sdp: normalizeSdp(answer.sdp)
                            };
                            await pc.current.setLocalDescription(normalizedAnswer);
                            sendWebSocketMessage({
                                type: 'answer',
                                sdp: normalizedAnswer,
                                room: roomId,
                                username,
                                preferredCodec
                            });
                            console.log('Отправлен answer:', normalizedAnswer);

                            // Извлекаем кодек из SDP ответа
                            const codec = getVideoCodecFromSdp(normalizedAnswer.sdp);
                            if (codec) {
                                console.log(`Кодек трансляции: ${codec}`);
                                setActiveCodec(codec);
                                if (codec !== preferredCodec) {
                                    console.warn(`Используется кодек ${codec} вместо выбранного ${preferredCodec}`);
                                    setError(`Используется кодек ${codec} вместо выбранного ${preferredCodec}`);
                                }
                            } else {
                                console.warn('Кодек не найден в SDP ответа');
                                setActiveCodec(null);
                                setError('Не удалось определить кодек трансляции');
                            }
                        }
                        break;

                    case 'answer':
                        if (isLeader && pc.current && data.sdp) {
                            if (!data.sdp) {
                                console.error('Получен answer без SDP');
                                setError('Недействительный ответ от сервера');
                                return;
                            }
                            console.log('Получен answer:', data.sdp);
                            await pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                            console.log('Состояние сигнализации изменилось: stable');

                            // Извлекаем кодек из SDP ответа
                            const codec = getVideoCodecFromSdp(data.sdp.sdp);
                            if (codec) {
                                console.log(`Кодек трансляции: ${codec}`);
                                setActiveCodec(codec);
                            } else {
                                console.warn('Кодек не найден в SDP ответа');
                                setActiveCodec(null);
                            }
                        }
                        break;

                    case 'ice_candidate':
                        if (pc.current && data.ice) {
                            console.log('ICE кандидат добавлен в очередь:', data.ice);
                            try {
                                await pc.current.addIceCandidate(new RTCIceCandidate(data.ice));
                                console.log('Добавлен ICE кандидат:', data.ice);
                            } catch (err) {
                                console.error('Ошибка добавления ICE-кандидата:', err);
                                setError('Ошибка добавления ICE-кандидата');
                            }
                        }
                        break;

                    case 'reconnect_request':
                        console.log('Сервер запросил переподключение');
                        setTimeout(() => {
                            resetConnection();
                        }, 1000);
                        break;

                    case 'force_disconnect':
                        console.log('Получена команда принудительного отключения');
                        setError('Вы были отключены, так как подключился другой зритель');
                        leaveRoom();
                        break;

                    case 'error':
                        console.error('Ошибка от сервера:', data.data);
                        setError(data.data || 'Ошибка от сервера');
                        break;

                    default:
                        console.warn('Неизвестный тип сообщения:', data.type);
                }
            } catch (err) {
                console.error('Ошибка обработки сообщения:', err);
                setError('Ошибка обработки сообщения сервера');
            }
        };

        ws.current.onmessage = handleMessage;
    };

    const initializeWebRTC = async (): Promise<MediaStream | null> => {
        try {
            cleanup();

            const { isIOS, isSafari, isHuawei } = detectPlatform();

            const config: RTCConfiguration = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:ardua.site:3478' },
                    {
                        urls: 'turn:ardua.site:3478',
                        username: 'user1',
                        credential: 'pass1'
                    }
                ],
                bundlePolicy: 'max-bundle',
                rtcpMuxPolicy: 'require',
                iceTransportPolicy: 'all',
                iceCandidatePoolSize: 0,
                // @ts-ignore - sdpSemantics is supported but not in TypeScript's types
                sdpSemantics: 'unified-plan' as any,
            };

            pc.current = new RTCPeerConnection(config);

            // Специфичные настройки ICE для iOS/Safari
            if (isIOS || isSafari) {
                pc.current.oniceconnectionstatechange = () => {
                    if (!pc.current) return;

                    console.log('iOS ICE state:', pc.current.iceConnectionState);

                    if (
                        pc.current.iceConnectionState === 'disconnected' ||
                        pc.current.iceConnectionState === 'failed'
                    ) {
                        console.log('iOS: ICE failed, restarting connection');
                        setTimeout(resetConnection, 1000);
                    }
                };

                pc.current.onicegatheringstatechange = () => {
                    if (pc.current?.iceGatheringState === 'complete') {
                        console.log('iOS: ICE gathering complete');
                    }
                };
            }

            // Специфичные настройки ICE для Huawei
            if (isHuawei) {
                pc.current.oniceconnectionstatechange = () => {
                    if (!pc.current) return;

                    console.log('Huawei ICE состояние:', pc.current.iceConnectionState);

                    if (
                        pc.current.iceConnectionState === 'disconnected' ||
                        pc.current.iceConnectionState === 'failed'
                    ) {
                        console.log('Huawei: соединение прервано, переподключение...');
                        setTimeout(resetConnection, 1000);
                    }
                };
            }

            // Обработчики событий WebRTC
            pc.current.onnegotiationneeded = () => {
                console.log('Требуется переговорный процесс');
            };

            pc.current.onsignalingstatechange = () => {
                console.log('Состояние сигнализации изменилось:', pc.current?.signalingState);
            };

            pc.current.onicegatheringstatechange = () => {
                console.log('Состояние сбора ICE изменилось:', pc.current?.iceGatheringState);
            };

            pc.current.onicecandidateerror = (event) => {
                const ignorableErrors = [701, 702, 703]; // Игнорируем стандартные ошибки STUN
                if (!ignorableErrors.includes(event.errorCode)) {
                    console.error('Критическая ошибка ICE кандидата:', event);
                    setError(`Ошибка ICE соединения: ${event.errorText}`);
                }
            };

            // Получаем медиапоток с устройства
            const stream = await navigator.mediaDevices.getUserMedia({
                video: deviceIds.video
                    ? {
                        deviceId: { exact: deviceIds.video },
                        ...getVideoConstraints(),
                        ...(isIOS && !deviceIds.video ? { facingMode: 'user' } : {})
                    }
                    : getVideoConstraints(),
                audio: deviceIds.audio
                    ? {
                        deviceId: { exact: deviceIds.audio },
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                    : true
            });

            // Проверяем наличие видеотрека
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length === 0) {
                throw new Error('Не удалось получить видеопоток с устройства');
            }

            // Применяем настройки для Huawei
            pc.current.getSenders().forEach(configureVideoSender);

            setLocalStream(stream);
            stream.getTracks().forEach(track => {
                pc.current?.addTrack(track, stream);
                console.log(`Добавлен ${track.kind} трек в PeerConnection:`, track.id);
            });

            // Обработка ICE кандидатов
            pc.current.onicecandidate = (event) => {
                if (event.candidate && ws.current?.readyState === WebSocket.OPEN) {
                    try {
                        // Фильтруем нежелательные кандидаты
                        if (shouldSendIceCandidate(event.candidate)) {
                            ws.current.send(
                                JSON.stringify({
                                    type: 'ice_candidate',
                                    ice: event.candidate.toJSON(),
                                    room: roomId,
                                    preferredCodec,
                                    username
                                })
                            );
                            console.log('Отправлен ICE кандидат:', event.candidate);
                        }
                    } catch (err) {
                        console.error('Ошибка отправки ICE кандидата:', err);
                    }
                }
            };

            // Функция фильтрации ICE-кандидатов
            const shouldSendIceCandidate = (candidate: RTCIceCandidate) => {
                const { isIOS, isSafari, isHuawei } = detectPlatform();

                // Для Huawei отправляем только relay-кандидаты
                if (isHuawei) {
                    return candidate.candidate.includes('typ relay');
                }

                // Для iOS/Safari отправляем только relay и srflx кандидаты
                if (isIOS || isSafari) {
                    return (
                        candidate.candidate.includes('typ relay') ||
                        candidate.candidate.includes('typ srflx')
                    );
                }

                return true;
            };

            // Обработка входящих медиапотоков
            pc.current.ontrack = (event) => {
                if (event.streams && event.streams[0]) {
                    const stream = event.streams[0];
                    console.log('Получен поток в ontrack:', {
                        streamId: stream.id,
                        videoTracks: stream.getVideoTracks().length,
                        audioTracks: stream.getAudioTracks().length,
                        videoTrackEnabled: stream.getVideoTracks()[0]?.enabled,
                        videoTrackReadyState: stream.getVideoTracks()[0]?.readyState,
                        videoTrackId: stream.getVideoTracks()[0]?.id
                    });

                    const videoTrack = stream.getVideoTracks()[0];
                    if (videoTrack && videoTrack.enabled && videoTrack.readyState === 'live') {
                        console.log('Получен активный видеотрек:', videoTrack.id);
                        const newRemoteStream = new MediaStream();
                        stream.getTracks().forEach(track => {
                            newRemoteStream.addTrack(track);
                            console.log(`Добавлен ${track.kind} трек в remoteStream:`, track.id);
                        });
                        setRemoteStream(newRemoteStream);
                        setIsCallActive(true);
                        if (videoCheckTimeout.current) {
                            clearTimeout(videoCheckTimeout.current);
                            videoCheckTimeout.current = null;
                            console.log('Таймер проверки видео очищен: получен активный видеотрек');
                        }
                    } else {
                        console.warn('Входящий поток не содержит активного видеотрека');
                        startVideoCheckTimer();
                    }
                } else {
                    console.warn('Получен пустой поток в ontrack');
                    startVideoCheckTimer();
                }
            };

            // Обработка состояния ICE соединения
            pc.current.oniceconnectionstatechange = () => {
                if (!pc.current) return;

                console.log('Состояние ICE соединения:', pc.current.iceConnectionState);

                if (isHuawei && pc.current.iceConnectionState === 'connected') {
                    const stopHuaweiMonitor = startHuaweiPerformanceMonitor();
                    pc.current.onconnectionstatechange = () => {
                        if (pc.current?.connectionState === 'disconnected') {
                            stopHuaweiMonitor();
                        }
                    };
                    const originalCleanup = cleanup;
                    cleanup = () => {
                        stopHuaweiMonitor();
                        originalCleanup();
                    };
                }

                switch (pc.current.iceConnectionState) {
                    case 'failed':
                        console.log('Ошибка ICE, перезапуск...');
                        resetConnection();
                        break;
                    case 'disconnected':
                        console.log('Соединение прервано...');
                        setIsCallActive(false);
                        resetConnection();
                        break;
                    case 'connected':
                        console.log('Соединение установлено!');
                        setIsCallActive(true);
                        break;
                    case 'closed':
                        console.log('Соединение закрыто');
                        setIsCallActive(false);
                        break;
                }
            };

            // Запускаем мониторинг соединения
            startConnectionMonitoring();

            return stream; // Возвращаем MediaStream
        } catch (err) {
            console.error('Ошибка инициализации WebRTC:', err);
            setError(`Не удалось инициализировать WebRTC: ${err instanceof Error ? err.message : String(err)}`);
            cleanup();
            return null; // Возвращаем null при ошибке
        }
    };

    const adjustVideoQualityForSafari = (direction: 'higher' | 'lower') => {
        const senders = pc.current?.getSenders() || [];

        senders.forEach(sender => {
            if (sender.track?.kind === 'video') {
                const parameters = sender.getParameters();

                if (!parameters.encodings) return;

                parameters.encodings[0] = {
                    ...parameters.encodings[0],
                    maxBitrate: direction === 'higher' ? 300000 : 150000,
                    scaleResolutionDownBy: direction === 'higher' ? 1.0 : 1.5,
                    maxFramerate: direction === 'higher' ? 25 : 15,
                    priority: 'high',
                    networkPriority: 'high'
                };

                try {
                    sender.setParameters(parameters);
                } catch (err) {
                    console.error('Ошибка изменения параметров:', err);
                }
            }
        });
    };

    const startConnectionMonitoring = () => {
        if (statsInterval.current) {
            clearInterval(statsInterval.current);
        }

        const { isSafari } = detectPlatform();

        statsInterval.current = setInterval(async () => {
            if (!pc.current || !isCallActive) return;

            try {
                const stats = await pc.current.getStats();
                let hasActiveVideo = false;
                let packetsLost = 0;
                let totalPackets = 0;
                let videoJitter = 0;

                stats.forEach(report => {
                    if (report.type === 'inbound-rtp' && report.kind === 'video') {
                        if (report.bytesReceived > 0) hasActiveVideo = true;
                        if (report.packetsLost !== undefined) packetsLost += report.packetsLost;
                        if (report.packetsReceived !== undefined) totalPackets += report.packetsReceived;
                        if (report.jitter !== undefined) videoJitter = report.jitter;
                    }
                });

                // Общая проверка для всех устройств
                if (!hasActiveVideo && isCallActive) {
                    console.warn('Нет активного видеопотока, пытаемся восстановить...');
                    resetConnection();
                    return;
                }

                // Специфичные проверки для Safari
                if (isSafari) {
                    // Проверка на высокую задержку
                    if (videoJitter > 0.3) { // Jitter в секундах
                        console.log('Высокий jitter на Safari, уменьшаем битрейт');
                        adjustVideoQualityForSafari('lower');
                    }
                    // Проверка потери пакетов
                    else if (totalPackets > 0 && packetsLost / totalPackets > 0.05) { // >5% потерь
                        console.warn('Высокий уровень потерь пакетов на Safari, переподключение...');
                        resetConnection();
                        return;
                    }
                }
            } catch (err) {
                console.error('Ошибка получения статистики:', err);
            }
        }, 5000);

        return () => {
            if (statsInterval.current) {
                clearInterval(statsInterval.current);
            }
        };
    };
    const resetConnection = async () => {
        console.log('Запуск resetConnection');
        leaveRoom(); // Полная очистка соединения
    };
// Модифицируем функцию resetConnection
//     const resetConnection = async () => {
//         console.log(`Запуск resetConnection, попытка #${retryAttempts.current + 1}`);
//
//         if (retryAttempts.current >= MAX_RETRIES) {
//             console.error('Достигнуто максимальное количество попыток переподключения:', MAX_RETRIES);
//             setError('Не удалось восстановить соединение после нескольких попыток');
//             leaveRoom();
//             return;
//         }
//
//         const { isIOS, isSafari } = detectPlatform();
//         const baseDelay = isIOS || isSafari ? 5000 : 2000;
//         const retryDelay = Math.min(baseDelay * (retryAttempts.current + 1), 15000);
//
//         console.log(`Ожидание перед переподключением: ${retryDelay}ms`);
//         cleanup();
//         retryAttempts.current += 1;
//         setRetryCount(retryAttempts.current);
//
//         setTimeout(async () => {
//             try {
//                 console.log('Попытка повторного входа в комнату');
//                 await joinRoom(username);
//                 console.log('Переподключение успешно, сброс счетчика попыток');
//                 retryAttempts.current = 0;
//                 setRetryCount(0);
//             } catch (err) {
//                 console.error('Ошибка переподключения:', err);
//                 setError(`Ошибка переподключения: ${err instanceof Error ? err.message : String(err)}`);
//                 if (retryAttempts.current < MAX_RETRIES) {
//                     console.log('Планируем следующую попытку переподключения');
//                     resetConnection();
//                 } else {
//                     console.error('Исчерпаны все попытки переподключения');
//                     setError('Не удалось восстановить соединение после максимального количества попыток');
//                     leaveRoom();
//                 }
//             }
//         }, retryDelay);
//     };

    const restartMediaDevices = async () => {
        try {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: deviceIds.video ? {
                    deviceId: { exact: deviceIds.video },
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 }
                } : {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 }
                },
                audio: deviceIds.audio ? {
                    deviceId: { exact: deviceIds.audio },
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } : true
            });

            setLocalStream(stream);

            if (pc.current) {
                const senders = pc.current.getSenders();
                stream.getTracks().forEach(track => {
                    const sender = senders.find(s => s.track?.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        pc.current?.addTrack(track, stream);
                    }
                });
            }

            return true;
        } catch (err) {
            console.error('Ошибка перезагрузки медиаустройств:', err);
            setError('Ошибка доступа к медиаустройствам');
            return false;
        }
    };


    const sendWebSocketMessage = (message: WebSocketMessage) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            console.log('Отправка WebSocket-сообщения:', message);
            ws.current.send(JSON.stringify(message));
        } else {
            console.error('WebSocket не открыт для отправки:', message);
        }
    };

    const joinRoom = async (uniqueUsername: string, customRoomId?: string) => {
        console.log('Запуск joinRoom, полная очистка перед новым соединением');
        leaveRoom(); // Полная очистка перед новым соединением
        setError(null);
        setIsInRoom(false);
        setIsConnected(false);
        setIsLeader(false);

        try {
            if (!(await connectWebSocket())) {
                throw new Error('Не удалось подключиться к WebSocket');
            }

            setupWebSocketListeners();

            if (!(await initializeWebRTC())) {
                throw new Error('Не удалось инициализировать WebRTC');
            }

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
                            console.log('Получено room_info, очищаем таймер');
                            cleanupEvents();
                            setIsInRoom(true);
                            setUsers(data.data?.users || []);
                            setError(null); // Сбрасываем ошибку при успешном подключении
                            retryAttempts.current = 0; // Сбрасываем счетчик попыток
                            setRetryCount(0);
                            resolve();
                        } else if (data.type === 'error') {
                            console.error('Ошибка от сервера:', data.data);
                            cleanupEvents();
                            if (data.data === 'Room does not exist. Leader must join first.') {
                                if (retryAttempts.current < MAX_RETRIES) {
                                    console.log('Комната не существует, повторная попытка через 5 секунд');
                                    webRTCRetryTimeoutRef.current = setTimeout(() => {
                                        retryAttempts.current += 1;
                                        setRetryCount(retryAttempts.current);
                                        joinRoom(uniqueUsername, customRoomId).catch(console.error);
                                    }, 5000);
                                    return;
                                } else {
                                    setError('Лидер не подключился после максимального количества попыток');
                                    reject(new Error('Достигнуто максимальное количество попыток подключения'));
                                }
                            } else {
                                setError(data.data || 'Ошибка входа в комнату');
                                reject(new Error(data.data || 'Ошибка входа в комнату'));
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
                }, 15000);

                ws.current.addEventListener('message', onMessage);

                const effectiveRoomId = customRoomId || roomId.replace(/-/g, '');
                sendWebSocketMessage({
                    type: 'join',
                    room: effectiveRoomId,
                    username: uniqueUsername,
                    isLeader: false,
                    preferredCodec,
                });
                console.log('Отправлен запрос на подключение:', {
                    action: 'join',
                    room: effectiveRoomId,
                    username: uniqueUsername,
                    isLeader: false,
                    preferredCodec,
                });
            });

            shouldCreateOffer.current = false;
            startVideoCheckTimer();
        } catch (err) {
            console.error('Ошибка входа в комнату:', err);
            setError(`Ошибка входа в комнату: ${err instanceof Error ? err.message : String(err)}`);

            cleanup();
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }

            if (retryAttempts.current < MAX_RETRIES) {
                console.log('Планируем повторную попытку через 5 секунд');
                webRTCRetryTimeoutRef.current = setTimeout(() => {
                    retryAttempts.current += 1;
                    setRetryCount(retryAttempts.current);
                    joinRoom(uniqueUsername, customRoomId).catch(console.error);
                }, 5000);
            } else {
                console.error('Исчерпаны все попытки подключения');
                setError('Не удалось подключиться после максимального количества попыток');
            }
        }
    };

    useEffect(() => {
        return () => {
            leaveRoom()
        }
    }, [])

    return {
        localStream,
        remoteStream,
        users,
        joinRoom,
        leaveRoom,
        isCallActive,
        isConnected,
        isInRoom,
        isLeader,
        error,
        retryCount,
        resetConnection,
        restartMediaDevices,
        setError,
        ws: ws.current,
        activeCodec
    };
};