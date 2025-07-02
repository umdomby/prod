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
    const lastValidServo1 = useRef(90); // Сохраняем последнее отправленное значение сервопривода
    const isValidTransition = useRef<boolean>(false); // Флаг для отслеживания валидного перехода

    const [orientationData, setOrientationData] = useState<{
        beta: number | null;
        gamma: number | null;
        alpha: number | null;
    }>({ beta: null, gamma: null, alpha: null });

    // Логирование событий
    const log = useCallback(async (message: string, type: "info" | "error" | "success" = "info") => {
        try {
            await logVirtualBoxEvent(message, type);
        } catch (error) {
            console.error(`[VirtualBox Client] ERROR: Failed to send log - ${String(error)}`);
        }
    }, []);

    // Проверка информации об устройстве и поддержке сенсоров
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

    // Проверка настроек Safari для iOS
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

    // Обработка активации/деактивации VirtualBox
    useEffect(() => {
        if (isVirtualBoxActive) {
            log("VirtualBox активирован", "info");
        } else {
            log("VirtualBox деактивирован", "info");
            onServoChange("1", 90, true);
            lastValidServo1.current = 90;
            log("Сервопривод 1 установлен в центральное положение (90°)", "info");
            isValidTransition.current = false; // Сбрасываем флаг при деактивации
        }
    }, [isVirtualBoxActive, log, onServoChange]);

    // Обработка событий ориентации устройства
    const handleDeviceOrientation = useCallback(
        (event: DeviceOrientationEvent) => {
            if (disabled || !isVirtualBoxActive || !hasOrientationPermission) {
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

            const y = gamma; // gamma - это угол по оси Y
            const prevY = prevOrientationState.current.gamma;

            // Проверяем переход через -89/+89
            const isRangeTransition = (prevY <= -87 && y >= 87) || (prevY >= 87 && y <= -87);

            if (isRangeTransition) {
                isValidTransition.current = true;
                log(`Обнаружен переход через -89/+89, isValidTransition=${isValidTransition.current}`, "info");
            } else if (Math.abs(prevY - y) > 180 || (prevY >= -3 && prevY <= 3 && y >= -3 && y <= 3)) {
                // Игнорируем переходы через 0 (3,2,1,0 -> -0,-1,-2) и другие большие переходы
                isValidTransition.current = false;
                log(`Игнорируется переход через 0 или большой переход, gamma=${y.toFixed(2)}`, "info");
                prevOrientationState.current.gamma = y;
                return;
            }

            // Обрабатываем данные только в диапазоне [-89, 89] и при валидном переходе
            if (isValidTransition.current && y >= -89 && y <= 89) {
                // Масштабируем gamma: [-89, 89] -> [0, 180]
                // Точка -89 (переход) 89 соответствует 90–91° на сервоприводе
                // Точка 0 (в сторону -0,-1,-2) соответствует 0° на сервоприводе
                // Точка 0 (в сторону 1,2,3) соответствует 180° на сервоприводе
                // Центр (-89 градусов gamma) соответствует 90° на сервоприводе
                let servo1Value: number;
                if (y >= 0) {
                    // Для положительного диапазона [0, 89] -> [180, 91]
                    servo1Value = Math.round(180 - ((y / 89) * (180 - 91)));
                } else {
                    // Для отрицательного диапазона [-89, 0] -> [90, 0]
                    servo1Value = Math.round(((-y / 89) * 90));
                }

                if (servo1Value !== lastValidServo1.current) {
                    onServoChange("1", servo1Value, true);
                    lastValidServo1.current = servo1Value;
                    log(`Servo1 (gamma Y): ${servo1Value}° (gamma=${y.toFixed(2)})`, "info");
                }
            } else {
                log(`Данные не отправлены на servo1, gamma=${y.toFixed(2)}, isValidTransition=${isValidTransition.current}`, "info");
            }

            prevOrientationState.current.gamma = y;
        },
        [disabled, isVirtualBoxActive, hasOrientationPermission, onServoChange, onOrientationChange, log]
    );

    // Обработка событий акселерометра
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
        },
        [disabled, isVirtualBoxActive, hasMotionPermission, log]
    );

    // Обработка запросов разрешений
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
    }, [isVirtualBoxActive, log, handleDeviceOrientation, handleDeviceMotion]);

    // Регистрация обработчика разрешений
    useEffect(() => {
        // @ts-ignore
        const virtualBoxRef = (window as any).virtualBoxRef || { current: null };
        virtualBoxRef.current = { handleRequestPermissions };
        return () => {
            virtualBoxRef.current = null;
        };
    }, [handleRequestPermissions]);

    // Регистрация обработчиков событий ориентации и акселерометра
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