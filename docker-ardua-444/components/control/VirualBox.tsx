"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type VirtualBoxProps = {
    onChange: ({ x, y }: { x: number; y: number }) => void;
    disabled?: boolean;
};

const VirtualBox = ({ onChange, disabled }: VirtualBoxProps) => {
    const [isActive, setIsActive] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [deviceOrientationSupported, setDeviceOrientationSupported] = useState(false);
    const animationFrameRef = useRef<number | null>(null);

    // Проверка поддержки DeviceOrientationEvent
    useEffect(() => {
        if (typeof window.DeviceOrientationEvent !== "undefined") {
            setDeviceOrientationSupported(true);
        }
    }, []);

    // Запрос разрешения для iOS (DeviceOrientationEvent.requestPermission)
    const requestPermission = useCallback(async () => {
        if (
            typeof DeviceOrientationEvent !== "undefined" &&
            // @ts-ignore
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
            try {
                // @ts-ignore
                const permission = await DeviceOrientationEvent.requestPermission();
                setHasPermission(permission === "granted");
            } catch (error) {
                console.error("Ошибка запроса разрешения:", error);
                setHasPermission(false);
            }
        } else {
            // Для Android и других устройств, где разрешение не требуется
            setHasPermission(true);
        }
    }, []);

    // Обработка данных с гироскопа и акселерометра
    const handleDeviceOrientation = useCallback(
        (event: DeviceOrientationEvent) => {
            if (disabled || !isActive || !hasPermission) return;

            // beta: наклон вперед/назад (ось Y, -90°..90°)
            // gamma: наклон влево/вправо (ось X, -90°..90°)
            const { beta, gamma } = event;

            if (beta === null || gamma === null) return;

            // Нормализация углов: преобразование -90°..90° в 0..180 для моторов
            const normalizedBeta = Math.round(((beta + 90) / 180) * 255); // Y: вперед → 255, назад → 0
            const normalizedGamma = Math.round(((gamma + 90) / 180) * 255); // X: вправо → 255, влево → 0

            // Передаем значения для моторов
            onChange({
                x: normalizedGamma, // Ось X (мотор A)
                y: normalizedBeta, // Ось Y (мотор B)
            });
        },
        [disabled, isActive, hasPermission, onChange]
    );

    // Включение/выключение обработки
    const toggleActive = useCallback(() => {
        setIsActive((prev) => {
            if (!prev && !hasPermission) {
                requestPermission();
            }
            return !prev;
        });
    }, [hasPermission, requestPermission]);

    // Запуск обработки событий ориентации
    useEffect(() => {
        if (isActive && hasPermission && deviceOrientationSupported) {
            window.addEventListener("deviceorientation", handleDeviceOrientation);

            // Запускаем постоянный опрос через requestAnimationFrame
            const loop = () => {
                animationFrameRef.current = requestAnimationFrame(loop);
            };
            animationFrameRef.current = requestAnimationFrame(loop);

            return () => {
                window.removeEventListener("deviceorientation", handleDeviceOrientation);
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }
    }, [isActive, hasPermission, deviceOrientationSupported, handleDeviceOrientation]);

    // Автоматический запрос разрешения при монтировании (для iOS)
    useEffect(() => {
        if (deviceOrientationSupported) {
            requestPermission();
        }
    }, [deviceOrientationSupported, requestPermission]);

    return (
        <div
            data-is-active={isActive}
            data-device-orientation-supported={deviceOrientationSupported}
            style={{ display: "none" }}
        ></div>
    );
};

export default VirtualBox;