'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import styles from '@/components/webrtc/styles.module.css'
import UseNoRegWebRTC from './useNoRegWebRTC'
import NoRegSocketClient from './NoRegSocketClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
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
    const videoContainerRef = useRef<HTMLDivElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const localAudioTracks = useRef<MediaStreamTrack[]>([])
    const socketClientRef = useRef<{ disconnectWebSocket?: () => Promise<void> }>({})
    const [videoTransform, setVideoTransform] = useState('')

    // Установка initialRoomId при монтировании
    useEffect(() => {
        if (initialRoomId) {
            const formatted = formatRoomId(initialRoomId)
            setRoomId(formatted)
        }
    }, [initialRoomId])

    // Загрузка настроек из localStorage
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

    // Форматирование ID комнаты
    const formatRoomId = (id: string | undefined): string => {
        if (!id || typeof id !== 'string') {
            return ''
        }
        const cleanedId = id.replace(/[^A-Z0-9]/gi, '')
        return cleanedId.replace(/(.{4})(?=.)/g, '$1-')
    }

    // Обработка изменения ID комнаты
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

    // Применение трансформации видео
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

    // Сохранение настроек
    const saveSettings = useCallback((settings: VideoSettings) => {
        localStorage.setItem('videoSettings', JSON.stringify(settings))
    }, [])

    // Обновление настроек видео
    const updateVideoSettings = useCallback((newSettings: Partial<VideoSettings>) => {
        const updated = { ...videoSettings, ...newSettings }
        setVideoSettings(updated)
        applyVideoTransform(updated)
        saveSettings(updated)
    }, [videoSettings, applyVideoTransform, saveSettings])

    // Переключение вкладок
    const toggleTab = useCallback(
        debounce((tab: 'webrtc' | 'esp' | 'cam') => {
            if (tab === 'cam') {
                setShowCam(!showCam)
                setActiveMainTab(null)
            } else {
                setActiveMainTab(activeMainTab === tab ? null : tab)
                setShowCam(false)
            }
        }, 300),
        [showCam, activeMainTab]
    )

    // Управление полноэкранным режимом
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

    // Управление микрофоном
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

    // Управление звуком удалённого потока
    const toggleMuteRemoteAudio = useCallback(
        debounce(() => {
            const newState = !muteRemoteAudio
            setMuteRemoteAudio(newState)
            localStorage.setItem('muteRemoteAudio', String(newState))
        }, 300),
        [muteRemoteAudio]
    )

    // Поворот видео
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

    // Отражение видео по горизонтали
    const flipVideoHorizontal = useCallback(
        debounce(() => {
            updateVideoSettings({ flipH: !videoSettings.flipH })
        }, 300),
        [videoSettings, updateVideoSettings]
    )

    // Отражение видео по вертикали
    const flipVideoVertical = useCallback(
        debounce(() => {
            updateVideoSettings({ flipV: !videoSettings.flipV })
        }, 300),
        [videoSettings, updateVideoSettings]
    )

    // Сброс настроек видео
    const resetVideo = useCallback(
        debounce(() => {
            updateVideoSettings({ rotation: 0, flipH: false, flipV: false })
        }, 300),
        [updateVideoSettings]
    )

    // Переключение камеры
    const toggleCamera = useCallback(
        debounce(() => {
            const newCameraState = !useBackCamera
            setUseBackCamera(newCameraState)
            localStorage.setItem('useBackCamera', String(newCameraState))
        }, 300),
        [useBackCamera]
    )

    // Управление фонариком
    const toggleFlashlight = useCallback(
        debounce(() => {
            setError('Фонарик не поддерживается для незарегистрированных пользователей')
        }, 300),
        []
    )

    // Обработка отключения
    const handleDisconnect = useCallback(
        debounce(async () => {
            setIsJoining(false)
            setError(null)
            setActiveMainTab('webrtc')
            setShowDisconnectDialog(true)
            setTimeout(() => setShowDisconnectDialog(false), 3000)

            if (socketClientRef.current?.disconnectWebSocket) {
                try {
                    await socketClientRef.current.disconnectWebSocket()
                    console.log('WebSocket отключен')
                } catch (err) {
                    console.error('Ошибка отключения WebSocket:', err)
                }
            }
        }, 300),
        []
    )

    return (
        <div className={`${styles.container} relative w-full h-screen overflow-hidden`} suppressHydrationWarning>
            {/* VideoPlayer как фон */}
            <div className="absolute inset-0 z-10" ref={videoContainerRef}>
                <UseNoRegWebRTC
                    roomId={roomId}
                />
            </div>

            {/* SocketClient поверх видео */}
            <div className="relative h-full">
                    <NoRegSocketClient
                        roomId={roomId}
                    />
            </div>

            {/* Управление интерфейсом */}
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
                                >
                                    Отключить подключение
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showCam && (
                <div className={`${styles.tabContent} absolute bottom-0 left-0 w-full z-30`}>
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
                                title="Фонарик не поддерживается"
                            >
                                💡
                            </button>
                        </div>
                    </div>
                </div>
            )}

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