'use client'

import { useEffect, useRef } from 'react'
import styles from '@/components/webrtc/styles.module.css'

interface NoRegVideoPlayerProps {
    stream: MediaStream | null
    className?: string
}

export const NoRegVideoPlayer = ({ stream, className }: NoRegVideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (stream && stream.getVideoTracks().length > 0) {
            video.srcObject = stream
            video.play().catch((err) => {
                console.error('Ошибка воспроизведения видео:', err)
            })
        } else {
            video.srcObject = null
            console.warn('Поток отсутствует или не содержит видеотреков')
        }

        return () => {
            video.srcObject = null
        }
    }, [stream])

    return (
        <div className={`relative w-full h-full ${!stream ? 'opacity-0' : 'opacity-100'}`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={true} // Всегда без звука для простоты
                className={`${className || ''} ${styles.remoteVideo}`}
                style={{
                    background: 'transparent',
                    objectFit: 'contain',
                    width: '100%',
                    height: '100%',
                }}
            />
        </div>
    )
}
