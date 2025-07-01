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
    // prevOrientationState теперь нужен только для отслеживания последнего валидного гамма для логирования,
    // а не для логики перехода
    const prevOrientationState = useRef({ gamma: 0 });
    const lastValidServo1 = useRef(90); // Сохраняем последнее отправленное значение сервопривода

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
                log("Проверка настроек Safari: убедитесь, что 'Движение и ориентация' включены в Настройки > Safari > Конфиденциальность и безопасность", "info");
            }
        };
        checkSafariSettings();
    }, [log]);

    useEffect(() => {
        if (isVirtualBoxActive) {
            log("VirtualBox активирован", "info");
        } else {
            log("VirtualBox деактивирован", "info");
            // Сбрасываем сервопривод в центральное положение при деактивации
            onServoChange("1", 90, true);
            lastValidServo1.current = 90; // Обновляем последнее валидное значение
            log("Сервопривод 1 установлен в центральное положение (90°)", "info");
        }
    }, [isVirtualBoxActive, log, onServoChange]);

    const handleDeviceOrientation = useCallback(
        (event: DeviceOrientationEvent) => {
            if (disabled || !isVirtualBoxActive || !hasOrientationPermission) {
                // Log only if it's currently active but permissions are revoked or disabled externally
                // This avoids excessive logging when VirtualBox is simply inactive.
                if (isVirtualBoxActive && (!hasOrientationPermission || disabled)) {
                    log("Обработка ориентации отключена: disabled, неактивно или нет разрешения", "info");
                }
                return;
            }

            const { beta, gamma, alpha } = event;
            if (beta === null || gamma === null || alpha === null) {
                log("Данные ориентации недоступны (null значения)", "error");
                return;
            }

            setOrientationData({ beta, gamma, alpha });

            if (onOrientationChange) {
                onOrientationChange(beta, gamma, alpha);
            }

            const y = gamma;
            let servo1Value: number;

            // Определяем "мертвую зону" вокруг 0 градусов gamma
            const deadZoneThreshold = 3; // Например, +/- 3 градуса от 0
            const minGamma = -89;
            const maxGamma = 89;

            if (y > -deadZoneThreshold && y < deadZoneThreshold) {
                // Если gamma находится в мертвой зоне, устанавливаем сервопривод в центр
                servo1Value = 90;
            } else if (y >= deadZoneThreshold) {
                // Голова наклоняется назад (Y положительный)
                // Диапазон gamma: [deadZoneThreshold, 89] -> Диапазон servo: [90, 180]
                const scaledY = Math.min(y, maxGamma); // Ограничиваем Y сверху
                // Масштабирование: (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
                servo1Value = Math.round(
                    (scaledY - deadZoneThreshold) * (180 - 90) / (maxGamma - deadZoneThreshold) + 90
                );
                servo1Value = Math.min(Math.max(servo1Value, 90), 180); // Ограничиваем диапазон серво
            } else { // y <= -deadZoneThreshold
                // Голова наклоняется вперед (Y отрицательный)
                // Диапазон gamma: [-89, -deadZoneThreshold] -> Диапазон servo: [0, 90]
                const scaledY = Math.max(y, minGamma); // Ограничиваем Y снизу
                // Масштабирование: (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
                servo1Value = Math.round(
                    (scaledY - minGamma) * (90 - 0) / (-deadZoneThreshold - minGamma) + 0
                );
                servo1Value = Math.min(Math.max(servo1Value, 0), 90); // Ограничиваем диапазон серво
            }

            // Обновляем серво только если значение изменилось
            if (servo1Value !== lastValidServo1.current) {
                onServoChange("1", servo1Value, true);
                lastValidServo1.current = servo1Value;
                log(`Servo1 (gamma Y): ${servo1Value}° (gamma=${y.toFixed(2)})`, "info");
            }

            prevOrientationState.current.gamma = y;
        },
        [disabled, isVirtualBoxActive, hasOrientationPermission, onServoChange, onOrientationChange, log]
    );

    const handleDeviceMotion = useCallback(
        (event: DeviceMotionEvent) => {
            if (disabled || !isVirtualBoxActive || !hasMotionPermission) {
                if (isVirtualBoxActive && (!hasMotionPermission || disabled)) {
                    log("Обработка акселерометра отключена: disabled, неактивно или нет разрешения", "info");
                }
                return;
            }

            const { acceleration } = event;
            if (!acceleration || acceleration.x === null || acceleration.y === null || acceleration.z === null) {
                log("Данные акселерометра недоступны (null значения)", "error");
                return;
            }

            log(`Данные акселерометра: x=${acceleration.x.toFixed(2)}, y=${acceleration.y.toFixed(2)}, z=${acceleration.z.toFixed(2)}`, "info");
            // В этой функции вы можете добавить логику для Servo2 (ось X) если это необходимо
        },
        [disabled, isVirtualBoxActive, hasMotionPermission, log]
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
    }, [isVirtualBoxActive, log, handleDeviceOrientation, handleDeviceMotion]); // Добавил зависимости

    useEffect(() => {
        // @ts-ignore
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