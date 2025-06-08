'use client'

import { useWebRTC } from './hooks/useWebRTC'
import styles from './styles.module.css'
import { VideoPlayer } from './components/VideoPlayer'
import { DeviceSelector } from './components/DeviceSelector'
import { useEffect, useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import SocketClient from '../control/SocketClient'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { getSavedRooms, saveRoom, deleteRoom, setDefaultRoom, updateAutoConnect } from '@/app/actions'

type VideoSettings = {
    rotation: number
    flipH: boolean
    flipV: boolean
}

type SavedRoom = {
    id: string
    isDefault: boolean
    autoConnect: boolean // Добавлено поле autoConnect
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
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [roomToDelete, setRoomToDelete] = useState<string | null>(null)
    const [selectedCodec, setSelectedCodec] = useState<'VP8' | 'H264'>('VP8')
    const [isDeviceConnected, setIsDeviceConnected] = useState(false)
    const [isClient, setIsClient] = useState(false)

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
        activeCodec,
    } = useWebRTC(selectedDevices, username, roomId.replace(/-/g, ''), selectedCodec);

    useEffect(() => {
        console.log('Состояния:', { isConnected, isInRoom, isCallActive, error })
    }, [isConnected, isInRoom, isCallActive, error])

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
                const rooms = await getSavedRooms()
                setSavedRooms(rooms)
                const defaultRoom = rooms.find(r => r.isDefault)
                if (defaultRoom) {
                    setRoomId(formatRoomId(defaultRoom.id))
                    setAutoJoin(defaultRoom.autoConnect) // Устанавливаем autoJoin для комнаты по умолчанию
                }
            } catch (e) {
                console.error('Failed to load saved rooms', e)
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

        const savedCodec = localStorage.getItem('selectedCodec')
        if (savedCodec === 'VP8' || savedCodec === 'H264') {
            setSelectedCodec(savedCodec)
        }

        const savedAutoShowControls = localStorage.getItem('autoShowControls')
        if (savedAutoShowControls === 'true') {
            setActiveMainTab('esp')
        }

        loadSettings()
        loadSavedRooms()
        loadDevices()
    }, [])

    useEffect(() => {
        const savedAutoShowControls = localStorage.getItem('autoShowControls')
        if (savedAutoShowControls === 'true' && isDeviceConnected) {
            setActiveMainTab('esp')
        }
    }, [isDeviceConnected])

    const handleCodecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const codec = e.target.value as 'VP8' | 'H264'
        setSelectedCodec(codec)
        localStorage.setItem('selectedCodec', codec)
    }

    const formatRoomId = (id: string): string => {
        const cleanedId = id.replace(/[^A-Z0-9]/gi, '')
        return cleanedId.replace(/(.{4})(?=.)/g, '$1-')
    }

    const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.toUpperCase()
        let cleanedInput = input.replace(/[^A-Z0-9-]/gi, '')
        if (cleanedInput.length > 19) {
            cleanedInput = cleanedInput.substring(0, 19)
        }
        const formatted = formatRoomId(cleanedInput)
        setRoomId(formatted)
    }

    const isRoomIdComplete = roomId.replace(/-/g, '').length === 16

    const handleSaveRoom = async () => {
        if (!isRoomIdComplete) return

        try {
            await saveRoom(roomId.replace(/-/g, ''), autoJoin) // Передаём autoJoin как autoConnect
            const updatedRooms = await getSavedRooms()
            setSavedRooms(updatedRooms)
        } catch (err) {
            console.error('Ошибка сохранения комнаты:', err)
            setError((err as Error).message)
        }
    }

    const handleDeleteRoom = (roomIdWithoutDashes: string) => {
        setRoomToDelete(roomIdWithoutDashes)
        setShowDeleteDialog(true)
    }

    const confirmDeleteRoom = async () => {
        if (!roomToDelete) return

        try {
            await deleteRoom(roomToDelete)
            const updatedRooms = await getSavedRooms()
            setSavedRooms(updatedRooms)

            if (roomId.replace(/-/g, '') === roomToDelete) {
                setRoomId('')
                setAutoJoin(false) // Сбрасываем autoJoin при удалении текущей комнаты
            }
        } catch (err) {
            console.error('Ошибка удаления комнаты:', err)
            setError((err as Error).message)
        }

        setShowDeleteDialog(false)
        setRoomToDelete(null)
    }

    const handleSelectRoom = (roomIdWithoutDashes: string) => {
        const selectedRoom = savedRooms.find(r => r.id === roomIdWithoutDashes)
        if (selectedRoom) {
            setRoomId(formatRoomId(roomIdWithoutDashes))
            setAutoJoin(selectedRoom.autoConnect) // Устанавливаем autoJoin на основе autoConnect
        }
    }

    const handleSetDefaultRoom = async (roomIdWithoutDashes: string) => {
        try {
            await setDefaultRoom(roomIdWithoutDashes)
            const updatedRooms = await getSavedRooms()
            setSavedRooms(updatedRooms)
        } catch (err) {
            console.error('Ошибка установки комнаты по умолчанию:', err)
            setError((err as Error).message)
        }
    }

    const toggleCamera = () => {
        const newCameraState = !useBackCamera
        setUseBackCamera(newCameraState)
        localStorage.setItem('useBackCamera', String(newCameraState))

        if (isConnected && ws) {
            try {
                ws.send(JSON.stringify({
                    type: "switch_camera",
                    useBackCamera: newCameraState,
                    room: roomId.replace(/-/g, ''),
                    username: username
                }))
            } catch (err) {
                console.error('Error sending camera switch command:', err)
            }
        } else {
            console.error('Not connected to server')
        }
    }

    useEffect(() => {
        if (localStream) {
            localAudioTracks.current = localStream.getAudioTracks()
            localAudioTracks.current.forEach(track => {
                track.enabled = !muteLocalAudio
            })
        }
    }, [localStream, muteLocalAudio])

    useEffect(() => {
        if (remoteStream) {
            remoteStream.getAudioTracks().forEach(track => {
                track.enabled = !muteRemoteAudio
            })
        }
    }, [remoteStream, muteRemoteAudio])

    useEffect(() => {
        if (autoJoin && hasPermission && !isInRoom && isRoomIdComplete) {
            handleJoinRoom()
        }
    }, [autoJoin, hasPermission, isRoomIdComplete])

    const applyVideoTransform = (settings: VideoSettings) => {
        const { rotation, flipH, flipV } = settings
        let transform = ''
        if (rotation !== 0) transform += `rotate(${rotation}deg) `
        transform += `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`
        setVideoTransform(transform)

        if (remoteVideoRef.current) {
            remoteVideoRef.current.style.transform = transform
            remoteVideoRef.current.style.transformOrigin = 'center center'
        }
    }

    const saveSettings = (settings: VideoSettings) => {
        localStorage.setItem('videoSettings', JSON.stringify(settings))
    }

    const loadDevices = async () => {
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

    const toggleLocalVideo = () => {
        const newState = !showLocalVideo
        setShowLocalVideo(newState)
        localStorage.setItem('showLocalVideo', String(newState))
    }

    const updateVideoSettings = (newSettings: Partial<VideoSettings>) => {
        const updated = { ...videoSettings, ...newSettings }
        setVideoSettings(updated)
        applyVideoTransform(updated)
        saveSettings(updated)
    }

    const handleDeviceChange = (type: 'video' | 'audio', deviceId: string) => {
        setSelectedDevices(prev => ({
            ...prev,
            [type]: deviceId
        }))
        localStorage.setItem(`${type}Device`, deviceId)
    }

    const handleJoinRoom = async () => {
        if (!isRoomIdComplete) {
            console.warn('ID комнаты не полный, подключение невозможно')
            return
        }

        setIsJoining(true)
        console.log('Попытка подключения к комнате:', roomId)
        try {
            await handleSetDefaultRoom(roomId.replace(/-/g, ''))
            await joinRoom(username)
            console.log('Успешно подключено к комнате:', roomId)
        } catch (error) {
            console.error('Ошибка подключения к комнате:', error)
            setError('Ошибка подключения к комнате')
        } finally {
            setIsJoining(false)
            console.log('Состояние isJoining сброшено')
        }
    }

    const toggleFullscreen = async () => {
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
        }
    }

    const toggleMuteLocalAudio = () => {
        const newState = !muteLocalAudio
        setMuteLocalAudio(newState)
        localStorage.setItem('muteLocalAudio', String(newState))

        localAudioTracks.current.forEach(track => {
            track.enabled = !newState
        })
    }

    const toggleMuteRemoteAudio = () => {
        const newState = !muteRemoteAudio
        setMuteRemoteAudio(newState)
        localStorage.setItem('muteRemoteAudio', String(newState))

        if (remoteStream) {
            remoteStream.getAudioTracks().forEach(track => {
                track.enabled = !newState
            })
        }
    }

    const rotateVideo = (degrees: number) => {
        updateVideoSettings({ rotation: degrees })

        if (remoteVideoRef.current) {
            if (degrees === 90 || degrees === 270) {
                remoteVideoRef.current.classList.add(styles.rotated)
            } else {
                remoteVideoRef.current.classList.remove(styles.rotated)
            }
        }
    }

    const flipVideoHorizontal = () => {
        updateVideoSettings({ flipH: !videoSettings.flipH })
    }

    const flipVideoVertical = () => {
        updateVideoSettings({ flipV: !videoSettings.flipV })
    }

    const resetVideo = () => {
        updateVideoSettings({ rotation: 0, flipH: false, flipV: false })
    }

    const toggleTab = (tab: 'webrtc' | 'esp' | 'controls') => {
        if (tab === 'controls') {
            setShowControls(!showControls)
        } else {
            setActiveMainTab(activeMainTab === tab ? null : tab)
        }
    }

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
                        onClick={() => toggleTab('controls')}
                        onTouchEnd={() => toggleTab('controls')}
                        className={[styles.tabButton, showControls ? styles.activeTab : ''].join(' ')}
                    >
                        {showControls ? '▲' : '▼'} <img src="/img.svg" alt="Image" />
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
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="autoJoin"
                                    checked={autoJoin}
                                    disabled={!isRoomIdComplete}
                                    onCheckedChange={(checked) => {
                                        setAutoJoin(!!checked)
                                        if (isRoomIdComplete) {
                                            updateAutoConnect(roomId.replace(/-/g, ''), !!checked) // Обновляем autoConnect
                                        }
                                        localStorage.setItem('autoJoin', checked ? 'true' : 'false')
                                    }}
                                    suppressHydrationWarning
                                />
                                <Label htmlFor="autoJoin">Автоматическое подключение</Label>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <Label htmlFor="room">ID комнаты</Label>
                            <Input
                                id="room"
                                value={roomId}
                                onChange={handleRoomIdChange}
                                disabled={isInRoom}
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                maxLength={19}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Label htmlFor="username">Ваше имя</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isInRoom}
                                placeholder="Ваше имя"
                            />
                        </div>

                        {!isInRoom ? (
                            <Button
                                onClick={handleJoinRoom}
                                disabled={!hasPermission || isJoining || !isRoomIdComplete}
                                className={styles.button}
                            >
                                {isJoining ? 'Подключение...' : 'Войти в комнату'}
                            </Button>
                        ) : (
                            <Button
                                onClick={leaveRoom}
                                disabled={!isConnected || !isInRoom}
                                className={styles.button}
                            >
                                Покинуть комнату
                            </Button>
                        )}

                        <div className={styles.inputGroup}>
                            <Button
                                onClick={handleSaveRoom}
                                disabled={!isRoomIdComplete || savedRooms.some((r) => r.id === roomId.replace(/-/g, ''))}
                                className={styles.button}
                            >
                                Сохранить ID комнаты
                            </Button>
                        </div>

                        {savedRooms.length > 0 && (
                            <div className={styles.savedRooms}>
                                <h3>Сохраненные комнаты:</h3>
                                <ul>
                                    {savedRooms.map((room) => (
                                        <li key={room.id} className={styles.savedRoomItem}>
                                            <span
                                                onClick={() => handleSelectRoom(room.id)}
                                                onTouchEnd={() => handleSelectRoom(room.id)} // Для мобильных
                                                className={room.isDefault ? styles.defaultRoom : ''}
                                            >
                                                {formatRoomId(room.id)}
                                                {room.isDefault && ' (по умолчанию)'}
                                            </span>
                                            {!room.isDefault && ( // Скрываем кнопку для комнаты по умолчанию
                                                <button
                                                    onClick={() => handleSetDefaultRoom(room.id)}
                                                    onTouchEnd={() => handleSetDefaultRoom(room.id)}
                                                    className={styles.defaultRoomButton}
                                                >
                                                    Сделать по умолчанию
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteRoom(room.id)}
                                                onTouchEnd={() => handleDeleteRoom(room.id)}
                                                className={styles.deleteRoomButton}
                                            >
                                                Удалить
                                            </button>
                                        </li>
                                    ))}
                                </ul>
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
                            </div>
                        )}

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
                                    onRefresh={loadDevices}
                                />
                            ) : (
                                <div>Загрузка устройств...</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeMainTab === 'esp' && (
                <div className={[styles.tabContent, styles.espTabContent].join(' ')}>
                    <SocketClient />
                </div>
            )}

            {showControls && (
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
        </div>
    )
}