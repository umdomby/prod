'use client'

import { useWebRTC } from '../webrtc/hooks/useWebRTC'
import { NoRegVideoPlayer } from './NoRegVideoPlayer'
import { useEffect, useState, useRef } from 'react'
import styles from '@/components/webrtc/styles.module.css'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { joinRoomViaProxy } from '@/app/actions'

export const NoRegWebRTC = () => {
    const [roomId, setRoomId] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const [isJoining, setIsJoining] = useState<boolean>(false)
    const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false)
    const [targetRoomId, setTargetRoomId] = useState<string>('')
    const [isProxyConnection, setIsProxyConnection] = useState<boolean>(false)
    const hasAttemptedAutoJoin = useRef<boolean>(false)

    // Инициализация useWebRTC с пустыми deviceIds (без локального потока)
    const {
        remoteStream,
        isCallActive,
        isConnected,
        isInRoom,
        error,
        joinRoom,
        leaveRoom,
        activeCodec
    } = useWebRTC(
        { video: '', audio: '' }, // Без локальных медиаустройств
        username,
        targetRoomId || roomId.replace(/-/g, ''),
        'VP8' // Фиксируем VP8
    )

    // Получение roomId или proxyRoomId из URL и генерация случайного имени пользователя
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const roomIdFromUrl = urlParams.get('roomId') || ''
        const proxyRoomId = urlParams.get('proxyRoomId') || ''
        const formattedRoomId = (proxyRoomId || roomIdFromUrl)
            .replace(/[^A-Z0-9-]/gi, '')
            .replace(/(.{4})(?=.)/g, '$1-')
        setRoomId(formattedRoomId)

        // Генерация случайного имени пользователя
        const randomUsername = 'guest_' + Math.floor(Math.random() * 10000)
        setUsername(randomUsername)

        // Обработка прокси-доступа
        if (proxyRoomId) {
            setIsProxyConnection(true)
            handleJoinProxyRoom(proxyRoomId)
        }
    }, [])

    // Автоматическое подключение к комнате
    useEffect(() => {
        if (
            (roomId || targetRoomId) &&
            (roomId.replace(/-/g, '').length === 16 || targetRoomId.length === 16) &&
            username &&
            !isInRoom &&
            !isJoining &&
            !hasAttemptedAutoJoin.current
        ) {
            console.log('Инициируется автоподключение к комнате:', roomId, 'или targetRoomId:', targetRoomId)
            hasAttemptedAutoJoin.current = true
            handleJoinRoom()
        }
    }, [roomId, targetRoomId, username, isInRoom, isJoining])

    // Обработка ошибок
    useEffect(() => {
        if (error) {
            console.error('Ошибка WebRTC:', error)
            setShowErrorDialog(true)
        }
    }, [error])

    const handleJoinRoom = async () => {
        if (!roomId || roomId.replace(/-/g, '').length !== 16) {
            console.warn('Некорректный ID комнаты')
            return
        }

        setIsJoining(true)
        try {
            await joinRoom(username, targetRoomId || undefined)
            console.log('Успешно подключено к комнате:', targetRoomId || roomId)
        } catch (err) {
            console.error('Ошибка подключения к комнате:', err)
            setShowErrorDialog(true)
        } finally {
            setIsJoining(false)
        }
    }

    const handleJoinProxyRoom = async (proxyRoomId: string) => {
        try {
            const response = await joinRoomViaProxy(proxyRoomId.replace(/-/g, ''))
            if ('error' in response) {
                console.error('Ошибка joinRoomViaProxy:', response.error)
                setShowErrorDialog(true)
                return
            }
            const { roomId: actualRoomId } = response
            setTargetRoomId(actualRoomId)
            console.log('Успешно получен targetRoomId через прокси:', actualRoomId)
            const proxyNotification = document.createElement('div')
            proxyNotification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg'
            proxyNotification.textContent = 'Подключение через прокси-комнату'
            document.body.appendChild(proxyNotification)
            setTimeout(() => proxyNotification.remove(), 3000)
        } catch (err) {
            console.error('Ошибка подключения через прокси:', err)
            setShowErrorDialog(true)
        }
    }

    const handleLeaveRoom = () => {
        leaveRoom()
        hasAttemptedAutoJoin.current = false
        console.log('Покинута комната:', roomId)
    }

    return (
        <div className={styles.container}>
            <div className={styles.remoteVideoContainer}>
                <NoRegVideoPlayer
                    stream={remoteStream}
                    className={styles.remoteVideo}
                />
            </div>

            <div className={styles.connectionStatus}>
                Статус: {isConnected ? (isInRoom ? `В комнате ${roomId}${isProxyConnection ? ' (прокси)' : ''}` : 'Подключено') : 'Отключено'}
                {isCallActive && ' (Звонок активен)'}
                {activeCodec && ` [Кодек: ${activeCodec}]`}
            </div>

            {isInRoom ? (
                <Button
                    onClick={handleLeaveRoom}
                    disabled={!isConnected}
                    className={styles.button}
                >
                    Покинуть комнату
                </Button>
            ) : (
                <Button
                    onClick={handleJoinRoom}
                    disabled={isJoining || !roomId || roomId.replace(/-/g, '').length !== 16}
                    className={styles.button}
                >
                    {isJoining ? 'Подключение...' : 'Войти в комнату'}
                </Button>
            )}

            <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ошибка подключения</DialogTitle>
                    </DialogHeader>
                    <p>
                        {error === 'Room does not exist. Leader must join first.'
                            ? 'Лидер еще не подключился к комнате. Пожалуйста, подождите.'
                            : error || 'Произошла неизвестная ошибка.'}
                    </p>
                    <DialogFooter>
                        <Button onClick={() => setShowErrorDialog(false)}>Закрыть</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}