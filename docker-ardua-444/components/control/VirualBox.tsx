"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface VirtualBoxProps {
    onChange: ({ x, y }: { x: number; y: number }) => void; // Для моторов
    onServoChange: (servoId: "1" | "2", value: number, isAbsolute: boolean) => void; // Для сервоприводов
    disabled?: boolean; // Оставляем для блокировки при отсутствии соединения
    isVirtualBoxActive: boolean; // Новое свойство для управления активностью
}

const VirtualBox = ({ onChange, onServoChange, disabled, isVirtualBoxActive }: VirtualBoxProps) => {
    const [hasOrientationPermission, setHasOrientationPermission] = useState(false);
    const [hasMotionPermission, setHasMotionPermission] = useState(false);
    const [isOrientationSupported, setIsOrientationSupported] = useState(false);
    const [isMotionSupported, setIsMotionSupported] = useState(false);
    const animationFrameRef = useRef<number | null>(null);
    const prevOrientationState = useRef({ beta: 0, gamma: 0 });
    const prevAccelerationState = useRef({ x: 0, y: 0 });

    // Логирование для диагностики
    const log = useCallback((message: string, type: "info" | "error" | "success" = "info") => {
        console.log(`[VirtualBox] ${type.toUpperCase()}: ${message}`);
    }, []);

    // Проверка поддержки DeviceOrientationEvent и DeviceMotionEvent
    useEffect(() => {
        const orientationSupported = typeof window.DeviceOrientationEvent !== "undefined";
        const motionSupported = typeof window.DeviceMotionEvent !== "undefined";
        setIsOrientationSupported(orientationSupported);
        setIsMotionSupported(motionSupported);
        log(
            `Поддержка сенсоров: Orientation=${orientationSupported}, Motion=${motionSupported}`,
            "info"
        );

        // Для Android и других устройств, где разрешение не требуется
        if (orientationSupported && !("requestPermission" in DeviceOrientationEvent)) {
            setHasOrientationPermission(true);
        }
        if (motionSupported && !("requestPermission" in DeviceMotionEvent)) {
            setHasMotionPermission(true);
        }
    }, [log]);

    // Запрос разрешения для iOS
    const requestPermissions = useCallback(async () => {
        try {
            // Запрос разрешения для DeviceOrientationEvent
            if (
                isOrientationSupported &&
                typeof (DeviceOrientationEvent as any).requestPermission === "function"
            ) {
                const permission = await (DeviceOrientationEvent as any).requestPermission();
                setHasOrientationPermission(permission === "granted");
                log(`Разрешение DeviceOrientationEvent: ${permission}`, permission === "granted" ? "success" : "error");
            }

            // Запрос разрешения для DeviceMotionEvent
            if (
                isMotionSupported &&
                typeof (DeviceMotionEvent as any).requestPermission === "function"
            ) {
                const permission = await (DeviceMotionEvent as any).requestPermission();
                setHasMotionPermission(permission === "granted");
                log(`Разрешение DeviceMotionEvent: ${permission}`, permission === "granted" ? "success" : "error");
            }
        } catch (error) {
            log(`Ошибка запроса разрешений: ${String(error)}`, "error");
            setHasOrientationPermission(false);
            setHasMotionPermission(false);
        }
    }, [isOrientationSupported, isMotionSupported, log]);

    // Обработка данных ориентации (гироскоп)
    const handleDeviceOrientation = useCallback(
        (event: DeviceOrientationEvent) => {
            if (disabled || !isVirtualBoxActive || !hasOrientationPermission) {
                log("Обработка ориентации отключена: disabled, неактивно или нет разрешения", "info");
                return;
            }

            const { beta, gamma } = event;
            if (beta === null || gamma === null) {
                log("Данные ориентации недоступны", "error");
                return;
            }

            // Зона нечувствительности (аналогично JoyAnalog)
            const deadZone = 0.1;

            // Нормализация углов для сервоприводов (-90°..90° -> 0..1)
            const normalizedBeta = (beta + 90) / 180; // 0..1
            const normalizedGamma = (gamma + 90) / 180; // 0..1

            // Servo1: beta (наклон вперед/назад) -> аналог rightStickY
            const servo1Value = Math.round((-normalizedBeta + 1) * 90); // 0..180, инвертировано
            if (Math.abs(normalizedBeta - 0.5) > deadZone) {
                onServoChange("1", servo1Value, true);
                log(`Servo1: ${servo1Value}° (beta=${beta})`, "info");
            } else if (
                Math.abs(normalizedBeta - 0.5) <= deadZone &&
                Math.abs(prevOrientationState.current.beta - 0.5) > deadZone
            ) {
                onServoChange("1", 90, true); // Возврат в центр
                log("Servo1: Возврат в центр (90°)", "info");
            }

            // Servo2: gamma (наклон влево/вправо) -> аналог leftStickX
            const servo2Value = Math.round((-normalizedGamma + 1) * 90); // 0..180, инвертировано
            if (Math.abs(normalizedGamma - 0.5) > deadZone) {
                onServoChange("2", servo2Value, true);
                log(`Servo2: ${servo2Value}° (gamma=${gamma})`, "info");
            } else if (
                Math.abs(normalizedGamma - 0.5) <= deadZone &&
                Math.abs(prevOrientationState.current.gamma - 0.5) > deadZone
            ) {
                onServoChange("2", 90, true); // Возврат в центр
                log("Servo2: Возврат в центр (90°)", "info");
            }

            // Обновление предыдущего состояния
            prevOrientationState.current = { beta: normalizedBeta, gamma: normalizedGamma };

            // Управление моторами
            const motorX = Math.round(normalizedGamma * 255); // X: вправо → 255, влево → 0
            const motorY = Math.round(normalizedBeta * 255); // Y: вперед → 255, назад → 0
            onChange({ x: motorX, y: motorY });
            log(`Моторы: x=${motorX}, y=${motorY}`, "info");
        },
        [disabled, isVirtualBoxActive, hasOrientationPermission, onChange, onServoChange, log]
    );

    // Обработка данных акселерометра
    const handleDeviceMotion = useCallback(
        (event: DeviceMotionEvent) => {
            if (disabled || !isVirtualBoxActive || !hasMotionPermission) {
                log("Обработка акселерометра отключена: disabled, неактивно или нет разрешения", "info");
                return;
            }

            const { acceleration } = event;
            if (!acceleration || acceleration.x === null || acceleration.y === null) {
                log("Данные акселерометра недоступны", "error");
                return;
            }

            // Нормализация ускорения (предполагаем диапазон -10..10 м/с²)
            const maxAcceleration = 10; // Максимальное ускорение для нормализации
            const normalizedX = Math.max(-1, Math.min(1, acceleration.x / maxAcceleration)); // -1..1
            const normalizedY = Math.max(-1, Math.min(1, acceleration.y / maxAcceleration)); // -1..1

            // Зона нечувствительности
            const deadZone = 0.1;

            // Servo1: ускорение по Y -> аналог rightStickY
            const servo1Value = Math.round((-normalizedY + 1) * 90); // 0..180, инвертировано
            if (Math.abs(normalizedY) > deadZone) {
                onServoChange("1", servo1Value, true);
                log(`Servo1 (Motion): ${servo1Value}° (accelY=${acceleration.y})`, "info");
            } else if (
                Math.abs(normalizedY) <= deadZone &&
                Math.abs(prevAccelerationState.current.y) > deadZone
            ) {
                onServoChange("1", 90, true); // Возврат в центр
                log("Servo1 (Motion): Возврат в центр (90°)", "info");
            }

            // Servo2: ускорение по X -> аналог leftStickX
            const servo2Value = Math.round((-normalizedX + 1) * 90); // 0..180, инвертировано
            if (Math.abs(normalizedX) > deadZone) {
                onServoChange("2", servo2Value, true);
                log(`Servo2 (Motion): ${servo2Value}° (accelX=${acceleration.x})`, "info");
            } else if (
                Math.abs(normalizedX) <= deadZone &&
                Math.abs(prevAccelerationState.current.x) > deadZone
            ) {
                onServoChange("2", 90, true); // Возврат в центр
                log("Servo2 (Motion): Возврат в центр (90°)", "info");
            }

            // Обновление предыдущего состояния
            prevAccelerationState.current = { x: normalizedX, y: normalizedY };

            // Управление моторами (если ориентация недоступна)
            if (!isOrientationSupported) {
                const motorX = Math.round(((normalizedX + 1) / 2) * 255); // X: вправо → 255, влево → 0
                const motorY = Math.round(((normalizedY + 1) / 2) * 255); // Y: вперед → 255, назад → 0
                onChange({ x: motorX, y: motorY });
                log(`Моторы (Motion): x=${motorX}, y=${motorY}`, "info");
            }
        },
        [disabled, isVirtualBoxActive, hasMotionPermission, isOrientationSupported, onChange, onServoChange, log]
    );

    // Запуск обработки событий ориентации и акселерометра
    useEffect(() => {
        if (isVirtualBoxActive && (hasOrientationPermission || hasMotionPermission)) {
            if (isOrientationSupported && hasOrientationPermission) {
                window.addEventListener("deviceorientation", handleDeviceOrientation);
                log("Обработчик DeviceOrientationEvent добавлен", "success");
            }
            if (isMotionSupported && hasMotionPermission) {
                window.addEventListener("devicemotion", handleDeviceMotion);
                log("Обработчик DeviceMotionEvent добавлен", "success");
            }

            // Запускаем requestAnimationFrame для плавного обновления
            const loop = () => {
                animationFrameRef.current = requestAnimationFrame(loop);
            };
            animationFrameRef.current = requestAnimationFrame(loop);

            return () => {
                if (isOrientationSupported && hasOrientationPermission) {
                    window.removeEventListener("deviceorientation", handleDeviceOrientation);
                    log("Обработчик DeviceOrientationEvent удален", "info");
                }
                if (isMotionSupported && hasMotionPermission) {
                    window.removeEventListener("devicemotion", handleDeviceMotion);
                    log("Обработчик DeviceMotionEvent удален", "info");
                }
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    log("requestAnimationFrame остановлен", "info");
                }
            };
        }
    }, [
        isVirtualBoxActive,
        hasOrientationPermission,
        hasMotionPermission,
        isOrientationSupported,
        isMotionSupported,
        handleDeviceOrientation,
        handleDeviceMotion,
        log,
    ]);

    // Автоматический запрос разрешений при активации
    useEffect(() => {
        if ((isOrientationSupported || isMotionSupported) && isVirtualBoxActive) {
            requestPermissions();
        }
    }, [isOrientationSupported, isMotionSupported, isVirtualBoxActive, requestPermissions]);

    return (
        <div
            data-is-active={isVirtualBoxActive}
            data-orientation-supported={isOrientationSupported}
            data-motion-supported={isMotionSupported}
            style={{ display: "none" }}
        ></div>
    );
};

export default VirtualBox;