"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { logVirtualBoxEvent } from "@/app/actionsVirtualBoxLog";

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
    const prevOrientationState = useRef({ gamma: 0 });
    const lastValidServo1 = useRef(90);

    const [orientationData, setOrientationData] = useState<{
        beta: number | null;
        gamma: number | null;
        alpha: number | null;
    }>({ beta: null, gamma: null, alpha: null });

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
        log(`Информация об устройстве: iOS=${isIOS}, версия=${iOSVersion}, UserAgent=${userAgent}`, "info");
        log(`Поддержка сенсоров: Orientation=${isOrientationSupported}, Motion=${isMotionSupported}`, "info");

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
                log("Проверка настроек Safari: убедитесь, что 'Движение и ориентация' включены в Настройки > Safari", "info");
            }
        };
        checkSafariSettings();
    }, [log]);

    useEffect(() => {
        if (isVirtualBoxActive) {
            log("VirtualBox активирован", "info");
        } else {
            log("VirtualBox деактивирован", "info");
            onServoChange("1", 90, true);
            log("Сервопривод 1 установлен в центральное положение (90°)", "info");
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

            setOrientationData({ beta, gamma, alpha });

            if (onOrientationChange) {
                onOrientationChange(beta, gamma, alpha);
            }

            const y = gamma;
            const prevY = prevOrientationState.current.gamma;

            let servo1Value: number | null = null;

            if (y === -90 || y === 90) {
                servo1Value = 90;
            } else if (y > -90 && y < 0) {
                servo1Value = Math.round(90 + y);
                if (y > -4) servo1Value = 0;
            } else if (y > 0 && y < 90) {
                servo1Value = Math.round(90 + y);
                if (y < 4) servo1Value = 180;
            } else {
                log(`Gamma (${y.toFixed(2)}) вне диапазона [-90, 90]`, "info");
                return;
            }

            const isValidTransition =
                (prevY <= 0 && y <= 0) ||
                (prevY >= 0 && y >= 0) ||
                y === 0;

            if (servo1Value !== null && isValidTransition) {
                onServoChange("1", servo1Value, true);
                lastValidServo1.current = servo1Value;
                log(`Servo1 (gamma Y): ${servo1Value}° (gamma=${y.toFixed(2)})`, "info");
            } else if (!isValidTransition) {
                log(`Переход через край Y (${prevY.toFixed(2)} → ${y.toFixed(2)}), используется последнее значение: ${lastValidServo1.current}°`, "info");
            }

            prevOrientationState.current.gamma = y;
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

            log(`Данные акселерометра: x=${acceleration.x.toFixed(2)}, y=${acceleration.y.toFixed(2)}`, "info");
        },
        [disabled, isVirtualBoxActive, hasMotionPermission, onServoChange, log]
    );

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
                window.addEventListener("deviceorientation", handleDeviceOrientation);
                log("Обработчик DeviceOrientationEvent добавлен", "success");
            }
            if (isMotionSupported && hasMotionPermission) {
                window.addEventListener("devicemotion", handleDeviceMotion);
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
