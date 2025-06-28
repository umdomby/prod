// file: docker-ardua-444/components/no_reg/NoVideoCallApp.tsx
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import styles from '@/components/webrtc/styles.module.css'
import UseNoRegWebRTC from './useNoRegWebRTC'
import NoRegSocketClient from './NoRegSocketClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { VideoPlayer } from '@/components/webrtc/components/VideoPlayer'
import { debounce } from 'lodash'

type VideoSettings = {
    rotation: number
    flipH: boolean
    flipV: boolean
}

interface NoVideoCallAppProps {
    initialRoomId?: string
}

export const NoVideoCallApp = ({ initialRoomId = '' }: NoVideoCallAppProps) => {
    const [roomId, setRoomId] = useState(initialRoomId)
    const [username, setUsername] = useState('guest_' + Math.floor(Math.random() * 1000))
    const [isJoining, setIsJoining] = useState(false)
    const [activeMainTab, setActiveMainTab] = useState<'webrtc' | 'esp' | 'cam' | null>(null)
    const [showCam, setShowCam] = useState(false)
    const [videoSettings, setVideoSettings] = useState<VideoSettings>({
        rotation: 0,
        flipH: false,
        flipV: false
    })
    const [muteLocalAudio, setMuteLocalAudio] = useState(false)
    const [muteRemoteAudio, setMuteRemoteAudio] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [useBackCamera, setUseBackCamera] = useState(false)
    const [isDeviceConnected, setIsDeviceConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showRoomNotExistDialog, setShowRoomNotExistDialog] = useState(false)
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
    const [showLocalVideo, setShowLocalVideo] = useState(false)
    const [isCameraEnabled, setIsCameraEnabled] = useState(false) // Новое состояние
    const videoContainerRef = useRef<HTMLDivElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const socketClientRef = useRef<{ disconnectWebSocket?: () => Promise<void> }>({})
    const [videoTransform, setVideoTransform] = useState('')
    const leaveRoomRef = useRef<(() => void) | null>(null)
    const wsRef = useRef<WebSocket | null>(null)

    const webRTCRef = useRef<{
        joinRoom: (mediaType?: 'none' | 'audio' | 'audio-video') => void
        leaveRoom: () => void
        isCameraEnabled: boolean
        enableCamera: (muteLocalAudio: boolean) => void
        disableCamera: () => void
        toggleMicrophone: (mute: boolean) => void
        localStream: MediaStream | null
    } | null>(null)

    useEffect(() => {
        if (initialRoomId) {
            const formatted = formatRoomId(initialRoomId)
            setRoomId(formatted)
        }
    }, [initialRoomId])

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

        const savedMuteLocal = localStorage.getItem('muteLocalAudio')
        if (savedMuteLocal !== null) {
            setMuteLocalAudio(savedMuteLocal === 'true')
        }

        const savedMuteRemote = localStorage.getItem('muteRemoteAudio')
        if (savedMuteRemote !== null) {
            setMuteRemoteAudio(savedMuteRemote === 'true')
        }

        const savedCameraPref = localStorage.getItem('useBackCamera')
        if (savedCameraPref !== null) {
            setUseBackCamera(savedCameraPref === 'true')
        }

        loadSettings()
    }, [])

    const formatRoomId = (id: string | undefined): string => {
        if (!id || typeof id !== 'string') {
            return ''
        }
        const cleanedId = id.replace(/[^A-Z0-9]/gi, '')
        return cleanedId.replace(/(.{4})(?=.)/g, '$1-')
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

    const applyVideoTransform = useCallback((settings: VideoSettings) => {
        const { rotation, flipH, flipV } = settings
        let transform = ''
        if (rotation !== 0) transform += `rotate(${rotation}deg) `
        transform += `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`
        setVideoTransform(transform)
    }, [])

    const saveSettings = useCallback((settings: VideoSettings) => {
        localStorage.setItem('videoSettings', JSON.stringify(settings))
    }, [])

    const updateVideoSettings = useCallback((newSettings: Partial<VideoSettings>) => {
        const updated = { ...videoSettings, ...newSettings }
        setVideoSettings(updated)
        applyVideoTransform(updated)
        saveSettings(updated)
    }, [videoSettings, applyVideoTransform, saveSettings])

    const toggleTab = useCallback(
        debounce((tab: 'webrtc' | 'esp' | 'cam') => {
            if (tab === 'cam') {
                setShowCam(!showCam)
                setActiveMainTab(null)
            } else {
                setActiveMainTab(activeMainTab === tab ? null : tab)
                setShowCam(false)
            }
        }, 100),
        [showCam, activeMainTab]
    )

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
                setError('Не удалось переключить полноэкранный режим')
            }
        }, 100),
        []
    )

    const toggleMuteRemoteAudio = useCallback(
        debounce(() => {
            const newState = !muteRemoteAudio
            setMuteRemoteAudio(newState)
            localStorage.setItem('muteRemoteAudio', String(newState))
            if (webRTCRef.current?.localStream) {
                webRTCRef.current.localStream.getAudioTracks().forEach(track => {
                    track.enabled = !newState
                })
            }
        }, 100),
        [muteRemoteAudio]
    )

    const toggleMuteLocalAudio = useCallback(
        debounce(() => {
            const newState = !muteLocalAudio
            setMuteLocalAudio(newState)
            localStorage.setItem('muteLocalAudio', String(newState))
            if (webRTCRef.current?.localStream) {
                webRTCRef.current.localStream.getAudioTracks().forEach(track => {
                    track.enabled = !newState
                    console.log(`Локальный аудиотрек ${track.id} установлен в enabled=${track.enabled}`)
                })
            }
            webRTCRef.current?.toggleMicrophone(newState)
        }, 100),
        [muteLocalAudio]
    )

    const rotateVideo = useCallback((degrees: number) => {
        updateVideoSettings({ rotation: degrees })
    }, [updateVideoSettings])

    const flipVideoHorizontal = useCallback(
        debounce(() => {
            updateVideoSettings({ flipH: !videoSettings.flipH })
        }, 100),
        [videoSettings, updateVideoSettings]
    )

    const flipVideoVertical = useCallback(
        debounce(() => {
            updateVideoSettings({ flipV: !videoSettings.flipV })
        }, 100),
        [videoSettings, updateVideoSettings]
    )

    const resetVideo = useCallback(
        debounce(() => {
            updateVideoSettings({ rotation: 0, flipH: false, flipV: false })
        }, 100),
        [updateVideoSettings]
    )

    const showNotification = useCallback((message: string) => {
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50'
        notification.textContent = message
        document.body.appendChild(notification)
        setTimeout(() => notification.remove(), 2000)
    }, [])

    const toggleCamera = useCallback(
        debounce(() => {
            const newCameraState = !useBackCamera
            setUseBackCamera(newCameraState)
            localStorage.setItem('useBackCamera', String(newCameraState))

            if (wsRef.current?.readyState === WebSocket.OPEN) {
                try {
                    console.log('Отправка команды switch_camera:', { room: roomId, useBackCamera: newCameraState })
                    wsRef.current.send(JSON.stringify({
                        type: 'switch_camera',
                        useBackCamera: newCameraState,
                        room: roomId.replace(/-/g, ''),
                        username
                    }))
                    showNotification(`Переключение на ${newCameraState ? 'заднюю' : 'фронтальную'} камеру`)
                } catch (err) {
                    console.error('Ошибка отправки команды switch_camera:', err)
                    setError('Не удалось переключить камеру')
                }
            } else {
                console.error('WebSocket не подключен для switch_camera')
                setError('Нет соединения с сервером')
            }
        }, 100),
        [useBackCamera, wsRef, roomId, username, setError, showNotification]
    )

    const toggleFlashlight = useCallback(
        debounce(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                try {
                    console.log('Отправка команды toggle_flashlight:', { room: roomId, username })
                    wsRef.current.send(JSON.stringify({
                        type: 'toggle_flashlight',
                        room: roomId.replace(/-/g, ''),
                        username
                    }))
                    showNotification('Команда на переключение фонарика отправлена')
                } catch (err) {
                    console.error('Ошибка отправки команды toggle_flashlight:', err)
                    setError('Не удалось переключить фонарик')
                }
            } else {
                console.error('WebSocket не подключен для toggle_flashlight')
                setError('Нет соединения с сервером')
            }
        }, 100),
        [wsRef, roomId, username, setError, showNotification]
    )

    const handleDisconnect = useCallback(
        debounce(async () => {
            setIsJoining(false)
            setError(null)
            setActiveMainTab('webrtc')
            setShowDisconnectDialog(true)
            setTimeout(() => setShowDisconnectDialog(false), 3000)
            setShowLocalVideo(false)
            setIsCameraEnabled(false) // Сбрасываем состояние камеры

            if (leaveRoomRef.current) {
                try {
                    leaveRoomRef.current()
                    console.log('WebRTC соединение отключено')
                } catch (err) {
                    console.error('Ошибка отключения WebRTC:', err)
                }
            }

            if (socketClientRef.current?.disconnectWebSocket) {
                try {
                    await socketClientRef.current.disconnectWebSocket()
                    console.log('WebSocket устройства отключен')
                } catch (err) {
                    console.error('Ошибка отключения WebSocket устройства:', err)
                    setError('Ошибка при отключении устройства')
                }
            }
        }, 100),
        []
    )

    useEffect(() => {
        if (leaveRoomRef.current) {
            webRTCRef.current = {
                joinRoom: webRTCRef.current?.joinRoom || (async () => {}),
                leaveRoom: leaveRoomRef.current,
                isCameraEnabled: isCameraEnabled, // Используем локальное состояние
                enableCamera: webRTCRef.current?.enableCamera || (async () => {}),
                disableCamera: webRTCRef.current?.disableCamera || (async () => {}),
                toggleMicrophone: webRTCRef.current?.toggleMicrophone || (() => {}),
                localStream: webRTCRef.current?.localStream || null
            }
        }
    }, [leaveRoomRef.current, isCameraEnabled])

    return (
        <div className={`${styles.container} relative w-full h-screen overflow-hidden`} suppressHydrationWarning>
            <div className="absolute inset-0 z-10" ref={videoContainerRef}>
                <UseNoRegWebRTC
                    roomId={roomId}
                    setLeaveRoom={(leaveRoom) => { leaveRoomRef.current = leaveRoom }}
                    videoTransform={videoTransform}
                    setWebSocket={(ws) => { wsRef.current = ws }}
                    useBackCamera={useBackCamera}
                    mediaType={showLocalVideo ? 'audio-video' : 'none'}
                    setIsCameraEnabled={setIsCameraEnabled} // Передаем setIsCameraEnabled
                />
                {showLocalVideo && webRTCRef.current?.localStream && (
                    <VideoPlayer
                        stream={webRTCRef.current.localStream}
                        videoRef={localVideoRef}
                        muted={true}
                        className="absolute bottom-4 right-4 w-1/4 h-1/4 border-2 border-white rounded"
                    />
                )}
            </div>

            <div className="relative h-full">
                <NoRegSocketClient
                    roomId={roomId}
                    setDisconnectWebSocket={(disconnect) => { socketClientRef.current.disconnectWebSocket = disconnect }}
                />
            </div>

            <div className={styles.topControls}>
                <div className={styles.tabsContainer}>
                    <button
                        onClick={() => {
                            if (isCameraEnabled) {
                                webRTCRef.current?.disableCamera()
                                setShowLocalVideo(false)
                                setIsCameraEnabled(false)
                                showNotification('Камера и микрофон отключены')
                            } else {
                                webRTCRef.current?.enableCamera(muteLocalAudio)
                                setShowLocalVideo(true)
                                setIsCameraEnabled(true)
                                showNotification('Камера и микрофон включены')
                            }
                        }}
                        onTouchEnd={() => {
                            if (isCameraEnabled) {
                                webRTCRef.current?.disableCamera()
                                setShowLocalVideo(false)
                                setIsCameraEnabled(false)
                                showNotification('Камера и микрофон отключены')
                            } else {
                                webRTCRef.current?.enableCamera(muteLocalAudio)
                                setShowLocalVideo(true)
                                setIsCameraEnabled(true)
                                showNotification('Камера и микрофон включены')
                            }
                        }}
                        className={[styles.controlButton, isCameraEnabled ? styles.active : ''].join(' ')}
                        title={isCameraEnabled ? 'Отключить камеру' : 'Включить камеру'}
                    >
                        {isCameraEnabled ? '📷🎤' : '📷🎤'}
                    </button>
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
                        <div className={styles.inputGroup}>
                            <Label htmlFor="room">ID комнаты</Label>
                            <Input
                                id="room"
                                value={roomId}
                                onChange={handleRoomIdChange}
                                disabled={isJoining}
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
                                disabled={isJoining}
                                placeholder="Ваше имя"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            {isJoining ? (
                                <Button disabled={true} className={styles.button} variant="destructive">
                                    Подключение...
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleDisconnect}
                                    className={styles.button}
                                    disabled={!isRoomIdComplete}
                                >
                                    Отключить подключение
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showCam && (
                <div className={`${styles.tabContent} absolute bottom-0 left-0 w-full z-50`}>
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

            <div className={styles.bottomRightButton}>
                <button
                    onClick={toggleCamera}
                    className={"p-2"}
                    title={useBackCamera ? 'Переключить на фронтальную камеру' : 'Переключить на заднюю камеру'}
                >
                    {useBackCamera ?
                        <img width={'20px'} height={'20px'} src="/camera/flip-camera.svg" alt="Image"/> :
                        <img width={'20px'} height={'20px'} src="/camera/flip-camera2.svg" alt="Image"/>
                    }
                </button>
            </div>

            <Dialog open={showRoomNotExistDialog} onOpenChange={setShowRoomNotExistDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Комната недоступна</DialogTitle>
                    </DialogHeader>
                    <p>Лидер еще не подключился к комнате. Пожалуйста, подождите или свяжитесь с лидером.</p>
                    <DialogFooter>
                        <Button onClick={() => setShowRoomNotExistDialog(false)}>Закрыть</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Подключение отключено</DialogTitle>
                        <DialogDescription>
                            Вы отключили подключение к комнате. Нажмите "Закрыть", чтобы продолжить.
                        </DialogDescription>
                    </DialogHeader>
                    <p>Вы отключили подключение.</p>
                    <DialogFooter>
                        <Button onClick={() => setShowDisconnectDialog(false)}>Закрыть</Button>
                    </DialogFooter>
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
        </div>
    )
}