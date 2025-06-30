"use client";
import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { logVirtualBoxEvent } from "@/app/actionsVirtualBoxLog";

interface VirtualBoxProps {
    onServoChange: (servoId: "1" | "2", value: number, isAbsolute: boolean) => void;
    onOrientationChange?: (beta: number, gamma: number) => void;
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

        const log = useCallback(async (message: string, type: "info" | "error" | "success" = "info") => {
            try {
                await logVirtualBoxEvent(message, type);
            } catch (error) {
                console.error(`[VirtualBox Client] ERROR: Failed to send log - ${String(error)}`);
            }
        }, []);

        useEffect(() => {
            const orientationSupported = typeof window.DeviceOrientationEvent !== "undefined";
            const motionSupported = typeof window.DeviceMotionEvent !== "undefined";
            const orientationPermissionSupported = orientationSupported && typeof (DeviceOrientationEvent as any).requestPermission === "function";
            const motionPermissionSupported = motionSupported && typeof (DeviceMotionEvent as any).requestPermission === "function";
            setIsOrientationSupported(orientationSupported);
            setIsMotionSupported(motionSupported);

            const userAgent = navigator.userAgent;
            const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
            const iOSVersion = isIOS ? userAgent.match(/OS (\d+)_/i)?.[1] : 'unknown';
            log(
                `Информация об устройстве: iOS=${isIOS}, версия=${iOSVersion}, UserAgent=${userAgent}`,
                "info"
            );
            log(
                `Поддержка сенсоров: Orientation=${orientationSupported}, Motion=${motionSupported}, OrientationPermission=${orientationPermissionSupported}, MotionPermission=${motionPermissionSupported}`,
                "info"
            );

            if (orientationSupported && !orientationPermissionSupported) {
                setHasOrientationPermission(true);
                log("Разрешение DeviceOrientationEvent не требуется", "info");
            }
            if (motionSupported && !motionPermissionSupported) {
                setHasMotionPermission(true);
                log("Разрешение DeviceMotionEvent не требуется", "info");
            }
        }, [log]);

        const requestPermissions = useCallback(async () => {
            if (hasRequestedPermissions.current) {
                await log("Повторный запрос разрешений предотвращен", "info");
                return;
            }
            hasRequestedPermissions.current = true;

            await log("Начало запроса разрешений для DeviceOrientation и DeviceMotion", "info");

            try {
                if (
                    isOrientationSupported &&
                    typeof (DeviceOrientationEvent as any).requestPermission === "function" &&
                    isMotionSupported &&
                    typeof (DeviceMotionEvent as any).requestPermission === "function"
                ) {
                    await log("Запрос разрешений для DeviceOrientationEvent и DeviceMotionEvent", "info");
                    const [orientationPermission, motionPermission] = await Promise.all([
                        (DeviceOrientationEvent as any).requestPermission(),
                        (DeviceMotionEvent as any).requestPermission(),
                    ]);

                    setHasOrientationPermission(orientationPermission === "granted");
                    await log(
                        `Разрешение DeviceOrientationEvent: ${orientationPermission}`,
                        orientationPermission === "granted" ? "success" : "error"
                    );

                    setHasMotionPermission(motionPermission === "granted");
                    await log(
                        `Разрешение DeviceMotionEvent: ${motionPermission}`,
                        motionPermission === "granted" ? "success" : "error"
                    );
                } else if (isOrientationSupported) {
                    setHasOrientationPermission(true);
                    await log("Разрешение DeviceOrientationEvent не требуется", "info");
                } else {
                    await log("DeviceOrientationEvent не поддерживается", "error");
                }

                if (isMotionSupported && !hasMotionPermission) {
                    setHasMotionPermission(true);
                    await log("Разрешение DeviceMotionEvent не требуется", "info");
                } else if (!isMotionSupported) {
                    await log("DeviceMotionEvent не поддерживается", "error");
                }
            } catch (error) {
                await log(`Ошибка запроса разрешений: ${String(error)}`, "error");
                setHasOrientationPermission(false);
                setHasMotionPermission(false);
            } finally {
                hasRequestedPermissions.current = false;
            }
        }, [isOrientationSupported, isMotionSupported, log]);

        useImperativeHandle(ref, () => ({
            handleRequestPermissions: requestPermissions,
        }));

        useEffect(() => {
            if (isVirtualBoxActive) {
                log("Автоматический вызов requestPermissions при активации VirtualBox", "info");
                requestPermissions();
            }
        }, [isVirtualBoxActive, requestPermissions, log]);

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

                log(`Данные ориентации: beta=${beta.toFixed(2)}, gamma=${gamma.toFixed(2)}`, "info");

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
                    log(`Servo1: ${servo1Value}° (beta=${beta.toFixed(2)})`, "info");
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
                    log(`Servo2: ${servo2Value}° (gamma=${gamma.toFixed(2)})`, "info");
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

                log(`Данные акселерометра: x=${acceleration.x.toFixed(2)}, y=${acceleration.y.toFixed(2)}`, "info");

                const maxAcceleration = 10;
                const normalizedX = Math.max(-1, Math.min(1, acceleration.x / maxAcceleration));
                const normalizedY = Math.max(-1, Math.min(1, acceleration.y / maxAcceleration));
                const deadZone = 0.15;

                let servo1Value = Math.round((-normalizedY + 1) * 90);
                if (Math.abs(normalizedY) > deadZone) {
                    smoothedServo1.current = smoothedServo1.current * (1 - smoothingFactor) + servo1Value * smoothingFactor;
                    servo1Value = Math.round(smoothedServo1.current);
                    onServoChange("1", servo1Value, true);
                    log(`Servo1 (Motion): ${servo1Value}° (accelY=${acceleration.y.toFixed(2)})`, "info");
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
                    log(`Servo2 (Motion): ${servo2Value}° (accelX=${acceleration.x.toFixed(2)})`, "info");
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