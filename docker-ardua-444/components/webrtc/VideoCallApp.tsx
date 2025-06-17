'use client'

import { useWebRTC } from './hooks/useWebRTC'
import styles from './styles.module.css'
import { VideoPlayer } from './components/VideoPlayer'
import { DeviceSelector } from './components/DeviceSelector'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SocketClient from '../control/SocketClient'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
    getSavedRooms,
    saveRoom,
    deleteRoom,
    setDefaultRoom,
    updateAutoConnect,
    getDevices,
    bindDeviceToRoom,
    getSavedRoomWithDevice,
    joinRoomViaProxy,
    disableProxyAccess,
    enableProxyAccess,
    deleteProxyAccess,
    checkRoom,
    resetDefaultRoom,
} from '@/app/actions'
import { debounce } from 'lodash';

type VideoSettings = {
    rotation: number
    flipH: boolean
    flipV: boolean
}

type SavedRoom = {
    id: string;
    isDefault: boolean;
    autoConnect: boolean;
    deviceId: string | null;
    proxyAccess: { proxyRoomId: string; name: string | null }[];
};
type GetSavedRoomsResponse = {
    rooms?: Array<{
        id: string;
        isDefault: boolean;
        autoConnect: boolean;
        deviceId: string | null;
        proxyAccess: Array<{ proxyRoomId: string; name: string | null }>;
    }>;
    proxyRooms?: Array<{
        id: string;
        isDefault: boolean;
        autoConnect: boolean; // Добавляем autoConnect
    }>;
    error?: string;
};
type Device = {
    idDevice: string
}

interface SocketClientProps {
    onConnectionStatusChange?: (isFullyConnected: boolean) => void;
    selectedDeviceId?: string | null;
}

export const VideoCallApp = () => {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
    const [selectedDevices, setSelectedDevices] = useState({
        video: '',
        audio: ''
    })
    const [showLocalVideo, setShowLocalVideo] = useState(true)
    const [videoTransform, setVideoTransform] = useState('')
    const [roomId, setRoomId] = useState('')
    const [username, setUsername] = useState('user_' + Math.floor(Math.random() * 1000))
    const [hasPermission, setHasPermission] = useState(false)
    const [devicesLoaded, setDevicesLoaded] = useState(false)
    const [isJoining, setIsJoining] = useState(false)
    const [autoJoin, setAutoJoin] = useState(false)
    const [activeMainTab, setActiveMainTab] = useState<'webrtc' | 'esp' | null>(null)
    const [showControls, setShowControls] = useState(false)
    const [showCam, setShowCam] = useState(false)
    const [videoSettings, setVideoSettings] = useState<VideoSettings>({
        rotation: 0,
        flipH: false,
        flipV: false
    })
    const [muteLocalAudio, setMuteLocalAudio] = useState(false)
    const [muteRemoteAudio, setMuteRemoteAudio] = useState(false)
    const videoContainerRef = useRef<HTMLDivElement>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const localAudioTracks = useRef<MediaStreamTrack[]>([])
    const [useBackCamera, setUseBackCamera] = useState(false)
    const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([])
    const [savedProxyRooms, setSavedProxyRooms] = useState<
        Array<{
            id: string;
            isDefault: boolean;
            autoConnect: boolean;
        }>
    >([]);
    const [showRoomExistsDialog, setShowRoomExistsDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [roomToDelete, setRoomToDelete] = useState<string | null>(null)
    const [selectedCodec, setSelectedCodec] = useState<'VP8' | 'H264'>('VP8')
    const [isDeviceConnected, setIsDeviceConnected] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const [availableDevices, setAvailableDevices] = useState<Device[]>([])
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [showDeviceBoundDialog, setShowDeviceBoundDialog] = useState(false);
    const webRTCRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showProxyExistsDialog, setShowProxyExistsDialog] = useState(false);
    const [proxyName, setProxyName] = useState('');
    const [showRoomNotExistDialog, setShowRoomNotExistDialog] = useState(false);
    const [targetRoomId, setTargetRoomId] = useState('');
    const hasAttemptedAutoJoin = useRef(false);
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

    useEffect(() => {
        setIsClient(true)
    }, [])

    const {
        localStream,
        remoteStream,
        users,
        joinRoom,
        leaveRoom,
        isCallActive,
        isConnected,
        isInRoom,
        error,
        setError,
        ws,
        activeCodec
    } = useWebRTC(selectedDevices, username, roomId.replace(/-/g, ''), selectedCodec);

    useEffect(() => {
        console.log('Состояния:', { isConnected, isInRoom, isCallActive, error });
        if (isInRoom && isCallActive && activeMainTab !== 'esp') {
            setActiveMainTab('esp');
        }
    }, [isConnected, isInRoom, isCallActive, error]);

    useEffect(() => {
        if (error === 'Room does not exist. Leader must join first.') {
            setShowRoomNotExistDialog(true);
            setTimeout(() => setShowRoomNotExistDialog(false), 5000);
        }
    }, [error]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const proxyRoomId = urlParams.get('proxyRoomId');
        if (proxyRoomId) {
            handleJoinProxyRoom(proxyRoomId.replace(/-/g, ''));
        }
    }, []);

    useEffect(() => {
        const loadSettings = () => {
            try {
                const saved = localStorage.getItem('videoSettings')
                if (saved) {
                    const parsed = JSON.parse(saved) as VideoSettings
                    setVideoSettings(parsed)
                    applyVideoTransform(parsed)
                }
            } catch (e) {
                console.error('Failed to load video settings', e)
            }
        }

        const loadSavedRooms = async () => {
            try {
                const response: GetSavedRoomsResponse = await getSavedRooms();
                if (response.error) {
                    console.error('Ошибка загрузки комнат:', response.error);
                    setError(response.error);
                    setSavedRooms([]);
                    setSavedProxyRooms([]);
                    return;
                }
                if (!response.rooms || !Array.isArray(response.rooms)) {
                    console.error('Комнаты не найдены или имеют неверный формат');
                    setError('Комнаты не найдены');
                    setSavedRooms([]);
                    setSavedProxyRooms([]);
                    return;
                }
                const roomsWithDevices = await Promise.all(
                    response.rooms.map(async (room) => {
                        const roomWithDevice = await getSavedRoomWithDevice(room.id);
                        return {
                            id: room.id,
                            isDefault: room.isDefault,
                            autoConnect: room.autoConnect,
                            deviceId: roomWithDevice.deviceId,
                            proxyAccess: room.proxyAccess,
                        };
                    })
                );
                setSavedRooms(roomsWithDevices);
                setSavedProxyRooms(response.proxyRooms || []);

                const defaultRoom = roomsWithDevices.find((r) => r.isDefault);
                const defaultProxyRoom = (response.proxyRooms || []).find((r) => r.isDefault);

                if (defaultRoom && !roomId) {
                    console.log('Установка defaultRoom:', defaultRoom);
                    setRoomId(formatRoomId(defaultRoom.id));
                    setAutoJoin(defaultRoom.autoConnect);
                    setSelectedDeviceId(defaultRoom.deviceId || null);
                } else if (defaultProxyRoom && !roomId && !defaultRoom) {
                    console.log('Установка defaultProxyRoom:', defaultProxyRoom);
                    setRoomId(formatRoomId(defaultProxyRoom.id));
                    setAutoJoin(defaultProxyRoom.autoConnect);
                    setSelectedDeviceId(null);
                } else if (roomsWithDevices.length > 0 && !roomId) {
                    // Если нет дефолтной комнаты, выбираем первую сохраненную
                    console.log('Установка первой сохраненной комнаты:', roomsWithDevices[0]);
                    setRoomId(formatRoomId(roomsWithDevices[0].id));
                    setAutoJoin(roomsWithDevices[0].autoConnect);
                    setSelectedDeviceId(roomsWithDevices[0].deviceId || null);
                } else if (response.proxyRooms?.length > 0 && !roomId && !roomsWithDevices.length) {
                    // Если нет обычных комнат, выбираем первую прокси-комнату
                    console.log('Установка первой прокси-комнаты:', response.proxyRooms[0]);
                    setRoomId(formatRoomId(response.proxyRooms[0].id));
                    setAutoJoin(response.proxyRooms[0].autoConnect);
                    setSelectedDeviceId(null);
                } else {
                    setAutoJoin(false);
                }
            } catch (e) {
                console.error('Failed to load saved rooms', e);
                setError('Не удалось загрузить сохраненные комнаты');
                setSavedRooms([]);
                setSavedProxyRooms([]);
            }
        };

        const loadDevices = async () => {
            try {
                const devices = await getDevices()
                setAvailableDevices(devices)
            } catch (e) {
                console.error('Failed to load devices', e)
            }
        }

        const savedMuteLocal = localStorage.getItem('muteLocalAudio')
        if (savedMuteLocal !== null) {
            setMuteLocalAudio(savedMuteLocal === 'true')
        }

        const savedMuteRemote = localStorage.getItem('muteRemoteAudio')
        if (savedMuteRemote !== null) {
            setMuteRemoteAudio(savedMuteRemote === 'true')
        }

        const savedShowLocalVideo = localStorage.getItem('showLocalVideo')
        if (savedShowLocalVideo !== null) {
            setShowLocalVideo(savedShowLocalVideo === 'true')
        }

        const savedCameraPref = localStorage.getItem('useBackCamera')
        if (savedCameraPref !== null) {
            setUseBackCamera(savedCameraPref === 'true')
        }

        const savedAutoJoin = localStorage.getItem('autoJoin') === 'true'
        setAutoJoin(savedAutoJoin)
        setActiveMainTab(savedAutoJoin ? 'esp' : 'webrtc');

        const savedCodec = localStorage.getItem('selectedCodec')
        if (savedCodec === 'VP8' || savedCodec === 'H264') {
            setSelectedCodec(savedCodec)
        }

        loadSettings()
        loadSavedRooms()
        loadDevices()
        loadDevicesForMedia()
    }, [])


    useEffect(() => {
        const savedAutoShowControls = localStorage.getItem('autoShowControls')
        if (savedAutoShowControls === 'true' && isDeviceConnected) {
            setActiveMainTab('esp')
        }
    }, [isDeviceConnected])

    const handleCodecChange = useCallback(
        debounce((e: React.ChangeEvent<HTMLSelectElement>) => {
            const codec = e.target.value as 'VP8' | 'H264'
            setSelectedCodec(codec)
            localStorage.setItem('selectedCodec', codec)
        }, 300),
        []
    )

    const formatRoomId = (id: string | undefined): string => {
        if (!id || typeof id !== 'string') {
            console.warn('formatRoomId: Некорректный ID:', id);
            return ''; // Возвращаем пустую строку или дефолтное значение
        }
        const cleanedId = id.replace(/[^A-Z0-9]/gi, '');
        return cleanedId.replace(/(.{4})(?=.)/g, '$1-');
    }

    const handleRoomIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.toUpperCase()
        let cleanedInput = input.replace(/[^A-Z0-9-]/gi, '')
        if (cleanedInput.length > 19) {
            cleanedInput = cleanedInput.substring(0, 19)
        }
        const formatted = formatRoomId(cleanedInput)
        setRoomId(formatted)
    }, [])

    const isRoomIdComplete = roomId.replace(/-/g, '').length === 16

    const handleSaveRoom = useCallback(
        debounce(async () => {
            if (!isRoomIdComplete) return;

            try {
                console.log('handleSaveRoom: Сохранение комнаты:', { roomId, autoJoin });
                const normalizedRoomId = roomId.replace(/-/g, '');
                const response = await saveRoom(normalizedRoomId, autoJoin);
                console.log('handleSaveRoom: Ответ saveRoom:', response);
                if (response.message === 'Комната уже существует в сохраненных комнатах') {
                    setShowRoomExistsDialog(true);
                    setTimeout(() => setShowRoomExistsDialog(false), 5000);
                    return;
                }
                if (response.isProxy) {
                    console.log('handleSaveRoom: Сохранена как прокси-комната:', normalizedRoomId);
                    // Проверяем, появилась ли прокси-комната в списке
                    const updatedRooms = await getSavedRooms();
                    console.log('handleSaveRoom: Проверка прокси-комнат:', updatedRooms.proxyRooms);
                }
                const updatedRooms = await getSavedRooms();
                console.log('handleSaveRoom: Обновленные комнаты:', updatedRooms);
                if (updatedRooms.rooms && updatedRooms.proxyRooms) {
                    const roomsWithDevices = await Promise.all(
                        updatedRooms.rooms.map(async (room) => {
                            const roomWithDevice = await getSavedRoomWithDevice(room.id);
                            return {
                                id: room.id,
                                isDefault: room.isDefault,
                                autoConnect: room.autoConnect,
                                deviceId: roomWithDevice.deviceId,
                                proxyAccess: room.proxyAccess,
                            };
                        })
                    );
                    // Фильтруем валидные прокси-комнаты
                    const validProxyRooms = updatedRooms.proxyRooms.filter(
                        (proxy) => typeof proxy.id === 'string' && proxy.id.length > 0
                    );
                    console.log('handleSaveRoom: Установка состояний:', { roomsWithDevices, validProxyRooms });
                    setSavedRooms(roomsWithDevices);
                    setSavedProxyRooms(validProxyRooms);
                } else {
                    console.error('handleSaveRoom: Неверный формат ответа getSavedRooms:', updatedRooms);
                    setError('Ошибка обновления списка комнат');
                }
            } catch (err) {
                console.error('handleSaveRoom: Ошибка:', err);
                setError((err as Error).message);
            }
        }, 300),
        [roomId, autoJoin]
    );

    const handleDeleteRoom = useCallback(
        debounce((roomIdWithoutDashes: string) => {
            setRoomToDelete(roomIdWithoutDashes)
            setShowDeleteDialog(true)
        }, 300),
        []
    )

    const handleDeleteProxyRoom = useCallback(
        debounce(async (proxyRoomId: string) => {
            console.log('handleDeleteProxyRoom: Начало удаления прокси-комнаты:', { proxyRoomId });
            try {
                const response = await deleteProxyAccess(proxyRoomId);
                console.log('handleDeleteProxyRoom: Ответ deleteProxyAccess:', response);
                if (response.error) {
                    console.error('handleDeleteProxyRoom: Ошибка:', response.error);
                    setError(response.error);
                    return;
                }
                const updatedRooms = await getSavedRooms();
                if (updatedRooms.rooms && updatedRooms.proxyRooms) {
                    const roomsWithDevices = await Promise.all(
                        updatedRooms.rooms.map(async (room) => {
                            const roomWithDevice = await getSavedRoomWithDevice(room.id);
                            return {
                                id: room.id,
                                isDefault: room.isDefault,
                                autoConnect: room.autoConnect,
                                deviceId: roomWithDevice.deviceId,
                                proxyAccess: room.proxyAccess,
                            };
                        })
                    );
                    setSavedRooms(roomsWithDevices);
                    setSavedProxyRooms(updatedRooms.proxyRooms);
                    console.log('handleDeleteProxyRoom: Обновлены списки комнат:', { roomsWithDevices, proxyRooms: updatedRooms.proxyRooms });
                    // Если удаленная прокси-комната была выбрана, сбрасываем roomId
                    if (roomId.replace(/-/g, '') === proxyRoomId) {
                        setRoomId('');
                        setAutoJoin(false);
                        setSelectedDeviceId(null);
                    }
                } else {
                    console.error('handleDeleteProxyRoom: Неверный формат ответа getSavedRooms:', updatedRooms);
                    setError('Ошибка обновления списка комнат');
                }
            } catch (err) {
                console.error('handleDeleteProxyRoom: Ошибка:', err);
                setError((err as Error).message);
            }
        }, 300),
        [roomId]
    );

    const confirmDeleteRoom = useCallback(
        debounce(async () => {
            if (!roomToDelete) return

            try {
                await deleteRoom(roomToDelete)
                const updatedRooms = await getSavedRooms()
                const roomsWithDevices = await Promise.all(
                    updatedRooms.rooms.map(async (room) => {
                        const roomWithDevice = await getSavedRoomWithDevice(room.id)
                        return {
                            id: room.id,
                            isDefault: room.isDefault,
                            autoConnect: room.autoConnect,
                            deviceId: roomWithDevice.deviceId
                        }
                    })
                )
                setSavedRooms(roomsWithDevices)

                if (roomId.replace(/-/g, '') === roomToDelete) {
                    setRoomId('')
                    setAutoJoin(false)
                    setSelectedDeviceId(null)
                }
            } catch (err) {
                console.error('Ошибка удаления комнаты:', err)
                setError((err as Error).message)
            }

            setShowDeleteDialog(false)
            setRoomToDelete(null)
        }, 300),
        [roomToDelete, roomId]
    )

    const handleSelectRoom = useCallback(
        debounce(async (roomIdWithoutDashes: string) => {
            console.log('handleSelectRoom: Выбрана комната:', roomIdWithoutDashes);
            const selectedRoom = savedRooms.find((r) => r.id === roomIdWithoutDashes);
            const selectedProxyRoom = savedProxyRooms.find((r) => r.id === roomIdWithoutDashes);
            if (selectedRoom) {
                setRoomId(formatRoomId(roomIdWithoutDashes));
                setAutoJoin(selectedRoom.autoConnect);
                setSelectedDeviceId(selectedRoom.deviceId);
                hasAttemptedAutoJoin.current = false; // Сбрасываем флаг для новой комнаты
            } else if (selectedProxyRoom) {
                setRoomId(formatRoomId(roomIdWithoutDashes));
                setAutoJoin(selectedProxyRoom.autoConnect);
                setSelectedDeviceId(null);
                hasAttemptedAutoJoin.current = false; // Сбрасываем флаг для новой комнаты
            }
        }, 300),
        [savedRooms, savedProxyRooms]
    );

    const handleSetDefaultRoom = useCallback(
        async (roomId: string) => {
            try {
                console.log('Установка комнаты по умолчанию:', roomId);
                await setDefaultRoom(roomId.replace(/-/g, ''));
                console.log('setDefaultRoom выполнено успешно');
                const response = await getSavedRooms();
                if (response.error) {
                    console.error('Ошибка загрузки комнат:', response.error);
                    setError(response.error);
                    return;
                }
                if (!response.rooms || !Array.isArray(response.rooms)) {
                    console.error('Комнаты не найдены или имеют неверный формат:', response);
                    setError('Комнаты не найдены');
                    return;
                }
                const roomsWithDevices = await Promise.all(
                    response.rooms.map(async (room) => {
                        const roomWithDevice = await getSavedRoomWithDevice(room.id);
                        return {
                            id: room.id,
                            isDefault: room.isDefault,
                            autoConnect: room.autoConnect,
                            deviceId: roomWithDevice.deviceId,
                            proxyAccess: room.proxyAccess,
                        };
                    })
                );
                console.log('Обновленные комнаты:', roomsWithDevices);
                setSavedRooms(roomsWithDevices);
                setSavedProxyRooms(response.proxyRooms || []);

                // Если автоподключение активно, прерываем его
                if (autoJoin && roomId.replace(/-/g, '') !== roomId) {
                    setAutoJoin(false);
                    updateAutoConnect(roomId.replace(/-/g, ''), false);
                    setSavedRooms((prev) =>
                        prev.map((r) => (r.id === roomId.replace(/-/g, '') ? { ...r, autoConnect: false } : r))
                    );
                    setSavedProxyRooms((prev) =>
                        prev.map((p) => (p.id === roomId.replace(/-/g, '') ? { ...p, autoConnect: false } : p))
                    );
                    leaveRoom(); // Прерываем текущее подключение
                }
            } catch (e) {
                console.error('Ошибка установки комнаты по умолчанию:', e);
                setError(`Не удалось установить комнату по умолчанию: ${e instanceof Error ? e.message : String(e)}`);
            }
        },
        [setError, autoJoin, roomId, updateAutoConnect, leaveRoom]
    );

    const handleBindDeviceToRoom = useCallback(
        debounce(async () => {
            if (!isRoomIdComplete || !selectedDeviceId) return;

            try {
                await bindDeviceToRoom(roomId.replace(/-/g, ''), selectedDeviceId);
                const updatedRooms = await getSavedRooms();
                const roomsWithDevices = await Promise.all(
                    updatedRooms.rooms.map(async (room) => {
                        const roomWithDevice = await getSavedRoomWithDevice(room.id);
                        return {
                            id: room.id,
                            isDefault: room.isDefault,
                            autoConnect: room.autoConnect,
                            deviceId: roomWithDevice.deviceId,
                        };
                    })
                );
                setSavedRooms(roomsWithDevices);
            } catch (err) {
                console.error('Ошибка привязки устройства:', err);
                if (err instanceof Error && err.name === 'PrismaClientKnownRequestError' && err.message.includes('Unique constraint failed on the fields: (`devicesId`)')) {
                    // Показать диалоговое окно на 3 секунды
                    setShowDeviceBoundDialog(true);
                    setTimeout(() => {
                        setShowDeviceBoundDialog(false);
                    }, 3000);
                } else {
                    setError((err as Error).message);
                }
            }
        }, 300),
        [roomId, selectedDeviceId]
    );

    const handleUnbindDeviceFromRoom = useCallback(
        debounce(async () => {
            if (!isRoomIdComplete) return

            try {
                await bindDeviceToRoom(roomId.replace(/-/g, ''), null)
                const updatedRooms = await getSavedRooms()
                const roomsWithDevices = await Promise.all(
                    updatedRooms.rooms.map(async (room) => {
                        const roomWithDevice = await getSavedRoomWithDevice(room.id)
                        return {
                            id: room.id,
                            isDefault: room.isDefault,
                            autoConnect: room.autoConnect,
                            deviceId: roomWithDevice.deviceId
                        }
                    })
                )
                setSavedRooms(roomsWithDevices)
                setSelectedDeviceId(null)
            } catch (err) {
                console.error('Ошибка отвязки устройства:', err)
                setError((err as Error).message)
            }
        }, 300),
        [roomId]
    )

    const toggleCamera = useCallback(
        debounce(() => {
            const newCameraState = !useBackCamera
            setUseBackCamera(newCameraState)
            localStorage.setItem('useBackCamera', String(newCameraState))

            if (isConnected && ws) {
                try {
                    ws.send(JSON.stringify({
                        type: "switch_camera",
                        useBackCamera: newCameraState,
                        room: roomId,
                        username: username
                    }))
                    console.log('Sent camera switch command:', { useBackCamera: newCameraState })
                } catch (err) {
                    console.error('Error sending camera switch command:', err)
                    setError('Failed to switch camera')
                }
            } else {
                console.error('Not connected to WebRTC server')
                setError('No connection to server')
            }
        }, 300),
        [useBackCamera, isConnected, ws, roomId, username]
    )

    useEffect(() => {
        if (localStream) {
            localAudioTracks.current = localStream.getAudioTracks();
            localAudioTracks.current.forEach(track => {
                track.enabled = !muteLocalAudio;
            });
        }
    }, [localStream, muteLocalAudio]);

    useEffect(() => {
        if (remoteStream) {
            remoteStream.getAudioTracks().forEach(track => {
                track.enabled = !muteRemoteAudio;
            });
        }
    }, [remoteStream, muteRemoteAudio])

    const applyVideoTransform = useCallback((settings: VideoSettings) => {
        const { rotation, flipH, flipV } = settings
        let transform = ''
        if (rotation !== 0) transform += `rotate(${rotation}deg) `
        transform += `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`
        setVideoTransform(transform)

        if (remoteVideoRef.current) {
            remoteVideoRef.current.style.transform = transform
            remoteVideoRef.current.style.transformOrigin = 'center center'
        }
    }, [])

    const saveSettings = useCallback((settings: VideoSettings) => {
        localStorage.setItem('videoSettings', JSON.stringify(settings))
    }, [])

    const loadDevicesForMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })

            stream.getTracks().forEach(track => track.stop())

            const devices = await navigator.mediaDevices.enumerateDevices()
            setDevices(devices)
            setHasPermission(true)
            setDevicesLoaded(true)

            const savedVideoDevice = localStorage.getItem('videoDevice')
            const savedAudioDevice = localStorage.getItem('audioDevice')

            setSelectedDevices({
                video: savedVideoDevice || '',
                audio: savedAudioDevice || ''
            })
        } catch (error) {
            console.error('Device access error:', error)
            setHasPermission(false)
            setDevicesLoaded(true)
        }
    }

    const toggleLocalVideo = useCallback(
        debounce(() => {
            const newState = !showLocalVideo
            setShowLocalVideo(newState)
            localStorage.setItem('showLocalVideo', String(newState))
        }, 300),
        [showLocalVideo]
    )

    const updateVideoSettings = useCallback((newSettings: Partial<VideoSettings>) => {
        const updated = { ...videoSettings, ...newSettings }
        setVideoSettings(updated)
        applyVideoTransform(updated)
        saveSettings(updated)
    }, [videoSettings, applyVideoTransform, saveSettings])

    const handleDeviceChange = useCallback(
        debounce((type: 'video' | 'audio', deviceId: string) => {
            setSelectedDevices(prev => ({
                ...prev,
                [type]: deviceId
            }))
            localStorage.setItem(`${type}Device`, deviceId)
        }, 300),
        []
    )

    const handleJoinRoom = useCallback(
        debounce(async () => {
            if (!isRoomIdComplete) {
                console.warn('ID комнаты не полный, подключение невозможно');
                setError('ID комнаты должен состоять из 16 символов');
                return;
            }

            setIsJoining(true);
            console.log('Попытка подключения к комнате:', roomId);

            try {
                // Проверяем комнату через checkRoom
                const checkResult = await checkRoom(roomId.replace(/-/g, ''));
                console.log('handleJoinRoom: Проверка комнаты:', {
                    roomId,
                    isProxy: checkResult.isProxy,
                    targetRoomId: checkResult.targetRoomId,
                    deviceId: checkResult.deviceId,
                });
                if (checkResult.error) {
                    console.error('Ошибка checkRoom:', checkResult.error);
                    setError(`Ошибка проверки комнаты: ${checkResult.error}`);
                    setIsJoining(false);
                    return;
                }
                if (!checkResult.found) {
                    console.error('Комната не найдена в SavedRoom или ProxyAccess');
                    setError('Комната не найдена');
                    setShowRoomNotExistDialog(true);
                    setTimeout(() => setShowRoomNotExistDialog(false), 5000);
                    setIsJoining(false);
                    return;
                }

                // Устанавливаем targetRoomId и deviceId
                setTargetRoomId(checkResult.targetRoomId);
                setSelectedDeviceId(checkResult.deviceId || null);

                // Если это прокси-подключение, показываем уведомление
                if (checkResult.isProxy) {
                    const proxyNotification = document.createElement('div');
                    proxyNotification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg';
                    proxyNotification.textContent = 'Подключение через прокси-комнату';
                    document.body.appendChild(proxyNotification);
                    setTimeout(() => proxyNotification.remove(), 3000);
                }

                // Устанавливаем комнату по умолчанию
                await handleSetDefaultRoom(roomId.replace(/-/g, ''));

                // Подключаемся к комнате через WebRTC
                await joinRoom(username, checkResult.targetRoomId);
                console.log('Успешно подключено к комнате:', roomId);
                setActiveMainTab('esp');
            } catch (error) {
                console.error('Ошибка подключения к комнате:', error);
                setError(`Ошибка подключения: ${(error instanceof Error ? error.message : String(error))}`);
            } finally {
                setIsJoining(false);
                console.log('Состояние isJoining сброшено');
            }
        }, 300),
        [isRoomIdComplete, roomId, username, joinRoom, setError, handleSetDefaultRoom]
    );

    useEffect(() => {
        if (
            autoJoin &&
            hasPermission &&
            !isInRoom &&
            isRoomIdComplete &&
            !isJoining &&
            !error &&
            !hasAttemptedAutoJoin.current
        ) {
            console.log('Инициируется автоподключение к комнате:', roomId);
            hasAttemptedAutoJoin.current = true;
            handleJoinRoom();
        } else if (error && autoJoin) {
            console.warn('Ошибка автоподключения, отключение autoJoin:', error);
            leaveRoom(); // Полная очистка соединения
            setAutoJoin(false);
            updateAutoConnect(roomId.replace(/-/g, ''), false);
            setSavedRooms((prev) =>
                prev.map((r) => (r.id === roomId.replace(/-/g, '') ? { ...r, autoConnect: false } : r))
            );
            setSavedProxyRooms((prev) =>
                prev.map((p) => (p.id === roomId.replace(/-/g, '') ? { ...p, autoConnect: false } : p))
            );
            hasAttemptedAutoJoin.current = false;
            if (webRTCRetryTimeoutRef.current) {
                clearTimeout(webRTCRetryTimeoutRef.current);
                webRTCRetryTimeoutRef.current = null;
            }
        }
    }, [autoJoin, hasPermission, isInRoom, isRoomIdComplete, isJoining, error, handleJoinRoom, roomId, updateAutoConnect, leaveRoom]);

// Добавим новый useEffect для сброса hasAttemptedAutoJoin при изменении roomId
    useEffect(() => {
        hasAttemptedAutoJoin.current = false;
        console.log('Сброс hasAttemptedAutoJoin при изменении roomId:', roomId);
    }, [roomId]);

    const handleCancelJoin = useCallback(
        debounce(() => {
            console.log('Пользователь прервал попытку подключения');
            setIsJoining(false);
            setAutoJoin(false); // Сбрасываем автоподключение
            setError(null);
            if (webRTCRetryTimeoutRef.current) {
                clearTimeout(webRTCRetryTimeoutRef.current);
                webRTCRetryTimeoutRef.current = null;
            }
            leaveRoom();
            setActiveMainTab('webrtc');
        }, 300),
        [leaveRoom]
    );

    const toggleFullscreen = useCallback(
        debounce(async () => {
            if (!videoContainerRef.current) return

            try {
                if (!document.fullscreenElement) {
                    await videoContainerRef.current.requestFullscreen()
                    setIsFullscreen(true)
                } else {
                    await document.exitFullscreen()
                    setIsFullscreen(false)
                }
            } catch (err) {
                console.error('Fullscreen error:', err)
                setError('Failed to toggle fullscreen')
            }
        }, 300),
        []
    )

    const toggleMuteLocalAudio = useCallback(
        debounce(() => {
            const newState = !muteLocalAudio
            setMuteLocalAudio(newState)
            localStorage.setItem('muteLocalAudio', String(newState))

            localAudioTracks.current.forEach(track => {
                track.enabled = !newState
            })
        }, 300),
        [muteLocalAudio]
    )

    const toggleMuteRemoteAudio = useCallback(
        debounce(() => {
            const newState = !muteRemoteAudio
            setMuteRemoteAudio(newState)
            localStorage.setItem('muteRemoteAudio', String(newState))

            if (remoteStream) {
                remoteStream.getAudioTracks().forEach(track => {
                    track.enabled = !newState
                })
            }
        }, 300),
        [muteRemoteAudio, remoteStream]
    )

    const rotateVideo = useCallback(
        debounce((degrees: number) => {
            updateVideoSettings({ rotation: degrees })

            if (remoteVideoRef.current) {
                if (degrees === 90 || degrees === 270) {
                    remoteVideoRef.current.classList.add(styles.rotated)
                } else {
                    remoteVideoRef.current.classList.remove(styles.rotated)
                }
            }
        }, 300),
        [updateVideoSettings]
    )

    const flipVideoHorizontal = useCallback(
        debounce(() => {
            updateVideoSettings({ flipH: !videoSettings.flipH })
        }, 300),
        [videoSettings, updateVideoSettings]
    )

    const flipVideoVertical = useCallback(
        debounce(() => {
            updateVideoSettings({ flipV: !videoSettings.flipV })
        }, 300),
        [videoSettings, updateVideoSettings]
    )

    const resetVideo = useCallback(
        debounce(() => {
            updateVideoSettings({ rotation: 0, flipH: false, flipV: false })
        }, 300),
        [updateVideoSettings]
    )

    const toggleFlashlight = useCallback(
        debounce(() => {
            if (isConnected && ws) {
                try {
                    ws.send(JSON.stringify({
                        type: "toggle_flashlight",
                        room: roomId.replace(/-/g, ''),
                        username: username
                    }))
                    console.log('Sent flashlight toggle command')
                } catch (err) {
                    console.error('Error sending flashlight command:', err)
                    setError('Failed to toggle flashlight')
                }
            } else {
                console.error('Not connected to server')
                setError('No connection to server')
            }
        }, 300),
        [isConnected, ws, roomId, username, setError]
    )

    const toggleTab = useCallback(
        debounce((tab: 'webrtc' | 'esp' | 'cam' | 'controls') => {
            if (tab === 'cam') {
                setShowCam(!showCam)
            } else if (tab === 'controls') {
                setShowControls(!showControls)
                setActiveMainTab(null)
            } else {
                setActiveMainTab(activeMainTab === tab ? null : tab)
                setShowControls(false)
            }
        }, 300),
        [showCam, showControls, activeMainTab]
    )

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const proxyRoomId = urlParams.get('proxyRoomId');
        if (proxyRoomId) {
            handleJoinProxyRoom(proxyRoomId);
        }
    }, []);

    const handleJoinProxyRoom = async (roomIdProxy: string) => {
        try {
            const response = await joinRoomViaProxy(roomIdProxy.replace(/-/g, ''))
            console.log('Результат joinRoomViaProxy:', response)
            if (response.error) {
                console.error('Ошибка joinRoomViaProxy:', response.error)
                setError(`Ошибка подключения через прокси: ${response.error}`)
                return
            }
            const { roomId, deviceId } = response
            setRoomId(formatRoomId(roomIdProxy)) // Показываем proxyRoomId в UI
            setTargetRoomId(roomId)
            setSelectedDeviceId(deviceId || null)
            const proxyNotification = document.createElement('div')
            proxyNotification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg'
            proxyNotification.textContent = 'Подключение через прокси-комнату'
            document.body.appendChild(proxyNotification)
            setTimeout(() => proxyNotification.remove(), 3000)
            await joinRoom(username, roomId)
            console.log('Успешно подключено через прокси к комнате:', formatRoomId(roomIdProxy))
            setActiveMainTab('esp')
        } catch (err) {
            console.error('Ошибка подключения через прокси:', err)
            setError(`Ошибка подключения через прокси: ${(err as Error).message}`)
        }
    }

    const handleEnableProxy = useCallback(
        debounce(async (roomIdWithoutDashes: string, name: string) => {
            if (!roomIdWithoutDashes || roomIdWithoutDashes.length !== 16) {
                setError('Некорректный ID комнаты');
                return;
            }
            try {
                const response = await enableProxyAccess(roomIdWithoutDashes, name);
                if (response.error) {
                    setError(response.error);
                    return;
                }
                const updatedRooms = await getSavedRooms();
                setSavedRooms(updatedRooms.rooms);
                setProxyName(''); // Сбрасываем поле ввода после создания
            } catch (err) {
                console.error('Ошибка включения прокси:', err);
                setError((err as Error).message);
            }
        }, 300),
        []
    );

    const handleDisableProxy = useCallback(
        debounce(async (roomIdWithoutDashes: string) => {
            try {
                const response = await disableProxyAccess(roomIdWithoutDashes);
                if (response.error) {
                    setError(response.error);
                    return;
                }
                // Обновляем список сохраненных комнат
                const updatedRooms = await getSavedRooms();
                setSavedRooms(updatedRooms.rooms);
            } catch (err) {
                console.error('Ошибка отключения прокси:', err);
                setError((err as Error).message);
            }
        }, 300),
        []
    );

    const handleDeleteProxy = useCallback(
        debounce(async (proxyRoomId: string) => {
            try {
                const response = await deleteProxyAccess(proxyRoomId);
                if (response.error) {
                    setError(response.error);
                    return;
                }
                // Обновляем список комнат и прокси-доступов
                const updatedRooms = await getSavedRooms();
                if (updatedRooms.rooms && updatedRooms.proxyRooms) {
                    const roomsWithDevices = await Promise.all(
                        updatedRooms.rooms.map(async (room) => {
                            const roomWithDevice = await getSavedRoomWithDevice(room.id);
                            return {
                                id: room.id,
                                isDefault: room.isDefault,
                                autoConnect: room.autoConnect,
                                deviceId: roomWithDevice.deviceId,
                                proxyAccess: room.proxyAccess,
                            };
                        })
                    );
                    setSavedRooms(roomsWithDevices);
                    setSavedProxyRooms(updatedRooms.proxyRooms);
                }
            } catch (err) {
                console.error('Ошибка удаления прокси:', err);
                setError((err as Error).message);
            }
        }, 300),
        []
    );

    return (
        <div className={styles.container} suppressHydrationWarning>
            <div ref={videoContainerRef} className={styles.remoteVideoContainer} suppressHydrationWarning>
                {isClient && (
                    <VideoPlayer
                        stream={remoteStream}
                        className={styles.remoteVideo}
                        transform={videoTransform}
                        videoRef={remoteVideoRef}
                    />
                )}
            </div>

            {showLocalVideo && (
                <div className={styles.localVideoContainer}>
                    <VideoPlayer
                        stream={localStream}
                        muted
                        className={styles.localVideo}
                    />
                </div>
            )}

            <div className={styles.topControls}>
                <div className={styles.tabsContainer}>
                    <button
                        onClick={() => toggleTab('webrtc')}
                        onTouchEnd={() => toggleTab('webrtc')}
                        className={[styles.tabButton, activeMainTab === 'webrtc' ? styles.activeTab : ''].join(' ')}
                    >
                        {activeMainTab === 'webrtc' ? '▲' : '▼'} <img src="/cam.svg" alt="Camera" />
                    </button>
                    <button
                        onClick={() => toggleTab('esp')}
                        onTouchEnd={() => toggleTab('esp')}
                        className={[styles.tabButton, activeMainTab === 'esp' ? styles.activeTab : ''].join(' ')}
                    >
                        {activeMainTab === 'esp' ? '▲' : '▼'} <img src="/joy.svg" alt="Joystick" />
                    </button>
                    <button
                        onClick={() => toggleTab('cam')}
                        onTouchEnd={() => toggleTab('cam')}
                        className={[styles.tabButton, showCam ? styles.activeTab : ''].join(' ')}
                    >
                        {showCam ? '▲' : '▼'} <img src="/img.svg" alt="Image" />
                    </button>
                </div>
            </div>

            {activeMainTab === 'webrtc' && (
                <div className={[styles.tabContent, styles.webrtcTab].join(' ')}>
                    {error && <div className={styles.error}>{error}</div>}
                    <div className={styles.controls}>
                        <div className={styles.connectionStatus}>
                            Статус: {isConnected ? (isInRoom ? `В комнате ${roomId}` : 'Подключено') : 'Отключено'}
                            {isCallActive && ' (Звонок активен)'}
                            {activeCodec && ` [Кодек: ${activeCodec}]`}
                            {users.length > 0 && (
                                <div>
                                    Роль: "Ведомый"
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className={styles.error}>
                                {error === 'Room does not exist. Leader must join first.'
                                    ? 'Ожидание создания комнаты ведущим... Повторная попытка через 5 секунд'
                                    : error}
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <Label htmlFor="room">ID комнаты</Label>
                            <Input
                                id="room"
                                value={roomId}
                                onChange={handleRoomIdChange}
                                disabled={isInRoom || isJoining}
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                maxLength={19}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Label htmlFor="proxyName">Название прокси-комнаты (опционально)</Label>
                            <Input
                                id="proxyName"
                                value={proxyName}
                                onChange={(e) => setProxyName(e.target.value)}
                                placeholder="Введите название прокси"
                                className={styles.input}
                            />
                            <Button
                                onClick={() => handleEnableProxy(roomId.replace(/-/g, ''), proxyName)}
                                disabled={!isRoomIdComplete}
                                className={styles.button}
                            >
                                Включить прокси-доступ
                            </Button>
                            {savedRooms.find((r) => r.id === roomId.replace(/-/g, ''))?.proxyAccess?.length > 0 && (
                                <div className={styles.proxyList}>
                                    <h4>Прокси-доступы:</h4>
                                    <ul>
                                        {savedRooms
                                            .find((r) => r.id === roomId.replace(/-/g, ''))?.proxyAccess
                                            .map((proxy) => (
                                                <li key={proxy.proxyRoomId} className={styles.proxyItem}>
              <span>
                Прокси-ID: {formatRoomId(proxy.proxyRoomId)}
                  {proxy.name && ` (${proxy.name})`}
              </span>
                                                    <Button
                                                        onClick={() => handleDeleteProxy(proxy.proxyRoomId)}
                                                        className={`${styles.button} ${styles.deleteButton}`}
                                                        variant="destructive"
                                                    >
                                                        Удалить
                                                    </Button>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <Label htmlFor="username">Ваше имя</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isInRoom || isJoining}
                                placeholder="Ваше имя"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            {isInRoom ? (
                                <Button
                                    onClick={() => {
                                        leaveRoom();
                                        setActiveMainTab('webrtc');
                                        setIsJoining(false);
                                        setAutoJoin(false);
                                        updateAutoConnect(roomId.replace(/-/g, ''), false);
                                        hasAttemptedAutoJoin.current = false;
                                        if (webRTCRetryTimeoutRef.current) {
                                            clearTimeout(webRTCRetryTimeoutRef.current);
                                            webRTCRetryTimeoutRef.current = null;
                                        }
                                    }}
                                    disabled={!isConnected}
                                    className={styles.button}
                                >
                                    Покинуть комнату
                                </Button>
                            ) : isJoining ? (
                                <Button
                                    // onClick={handleCancelJoin}
                                    disabled={true}
                                    className={styles.button}
                                    variant="destructive"
                                >
                                    Подключение...
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleJoinRoom}
                                    disabled={!hasPermission || !isRoomIdComplete}
                                    className={styles.button}
                                >
                                    Войти в комнату
                                </Button>
                            )}
                        </div>

                        <Button
                            onClick={() => {
                                leaveRoom();
                                setAutoJoin(false);
                                setIsJoining(false);
                                setError(null);
                                setActiveMainTab('webrtc');
                                hasAttemptedAutoJoin.current = false;
                                if (webRTCRetryTimeoutRef.current) {
                                    clearTimeout(webRTCRetryTimeoutRef.current);
                                    webRTCRetryTimeoutRef.current = null;
                                }
                                setShowDisconnectDialog(true);
                                setTimeout(() => setShowDisconnectDialog(false), 3000);
                            }}
                            className={styles.button}
                        >
                            Отключить подключение
                        </Button>

                        <div className={styles.inputGroup}>
                            <Button
                                onClick={handleSaveRoom}
                                disabled={!isRoomIdComplete || savedRooms.some((r) => r.id === roomId.replace(/-/g, ''))}
                                className={styles.button}
                            >
                                Сохранить ID комнаты
                            </Button>
                        </div>

                        {(savedRooms.length > 0 || savedProxyRooms.length > 0) && (
                            <>
                                <h3>Сохраненные комнаты:</h3>
                                <ul>
                                    {savedRooms.map((room) => (
                                        <li key={room.id} className={styles.savedRoomItem}>
    <span
        onClick={() => handleSelectRoom(room.id)}
        onTouchEnd={() => handleSelectRoom(room.id)}
        className={room.isDefault ? styles.defaultRoom : ''}
    >
      {formatRoomId(room.id)}
    </span>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`default-room-${room.id}`}
                                                    checked={room.isDefault}
                                                    onCheckedChange={async (checked) => {
                                                        if (checked) {
                                                            await handleSetDefaultRoom(room.id); // Используем handleSetDefaultRoom
                                                        } else if (room.isDefault) {
                                                            await resetDefaultRoom();
                                                            // Обновляем состояние после сброса
                                                            const response = await getSavedRooms();
                                                            if (response.rooms && response.proxyRooms) {
                                                                const roomsWithDevices = await Promise.all(
                                                                    response.rooms.map(async (r) => {
                                                                        const roomWithDevice = await getSavedRoomWithDevice(r.id);
                                                                        return {
                                                                            id: r.id,
                                                                            isDefault: r.isDefault,
                                                                            autoConnect: r.autoConnect,
                                                                            deviceId: roomWithDevice.deviceId,
                                                                            proxyAccess: r.proxyAccess,
                                                                        };
                                                                    })
                                                                );
                                                                setSavedRooms(roomsWithDevices);
                                                                setSavedProxyRooms(response.proxyRooms);
                                                            }
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={`default-room-${room.id}`}>По умолчанию</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`autoConnect-room-${room.id}`}
                                                    checked={room.autoConnect}
                                                    onCheckedChange={(checked) => {
                                                        updateAutoConnect(room.id, !!checked);
                                                        setSavedRooms((prev) =>
                                                            prev.map((r) => (r.id === room.id ? { ...r, autoConnect: !!checked } : r))
                                                        );
                                                    }}
                                                />
                                                <Label htmlFor={`autoConnect-room-${room.id}`}>Автоподключение</Label>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteRoom(room.id)}
                                                onTouchEnd={() => handleDeleteRoom(room.id)}
                                                className={styles.deleteRoomButton}
                                            >
                                                Удалить
                                            </button>
                                        </li>
                                    ))}
                                    {savedProxyRooms.map((proxy) => (
                                        <li key={proxy.id} className={styles.savedRoomItem}>
    <span
        onClick={() => handleSelectRoom(proxy.id)}
        onTouchEnd={() => handleSelectRoom(proxy.id)}
        className={proxy.isDefault ? styles.defaultRoom : ''}
    >
      {formatRoomId(proxy.id)} (прокси)
    </span>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`default-proxy-${proxy.id}`}
                                                    checked={proxy.isDefault}
                                                    onCheckedChange={async (checked) => {
                                                        if (checked) {
                                                            await handleSetDefaultRoom(formatRoomId(proxy.id)); // Используем handleSetDefaultRoom
                                                        } else if (proxy.isDefault) {
                                                            await resetDefaultRoom();
                                                            // Обновляем состояние после сброса
                                                            const response = await getSavedRooms();
                                                            if (response.rooms && response.proxyRooms) {
                                                                const roomsWithDevices = await Promise.all(
                                                                    response.rooms.map(async (r) => {
                                                                        const roomWithDevice = await getSavedRoomWithDevice(r.id);
                                                                        return {
                                                                            id: r.id,
                                                                            isDefault: r.isDefault,
                                                                            autoConnect: r.autoConnect,
                                                                            deviceId: roomWithDevice.deviceId,
                                                                            proxyAccess: r.proxyAccess,
                                                                        };
                                                                    })
                                                                );
                                                                setSavedRooms(roomsWithDevices);
                                                                setSavedProxyRooms(response.proxyRooms);
                                                            }
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={`default-proxy-${proxy.id}`}>По умолчанию</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`autoConnect-proxy-${proxy.id}`}
                                                    checked={proxy.autoConnect}
                                                    onCheckedChange={(checked) => {
                                                        updateAutoConnect(proxy.id, !!checked);
                                                        setSavedProxyRooms((prev) =>
                                                            prev.map((p) => (p.id === proxy.id ? { ...p, autoConnect: !!checked } : p))
                                                        );
                                                    }}
                                                />
                                                <Label htmlFor={`autoConnect-proxy-${proxy.id}`}>Автоподключение</Label>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteProxyRoom(proxy.id)}
                                                onTouchEnd={() => handleDeleteProxyRoom(proxy.id)}
                                                className={styles.deleteRoomButton}
                                            >
                                                Удалить
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        <div className={styles.inputGroup}>
                            <Label htmlFor="codec">Кодек трансляции</Label>
                            <select
                                id="codec"
                                value={selectedCodec}
                                onChange={handleCodecChange}
                                disabled={isInRoom}
                                className={styles.codecSelect}
                            >
                                <option value="VP8">VP8</option>
                                <option value="AV1" disabled>AV1 - в разработке</option>
                                <option value="H264" disabled>H264 - в разработке</option>
                                <option value="VP9" disabled>VP9 - в разработке</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <Label htmlFor="device">Привязать устройство к комнате</Label>
                            <div className="flex space-x-2">
                                <Select
                                    value={selectedDeviceId || ''}
                                    onValueChange={setSelectedDeviceId}
                                    disabled={isInRoom || isJoining}
                                >
                                    <SelectTrigger className="flex-1 bg-transparent h-8 sm:h-10">
                                        <SelectValue placeholder="Выберите устройство" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-transparent backdrop-blur-sm border border-gray-200">
                                        {availableDevices.map(device => (
                                            <SelectItem key={device.idDevice} value={device.idDevice} className="hover:bg-gray-100/50 text-xs sm:text-sm">
                                                {formatRoomId(device.idDevice)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {!savedRooms.find(r => r.id === roomId.replace(/-/g, '') && r.deviceId) && (
                                    <Button
                                        onClick={handleBindDeviceToRoom}
                                        disabled={!isRoomIdComplete || !selectedDeviceId}
                                        className="bg-blue-600 hover:bg-blue-700 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
                                    >
                                        Привязать
                                    </Button>
                                )}
                                {savedRooms.find(r => r.id === roomId.replace(/-/g, '') && r.deviceId) && (
                                    <Button
                                        onClick={handleUnbindDeviceFromRoom}
                                        className="bg-red-600 hover:bg-red-700 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
                                    >
                                        Отвязать
                                    </Button>
                                )}
                            </div>
                            {savedRooms.find(r => r.id === roomId.replace(/-/g, '') && r.deviceId) && (
                                <span className="text-xs sm:text-sm text-gray-600">
            Привязано устройство: {formatRoomId(savedRooms.find(r => r.id === roomId.replace(/-/g, ''))?.deviceId || '')}
        </span>
                            )}
                        </div>

                        <div className={styles.userList}>
                            <h3>Участники ({users.length}):</h3>
                            <ul>
                                {users.map((user, index) => (
                                    <li key={index}>{user}</li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.deviceSelection}>
                            <h3>Выбор устройств:</h3>
                            {devicesLoaded ? (
                                <DeviceSelector
                                    devices={devices}
                                    selectedDevices={selectedDevices}
                                    onChange={handleDeviceChange}
                                    onRefresh={loadDevicesForMedia}
                                />
                            ) : (
                                <div>Загрузка устройств...</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeMainTab === 'esp' && (
                <SocketClient
                    onConnectionStatusChange={setIsDeviceConnected}
                    selectedDeviceId={selectedDeviceId}
                />
            )}

            {showCam && (
                <div className={styles.tabContent}>
                    <div className={styles.videoControlsTab}>
                        <div className={styles.controlButtons}>
                            <button
                                onClick={toggleCamera}
                                onTouchEnd={toggleCamera}
                                className={[styles.controlButton, useBackCamera ? styles.active : ''].join(' ')}
                                title={useBackCamera ? 'Переключить на фронтальную камеру' : 'Переключить на заднюю камеру'}
                            >
                                {useBackCamera ? '📷⬅️' : '📷➡️'}
                            </button>
                            <button
                                onClick={() => rotateVideo(0)}
                                onTouchEnd={() => rotateVideo(0)}
                                className={[styles.controlButton, videoSettings.rotation === 0 ? styles.active : ''].join(' ')}
                                title="Обычная ориентация"
                            >
                                ↻0°
                            </button>
                            <button
                                onClick={() => rotateVideo(90)}
                                onTouchEnd={() => rotateVideo(90)}
                                className={[styles.controlButton, videoSettings.rotation === 90 ? styles.active : ''].join(' ')}
                                title="Повернуть на 90°"
                            >
                                ↻90°
                            </button>
                            <button
                                onClick={() => rotateVideo(180)}
                                onTouchEnd={() => rotateVideo(180)}
                                className={[styles.controlButton, videoSettings.rotation === 180 ? styles.active : ''].join(' ')}
                                title="Повернуть на 180°"
                            >
                                ↻180°
                            </button>
                            <button
                                onClick={() => rotateVideo(270)}
                                onTouchEnd={() => rotateVideo(270)}
                                className={[styles.controlButton, videoSettings.rotation === 270 ? styles.active : ''].join(' ')}
                                title="Повернуть на 270°"
                            >
                                ↻270°
                            </button>
                            <button
                                onClick={flipVideoHorizontal}
                                onTouchEnd={flipVideoHorizontal}
                                className={[styles.controlButton, videoSettings.flipH ? styles.active : ''].join(' ')}
                                title="Отразить по горизонтали"
                            >
                                ⇄
                            </button>
                            <button
                                onClick={flipVideoVertical}
                                onTouchEnd={flipVideoVertical}
                                className={[styles.controlButton, videoSettings.flipV ? styles.active : ''].join(' ')}
                                title="Отразить по вертикали"
                            >
                                ⇅
                            </button>
                            <button
                                onClick={resetVideo}
                                onTouchEnd={resetVideo}
                                className={styles.controlButton}
                                title="Сбросить настройки"
                            >
                                ⟲
                            </button>
                            <button
                                onClick={toggleFullscreen}
                                onTouchEnd={toggleFullscreen}
                                className={styles.controlButton}
                                title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
                            >
                                {isFullscreen ? '✕' : '⛶'}
                            </button>
                            <button
                                onClick={toggleLocalVideo}
                                onTouchEnd={toggleLocalVideo}
                                className={[styles.controlButton, !showLocalVideo ? styles.active : ''].join(' ')}
                                title={showLocalVideo ? 'Скрыть локальное видео' : 'Показать локальное видео'}
                            >
                                {showLocalVideo ? '👁' : '👁‍🗨'}
                            </button>
                            <button
                                onClick={toggleMuteLocalAudio}
                                onTouchEnd={toggleMuteLocalAudio}
                                className={[styles.controlButton, muteLocalAudio ? styles.active : ''].join(' ')}
                                title={muteLocalAudio ? 'Включить микрофон' : 'Отключить микрофон'}
                            >
                                {muteLocalAudio ? '🚫🎤' : '🎤'}
                            </button>
                            <button
                                onClick={toggleMuteRemoteAudio}
                                onTouchEnd={toggleMuteRemoteAudio}
                                className={[styles.controlButton, muteRemoteAudio ? styles.active : ''].join(' ')}
                                title={muteRemoteAudio ? 'Включить звук' : 'Отключить звук'}
                            >
                                {muteRemoteAudio ? '🔇' : '🔈'}
                            </button>
                            <button
                                onClick={toggleFlashlight}
                                onTouchEnd={toggleFlashlight}
                                className={styles.controlButton}
                                title="Включить/выключить фонарик"
                            >
                                💡
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Удалить комнату?</DialogTitle>
                    </DialogHeader>
                    <p>Вы уверены, что хотите удалить комнату {roomToDelete ? formatRoomId(roomToDelete) : ''}?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Отмена
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteRoom}>
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeviceBoundDialog} onOpenChange={setShowDeviceBoundDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ошибка привязки устройства</DialogTitle>
                    </DialogHeader>
                    <p>Это устройство уже привязано к другой комнате.</p>
                </DialogContent>
            </Dialog>
            <Dialog open={showProxyExistsDialog} onOpenChange={setShowProxyExistsDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ошибка включения прокси</DialogTitle>
                    </DialogHeader>
                    <p>Прокси-доступ для этой комнаты уже включен.</p>
                </DialogContent>
            </Dialog>

            <Dialog open={showRoomNotExistDialog} onOpenChange={setShowRoomNotExistDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Комната недоступна</DialogTitle>
                    </DialogHeader>
                    <p>Лидер еще не подключился к комнате. Пожалуйста, подождите или свяжитесь с лидером.</p>
                </DialogContent>
            </Dialog>
            <Dialog open={showRoomExistsDialog} onOpenChange={setShowRoomExistsDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Комната уже существует</DialogTitle>
                    </DialogHeader>
                    <p>Такая комната уже сохранена в списке сохраненных комнат.</p>
                </DialogContent>
            </Dialog>

            <Dialog open={error === 'Не удалось подключиться после максимального количества попыток'} onOpenChange={() => setError(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ошибка подключения</DialogTitle>
                    </DialogHeader>
                    <p>Не удалось подключиться к комнате после нескольких попыток. Пожалуйста, проверьте, подключен ли лидер.</p>
                    <DialogFooter>
                        <Button onClick={() => setError(null)}>Закрыть</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Подключение отключено</DialogTitle>
                    </DialogHeader>
                    <p>Вы отключили подключение. </p>
                    <DialogFooter>
                        <Button onClick={() => setShowDisconnectDialog(false)}>Закрыть</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
