import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
    stream: MediaStream | null;
    muted?: boolean;
    className?: string;
    transform?: string;
    videoRef?: React.RefObject<HTMLVideoElement | null>;
}

type VideoSettings = {
    rotation: number;
    flipH: boolean;
    flipV: boolean;
};

export const VideoPlayer = ({ stream, muted = false, className, transform, videoRef }: VideoPlayerProps) => {
    const internalVideoRef = useRef<HTMLVideoElement>(null);
    const [computedTransform, setComputedTransform] = useState<string>('');
    const [isRotated, setIsRotated] = useState(false);
    const actualVideoRef = videoRef || internalVideoRef;
    const hasInteracted = useRef(false); // Отслеживание взаимодействия пользователя

    // Отслеживание взаимодействия пользователя
    useEffect(() => {
        const handleInteraction = () => {
            hasInteracted.current = true;
            const video = actualVideoRef.current;
            if (video && video.srcObject) {
                video.play().catch((e) => {
                    console.error('Playback failed after interaction:', e);
                    video.muted = true;
                    video.play().catch((e) => console.error('Muted playback also failed:', e));
                });
            }
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };
    }, [actualVideoRef]);

    // Обработка transform
    useEffect(() => {
        if (typeof transform === 'string') {
            setComputedTransform(transform);
            setIsRotated(transform.includes('rotate(90deg') || transform.includes('rotate(270deg)'));
        } else {
            try {
                const saved = localStorage.getItem('videoSettings');
                if (saved) {
                    const { rotation, flipH, flipV } = JSON.parse(saved) as VideoSettings;
                    let fallbackTransform = '';
                    if (rotation !== 0) fallbackTransform += `rotate(${rotation}deg) `;
                    fallbackTransform += `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`;
                    setComputedTransform(fallbackTransform);
                    setIsRotated(rotation === 90 || rotation === 270);
                } else {
                    setComputedTransform('');
                    setIsRotated(false);
                }
            } catch (e) {
                console.error('Error parsing saved video settings:', e);
                setComputedTransform('');
                setIsRotated(false);
            }
        }
    }, [transform]);

    // Привязка потока и обработка событий
    useEffect(() => {
        const video = actualVideoRef.current;
        if (!video) return;

        console.log('Привязка потока к видеоэлементу:', {
            streamId: stream?.id,
            videoTracks: stream?.getVideoTracks().length,
            audioTracks: stream?.getAudioTracks().length,
            videoTrackEnabled: stream?.getVideoTracks()[0]?.enabled,
            videoTrackReadyState: stream?.getVideoTracks()[0]?.readyState,
            videoTrackId: stream?.getVideoTracks()[0]?.id,
        });

        const handleCanPlay = () => {
            console.log('Видео готово к воспроизведению');
            if (hasInteracted.current) {
                video.play().catch((e) => {
                    console.error('Playback failed:', e);
                    video.muted = true;
                    video.play().catch((e) => console.error('Muted playback also failed:', e));
                });
            }
        };

        const handleError = () => {
            console.error('Ошибка видеоэлемента:', video.error);
        };

        const handleLoadedMetadata = () => {
            console.log('Метаданные видео загружены:', {
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
            });
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                console.warn('Пустой видеотрек: размеры видео равны нулю');
            }
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', handleError);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);

        if (stream) {
            video.srcObject = stream;
            if (hasInteracted.current) {
                video.play().catch((e) => console.error('Initial play failed:', e));
            }
        } else {
            video.srcObject = null;
        }

        return () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.srcObject = null;
        };
    }, [stream, actualVideoRef]);

    return (
        <video
            ref={actualVideoRef}
            playsInline
            muted={muted}
            className={`${className || ''} ${isRotated ? 'rotated' : ''}`}
            style={{
                transform: computedTransform,
                transformOrigin: 'center center',
                background: 'black',
                objectFit: 'contain',
            }}
        />
    );
};