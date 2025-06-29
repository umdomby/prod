"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface VirtualBoxProps {
    onServoChange: (servoId: "1" | "2", value: number, isAbsolute: boolean) => void;
    disabled?: boolean;
    isVirtualBoxActive: boolean;
}

const VirtualBox = ({ onServoChange, disabled, isVirtualBoxActive }: VirtualBoxProps) => {
    const [hasOrientationPermission, setHasOrientationPermission] = useState(false);
    const [hasMotionPermission, setHasMotionPermission] = useState(false);
    const [isOrientationSupported, setIsOrientationSupported] = useState(false);
    const [isMotionSupported, setIsMotionSupported] = useState(false);
    const [centerGamma, setCenterGamma] = useState<number | null>(null); // Центральное положение оси X
    const animationFrameRef = useRef<number | null>(null);
    const prevOrientationState = useRef({ beta: 0, gamma: 0 });
    const prevAccelerationState = useRef({ x: 0, y: 0 });
    const smoothedServo1 = useRef(90); // Начальное значение для Servo1 (центр)
    const smoothedServo2 = useRef(90); // Начальное значение для Servo2 (центр)
    const smoothingFactor = 0.2; // Коэффициент сглаживания (0 < x < 1)

    const log = useCallback((message: string, type: "info" | "error" | "success" = "info") => {
        console.log(`[VirtualBox] ${type.toUpperCase()}: ${message}`);
    }, []);

    useEffect(() => {
        const orientationSupported = typeof window.DeviceOrientationEvent !== "undefined";
        const motionSupported = typeof window.DeviceMotionEvent !== "undefined";
        setIsOrientationSupported(orientationSupported);
        setIsMotionSupported(motionSupported);
        log(
            `Поддержка сенсоров: Orientation=${orientationSupported}, Motion=${motionSupported}`,
            "info"
        );

        if (orientationSupported && !("requestPermission" in DeviceOrientationEvent)) {
            setHasOrientationPermission(true);
        }
        if (motionSupported && !("requestPermission" in DeviceMotionEvent)) {
            setHasMotionPermission(true);
        }
    }, [log]);

    const requestPermissions = useCallback(async () => {
        try {
            if (
                isOrientationSupported &&
                typeof (DeviceOrientationEvent as any).requestPermission === "function"
            ) {
                const permission = await (DeviceOrientationEvent as any).requestPermission();
                setHasOrientationPermission(permission === "granted");
                log(`Разрешение DeviceOrientationEvent: ${permission}`, permission === "granted" ? "success" : "error");
            }

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

    // Фиксация центрального положения оси X при активации
    useEffect(() => {
        if (isVirtualBoxActive && hasOrientationPermission) {
            const handleFirstOrientation = (event: DeviceOrientationEvent) => {
                if (event.gamma !== null && centerGamma === null) {
                    setCenterGamma(event.gamma);
                    log(`Центральное положение оси X зафиксировано: gamma=${event.gamma}`, "success");
                    window.removeEventListener("deviceorientation", handleFirstOrientation);
                }
            };
            window.addEventListener("deviceorientation", handleFirstOrientation);
            return () => {
                window.removeEventListener("deviceorientation", handleFirstOrientation);
            };
        }
    }, [isVirtualBoxActive, hasOrientationPermission, log, centerGamma]);

    const handleDeviceOrientation = useCallback(
        (event: DeviceOrientationEvent) => {
            if (disabled || !isVirtualBoxActive || !hasOrientationPermission) {
                log("Обработка ориентации отключена: disabled, неактивно или нет разрешения", "info");
                return;
            }

            const { beta, gamma } = event;
            if (beta === null || gamma === null || centerGamma === null) {
                log("Данные ориентации недоступны или центр не зафиксирован", "error");
                return;
            }

            const deadZone = 0.15; // Увеличенная зона нечувствительности

            // Нормализация углов для сервоприводов
            const normalizedBeta = (beta + 90) / 180; // 0..1
            let normalizedGamma = (gamma + 90) / 180; // 0..1

            // Ограничение gamma относительно центрального положения
            const centerNormalized = (centerGamma + 90) / 180; // Нормализованное центральное положение
            const deltaGamma = (normalizedGamma - centerNormalized) * 180; // Разница в градусах (-180..180)
            if (Math.abs(deltaGamma) > 90) {
                log(`Угол gamma (${deltaGamma.toFixed(1)}°) выходит за пределы ±90°, команда не отправляется`, "info");
                return;
            }
            normalizedGamma = (deltaGamma + 90) / 180; // Приведение к 0..1 относительно центра

            // Servo1: beta (наклон вперед/назад) -> аналог rightStickY
            let servo1Value = Math.round((-normalizedBeta + 1) * 90); // 0..180, инвертировано
            if (Math.abs(normalizedBeta - 0.5) > deadZone) {
                // Сглаживание
                smoothedServo1.current = smoothedServo1.current * (1 - smoothingFactor) + servo1Value * smoothingFactor;
                servo1Value = Math.round(smoothedServo1.current);
                onServoChange("1", servo1Value, true);
                log(`Servo1: ${servo1Value}° (beta=${beta})`, "info");
            } else if (
                Math.abs(normalizedBeta - 0.5) <= deadZone &&
                Math.abs(prevOrientationState.current.beta - 0.5) > deadZone
            ) {
                servo1Value = 90;
                smoothedServo1.current = 90;
                onServoChange("1", 90, true); // Возврат в центр
                log("Servo1: Возврат в центр (90°)", "info");
            }

            // Servo2: gamma (наклон влево/вправо) -> аналог leftStickX
            let servo2Value = Math.round((-normalizedGamma + 1) * 90); // 0..180, инвертировано
            if (Math.abs(normalizedGamma - 0.5) > deadZone) {
                // Сглаживание
                smoothedServo2.current = smoothedServo2.current * (1 - smoothingFactor) + servo2Value * smoothingFactor;
                servo2Value = Math.round(smoothedServo2.current);
                onServoChange("2", servo2Value, true);
                log(`Servo2: ${servo2Value}° (gamma=${gamma})`, "info");
            } else if (
                Math.abs(normalizedGamma - 0.5) <= deadZone &&
                Math.abs(prevOrientationState.current.gamma - 0.5) > deadZone
            ) {
                servo2Value = 90;
                smoothedServo2.current = 90;
                onServoChange("2", 90, true); // Возврат в центр
                log("Servo2: Возврат в центр (90°)", "info");
            }

            prevOrientationState.current = { beta: normalizedBeta, gamma: normalizedGamma };
        },
        [disabled, isVirtualBoxActive, hasOrientationPermission, onServoChange, log, centerGamma]
    );

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

            const maxAcceleration = 10;
            const normalizedX = Math.max(-1, Math.min(1, acceleration.x / maxAcceleration));
            const normalizedY = Math.max(-1, Math.min(1, acceleration.y / maxAcceleration));
            const deadZone = 0.15;

            // Servo1: ускорение по Y -> аналог rightStickY
            let servo1Value = Math.round((-normalizedY + 1) * 90); // 0..180, инвертировано
            if (Math.abs(normalizedY) > deadZone) {
                smoothedServo1.current = smoothedServo1.current * (1 - smoothingFactor) + servo1Value * smoothingFactor;
                servo1Value = Math.round(smoothedServo1.current);
                onServoChange("1", servo1Value, true);
                log(`Servo1 (Motion): ${servo1Value}° (accelY=${acceleration.y})`, "info");
            } else if (
                Math.abs(normalizedY) <= deadZone &&
                Math.abs(prevAccelerationState.current.y) > deadZone
            ) {
                servo1Value = 90;
                smoothedServo1.current = 90;
                onServoChange("1", 90, true); // Возврат в центр
                log("Servo1 (Motion): Возврат в центр (90°)", "info");
            }

            // Servo2: ускорение по X -> аналог leftStickX
            let servo2Value = Math.round((-normalizedX + 1) * 90); // 0..180, инвертировано
            if (Math.abs(normalizedX) > deadZone) {
                smoothedServo2.current = smoothedServo2.current * (1 - smoothingFactor) + servo2Value * smoothingFactor;
                servo2Value = Math.round(smoothedServo2.current);
                onServoChange("2", servo2Value, true);
                log(`Servo2 (Motion): ${servo2Value}° (accelX=${acceleration.x})`, "info");
            } else if (
                Math.abs(normalizedX) <= deadZone &&
                Math.abs(prevAccelerationState.current.x) > deadZone
            ) {
                servo2Value = 90;
                smoothedServo2.current = 90;
                onServoChange("2", 90, true); // Возврат в центр
                log("Servo2 (Motion): Возврат в центр (90°)", "info");
            }

            prevAccelerationState.current = { x: normalizedX, y: normalizedY };
        },
        [disabled, isVirtualBoxActive, hasMotionPermission, onServoChange, log]
    );

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