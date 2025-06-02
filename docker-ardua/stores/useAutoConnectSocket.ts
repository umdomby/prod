// hooks/useAutoConnectSocket.ts
'use client'

import { useEffect } from 'react'

export const useAutoConnectSocket = () => {
    useEffect(() => {
        const autoConnect = localStorage.getItem('autoConnect') === 'true'
        const selectedDeviceId = localStorage.getItem('selectedDeviceId')

        if (autoConnect) {
            // Здесь должна быть логика подключения к WebSocket

            console.log('Auto-connecting to device:', selectedDeviceId)
        }
    }, [])
}