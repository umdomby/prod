"use client";
import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

interface VirtualBoxProps {
    onServoChange: (servoId: "1" | "2", value: number, isAbsolute: boolean) => void;
    onOrientationChange?: (beta: number, gamma: number) => void; // Новый проп для передачи данных ориентации
    disabled?: boolean;
    isVirtualBoxActive: boolean;
}

const VirtualBox = forwardRef<{ handleRequestPermissions: () => void }, VirtualBoxProps>(
    ({ onServoChange, onOrientationChange, disabled, isVirtualBoxActive }, ref) => {
        const [hasOrientationPermission, setHasOrientationPermission] = useState(false);
        const [hasMotionPermission, setHasMotionPermission] = useState(false);
        const [isOrientationSupported, setIsOrientationSupported] = useState(false);
        const [isMotionSupported, setIsMotionSupported] = useState(false);
        const [centerGamma, setCenterGamma] = useState<number | null>(null);
        const animationFrameRef = useRef<number | null>(null);
        const prevOrientationState = useRef({ beta: 0, gamma: 0 });
        const prevAccelerationState = useRef({ x: 0, y: 0 });
        const smoothedServo1 = useRef(90);
        const smoothedServo2 = useRef(90);
        const smoothingFactor = 0.2;
        const hasRequestedPermissions = useRef(false);

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
            if (hasRequestedPermissions.current) {
                log("Повторный запрос разрешений предотвращен", "info");
                return;
            }
            hasRequestedPermissions.current = true;

            log("Начало запроса разрешений для DeviceOrientation и DeviceMotion", "info");

            try {
                if (
                    isOrientationSupported &&
                    typeof (DeviceOrientationEvent as any).requestPermission === "function"
                ) {
                    log("Запрос разрешения для DeviceOrientationEvent", "info");
                    const permission = await (DeviceOrientationEvent as any).requestPermission();
                    setHasOrientationPermission(permission === "granted");
                    log(
                        `Разрешение DeviceOrientationEvent: ${permission}`,
                        permission === "granted" ? "success" : "error"
                    );
                } else if (isOrientationSupported) {
                    setHasOrientationPermission(true);
                    log("Разрешение DeviceOrientationEvent не требуется", "info");
                }

                if (
                    isMotionSupported &&
                    typeof (DeviceMotionEvent as any).requestPermission === "function"
                ) {
                    log("Запрос разрешения для DeviceMotionEvent", "info");
                    const permission = await (DeviceMotionEvent as any).requestPermission();
                    setHasMotionPermission(permission === "granted");
                    log(
                        `Разрешение DeviceMotionEvent: ${permission}`,
                        permission === "granted" ? "success" : "error"
                    );
                } else if (isMotionSupported) {
                    setHasMotionPermission(true);
                    log("Разрешение DeviceMotionEvent не требуется", "info");
                }
            } catch (error) {
                log(`Ошибка запроса разрешений: ${String(error)}`, "error");
                setHasOrientationPermission(false);
                setHasMotionPermission(false);
            }
        }, [isOrientationSupported, isMotionSupported, log]);

        useImperativeHandle(ref, () => ({
            handleRequestPermissions: requestPermissions,
        }));

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

                // Передача данных ориентации через callback
                if (onOrientationChange) {
                    onOrientationChange(beta, gamma);
                }

                const deadZone = 0.15;

                const normalizedBeta = (beta + 90) / 180;
                let normalizedGamma = (gamma + 90) / 180;

                const centerNormalized = (centerGamma + 90) / 180;
                const deltaGamma = (normalizedGamma - centerNormalized) * 180;
                if (Math.abs(deltaGamma) > 90) {
                    log(`Угол gamma (${deltaGamma.toFixed(1)}°) выходит за пределы ±90°, команда не отправляется`, "info");
                    return;
                }
                normalizedGamma = (deltaGamma + 90) / 180;

                let servo1Value = Math.round((-normalizedBeta + 1) * 90);
                if (Math.abs(normalizedBeta - 0.5) > deadZone) {
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
                    onServoChange("1", 90, true);
                    log("Servo1: Возврат в центр (90°)", "info");
                }

                let servo2Value = Math.round((-normalizedGamma + 1) * 90);
                if (Math.abs(normalizedGamma - 0.5) > deadZone) {
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
                    onServoChange("2", 90, true);
                    log("Servo2: Возврат в центр (90°)", "info");
                }

                prevOrientationState.current = { beta: normalizedBeta, gamma: normalizedGamma };
            },
            [disabled, isVirtualBoxActive, hasOrientationPermission, onServoChange, onOrientationChange, log, centerGamma]
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

                let servo1Value = Math.round((-normalizedY + 1) * 90);
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
                    onServoChange("1", 90, true);
                    log("Servo1 (Motion): Возврат в центр (90°)", "info");
                }

                let servo2Value = Math.round((-normalizedX + 1) * 90);
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
                    onServoChange("2", 90, true);
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

        return (
            <button
                onClick={requestPermissions}
                className={`bg-transparent hover:bg-gray-700/30 rounded-full transition-all flex items-center p-2 ${
                    isVirtualBoxActive ? 'border-2 border-green-500' : 'border border-gray-600'
                }`}
            >
                <img
                    width="40px"
                    height="40px"
                    className="object-contain"
                    src="/control/axis-arrow.svg"
                    alt="Request Gyroscope Permissions"
                />
            </button>
        );
    }
);

export default VirtualBox;