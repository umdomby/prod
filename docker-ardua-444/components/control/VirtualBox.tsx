"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { logVirtualBoxEvent } from "@/app/actionsVirtualBoxLog";

// Интерфейс для пропсов
interface VirtualBoxProps {
    onServoChange: (servoId: "1" | "2", value: number, isAbsolute: boolean) => void;
    onOrientationChange?: (beta: number, gamma: number, alpha: number) => void;
    disabled?: boolean;
    isVirtualBoxActive: boolean;
    hasOrientationPermission: boolean;
    hasMotionPermission: boolean;
    isOrientationSupported: boolean;
    isMotionSupported: boolean;
}

const VirtualBox: React.FC<VirtualBoxProps> = ({
                                                   onServoChange,
                                                   onOrientationChange,
                                                   disabled,
                                                   isVirtualBoxActive,
                                                   hasOrientationPermission,
                                                   hasMotionPermission,
                                                   isOrientationSupported,
                                                   isMotionSupported,
                                               }) => {
    const animationFrameRef = useRef<number | null>(null);
    const prevOrientationState = useRef({ beta: 0, gamma: 0 });
    const prevAccelerationState = useRef({ x: 0, y: 0 });
    const smoothedServo1 = useRef(90);
    const smoothedServo2 = useRef(90);
    const smoothingFactor = 0.2;
    const [centerGamma, setCenterGamma] = useState<number>(0);

    const log = useCallback(async (message: string, type: "info" | "error" | "success" = "info") => {
        try {
            await logVirtualBoxEvent(message, type);
        } catch (error) {
            console.error(`[VirtualBox Client] ERROR: Failed to send log - ${String(error)}`);
        }
    }, []);

    useEffect(() => {
        const userAgent = navigator.userAgent;
        const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
        const iOSVersion = isIOS ? parseInt(userAgent.match(/OS (\d+)_/i)?.[1] || "0", 10) : 0;
        log(
            `Информация об устройстве: iOS=${isIOS}, версия=${iOSVersion}, UserAgent=${userAgent}`,
            "info"
        );
        log(
            `Поддержка сенсоров: Orientation=${isOrientationSupported}, Motion=${isMotionSupported}`,
            "info"
        );

        if (isIOS && iOSVersion >= 13 && isOrientationSupported) {
            log("iOS 13+ обнаружен, требуется запрос разрешений для ориентации", "info");
        }
        if (isIOS && iOSVersion >= 13 && isMotionSupported) {
            log("iOS 13+ обнаружен, требуется запрос разрешений для акселерометра", "info");
        }
    }, [log, isOrientationSupported, isMotionSupported]);

    useEffect(() => {
        const checkSafariSettings = () => {
            const userAgent = navigator.userAgent;
            const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
            if (isIOS) {
                log(
                    "Проверка настроек Safari: убедитесь, что 'Движение и ориентация' включены в Настройки > Safari",
                    "info"
                );
            }
        };
        checkSafariSettings();
    }, [log]);

    useEffect(() => {
        if (isVirtualBoxActive) {
            log("VirtualBox активирован", "info");
        } else {
            log("VirtualBox деактивирован", "info");
            // При деактивации сбрасываем значения сервоприводов
            onServoChange("1", 90, true);
            onServoChange("2", 90, true);
            log("Сервоприводы 1 и 2 установлены в центральное положение (90°)", "info");
        }
    }, [isVirtualBoxActive, log, onServoChange]);

    const handleDeviceOrientation = useCallback(
        (event: DeviceOrientationEvent) => {
            if (disabled || !isVirtualBoxActive || !hasOrientationPermission) {
                log("Обработка ориентации отключена: disabled, неактивно или нет разрешения", "info");
                return;
            }

            const { beta, gamma, alpha } = event;
            if (beta === null || gamma === null || alpha === null) {
                log("Данные ориентации недоступны", "error");
                return;
            }

            log(
                `Данные ориентации: beta=${beta.toFixed(2)}, gamma=${gamma.toFixed(2)}, alpha=${alpha.toFixed(
                    2
                )}`,
                "info"
            );

            if (onOrientationChange) {
                onOrientationChange(beta, gamma, alpha);
            }

            const deadZone = 0.15;
            const normalizedBeta = (beta + 90) / 180;
            const normalizedGamma = (gamma + 90) / 180;

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
        [disabled, isVirtualBoxActive, hasOrientationPermission, onServoChange, onOrientationChange, log]
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

            log(
                `Данные акселерометра: x=${acceleration.x.toFixed(2)}, y=${acceleration.y.toFixed(2)}`,
                "info"
            );

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

    // Метод для обработки разрешений (для совместимости с SocketClient)
    const handleRequestPermissions = useCallback(() => {
        if (!isVirtualBoxActive) {
            window.removeEventListener("deviceorientation", handleDeviceOrientation);
            window.removeEventListener("devicemotion", handleDeviceMotion);
            log("Обработчики событий ориентации и акселерометра удалены при деактивации", "info");
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        }
    }, [isVirtualBoxActive, log]);

    // Привязываем handleRequestPermissions к рефу для SocketClient
    useEffect(() => {
        const virtualBoxRef = (window as any).virtualBoxRef || { current: null };
        virtualBoxRef.current = { handleRequestPermissions };
        return () => {
            virtualBoxRef.current = null;
        };
    }, [handleRequestPermissions]);

    useEffect(() => {
        if (isVirtualBoxActive && (hasOrientationPermission || hasMotionPermission)) {
            if (isOrientationSupported && hasOrientationPermission) {
                window.addEventListener("deviceorientation", handleDeviceOrientation, { once: false });
                log("Обработчик DeviceOrientationEvent добавлен", "success");
            }
            if (isMotionSupported && hasMotionPermission) {
                window.addEventListener("devicemotion", handleDeviceMotion, { once: false });
                log("Обработчик DeviceMotionEvent добавлен", "success");
            }

            return () => {
                window.removeEventListener("deviceorientation", handleDeviceOrientation);
                window.removeEventListener("devicemotion", handleDeviceMotion);
                log("Обработчики DeviceOrientationEvent и DeviceMotionEvent удалены", "info");
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
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

    return null;
};

export default VirtualBox;