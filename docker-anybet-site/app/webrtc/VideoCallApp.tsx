// file: client/app/webrtc/VideoCallApp.tsx
'use client'

import { useWebRTC } from './hooks/useWebRTC';
import styles from './styles.module.css';
import { VideoPlayer } from './components/VideoPlayer';
import { DeviceSelector } from './components/DeviceSelector';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const VideoCallApp = () => {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDevices, setSelectedDevices] = useState({
        video: '',
        audio: ''
    });
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState(`User${Math.floor(Math.random() * 1000)}`);
    const [originalUsername, setOriginalUsername] = useState('');
    const [hasPermission, setHasPermission] = useState(false);
    const [devicesLoaded, setDevicesLoaded] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const {
        localStream,
        remoteStream,
        users,
        joinRoom,
        leaveRoom,
        isCallActive,
        isConnected,
        isInRoom,
        error
    } = useWebRTC(selectedDevices, username, roomId);

    const generateUniqueUsername = (base: string) => {
        return `${base}_${Math.floor(Math.random() * 1000)}`;
    };

    const loadDevices = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            stream.getTracks().forEach(track => track.stop());

            const devices = await navigator.mediaDevices.enumerateDevices();
            setDevices(devices);
            setHasPermission(true);
            setDevicesLoaded(true);

            const videoDevice = devices.find(d => d.kind === 'videoinput');
            const audioDevice = devices.find(d => d.kind === 'audioinput');

            setSelectedDevices({
                video: videoDevice?.deviceId || '',
                audio: audioDevice?.deviceId || ''
            });
        } catch (error) {
            console.error('Device access error:', error);
            setHasPermission(false);
            setDevicesLoaded(true);
        }
    };

    const handleDeviceChange = (type: 'video' | 'audio', deviceId: string) => {
        setSelectedDevices(prev => ({
            ...prev,
            [type]: deviceId
        }));
    };

    const handleJoinRoom = async () => {
        setIsJoining(true);
        try {
            if (!originalUsername) {
                setOriginalUsername(username);
            }
            const uniqueUsername = generateUniqueUsername(originalUsername || username);
            setUsername(uniqueUsername);
            await joinRoom(uniqueUsername);
        } catch (error) {
            console.error('Error joining room:', error);
        } finally {
            setIsJoining(false);
        }
    };

    useEffect(() => {
        loadDevices();
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>WebRTC Video Call</h1>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.controls}>
                <div className={styles.connectionStatus}>
                    Статус: {isConnected ? (isInRoom ? `В комнате ${roomId}` : 'Подключено') : 'Отключено'}
                    {isCallActive && ' (Звонок активен)'}
                </div>

                <div className={styles.inputGroup}>
                    <Label htmlFor="room">Комната:</Label>
                    <Input
                        id="room"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        disabled={isInRoom}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <Label htmlFor="username">Имя пользователя:</Label>
                    <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isInRoom}
                    />
                </div>

                {!isInRoom ? (
                    <Button
                        onClick={handleJoinRoom}
                        disabled={!hasPermission || isJoining}
                        className={styles.button}
                    >
                        {isJoining ? 'Подключение...' : 'Войти в комнату'}
                    </Button>
                ) : (
                    <Button
                        onClick={leaveRoom}
                        className={styles.button}
                    >
                        Покинуть комнату
                    </Button>
                )}

                <div className={styles.userList}>
                    <h3>Участники ({users.length}):</h3>
                    <ul>
                        {users.map((user, index) => (
                            <li key={index}>{user}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className={styles.videoContainer}>
                <div className={styles.videoWrapper}>
                    <VideoPlayer
                        stream={localStream}
                        muted
                        className={styles.localVideo}
                    />
                </div>

                <div className={styles.videoWrapper}>
                    <VideoPlayer
                        stream={remoteStream}
                        className={styles.remoteVideo}
                    />
                </div>
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
    );
};