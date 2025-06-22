'use client';

import { VideoCallApp } from './VideoCallApp';
import { useEffect, useState } from 'react';
import { checkWebRTCSupport } from './lib/webrtc';
import styles from './styles.module.css';

interface WebRTCPageProps {
    roomId?: string; // Добавляем roomId как пропс
}

export default function WebRTCPage({ roomId }: WebRTCPageProps) {
    const [isSupported, setIsSupported] = useState<boolean | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        const initialize = async () => {
            setIsSupported(checkWebRTCSupport());

            try {
                const mediaDevices = await navigator.mediaDevices.enumerateDevices();
                setDevices(mediaDevices);
            } catch (err) {
                console.error('Error getting devices:', err);
            }
        };

        initialize();
    }, []);

    if (isSupported === false) {
        return (
            <div>
                <h1>WebRTC is not supported in your browser</h1>
                <p>Please use a modern browser like Chrome, Firefox or Edge.</p>
            </div>
        );
    }

    return (
        <div>
            {isSupported === null ? (
                <div>Loading...</div>
            ) : (
                <VideoCallApp roomIdRef={roomId} />
                )}
        </div>
    );
}