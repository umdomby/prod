"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { logVirtualBoxEvent } from "@/app/actionsVirtualBoxLog";

// Интерфейс пропсов компонента VirtualBox
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

// Компонент VirtualBox для обработки данных ориентации и акселерометра
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
    const lastValidServo1 = useRef(90); // Последнее валидное значение сервопривода (по умолчанию 90°)
    const isValidTransition = useRef<boolean>(false); // Флаг для отслеживания валидного перехода через мёртвую зону

    // Состояние для хранения данных ориентации
    const [orientationData, setOrientationData] = useState<{
        beta: number | null;
        gamma: number | null;
        alpha: number | null;
    }>({ beta: null, gamma: null, alpha: null });

    // Функция логирования с обработкой ошибок
    const log = useCallback(async (message: string, type: "info" | "error" | "success" = "info") => {
        try {
            await logVirtualBoxEvent(message, type);
        } catch (error) {
            console.error(`[VirtualBox Client] ERROR: Failed to send log - ${String(error)}`);
        }
    }, []);

    // Проверка информации об устройстве и поддержке сенсоров при монтировании
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
            onServoChange("1", 90, true); // Возвращаем сервопривод в центральное положение
            lastValidServo1.current = 90;
            log("Сервопривод 1 установлен в центральное положение (90°)", "info");
            isValidTransition.current = false; // Сбрасываем флаг перехода
        }
    }, [isVirtualBoxActive, log, onServoChange]);

    // Функция для преобразования gamma в значение сервопривода (0...180)
    const mapGammaToServo = (gamma: number): number => {
        // gamma: [-89...89] -> servo: [90...0] или [90...180]
        // -0 -> 0°, 0 -> 179-180°, 89 -> 90°, -89 -> 90°
        if (gamma >= 0 && gamma <= 89) {
            // Диапазон [0...89] -> [179...90]
            return Math.round(179 - (gamma / 89) * (179 - 90));
        } else if (gamma <= -0 && gamma >= -89) {
            // Диапазон [-0...-89] -> [0...90]
            return Math.round((Math.abs(gamma) / 89) * 90);
        }
        return lastValidServo1.current; // Возвращаем последнее валидное значение, если вне диапазона
    };

    // Обработчик событий ориентации устройства
    const handleDeviceOrientation = useCallback(
        (event: DeviceOrientationEvent) => {
            // Проверка условий для обработки
            if (disabled || !isVirtualBoxActive || !hasOrientationPermission) {
                if (isVirtualBoxActive && (!hasOrientationPermission || disabled)) {
                    log("Обработка ориентации отключена: disabled, неактивно или нет разрешения", "info");
                }
                return;
            }

            const { beta, gamma, alpha } = event;
            // Проверка валидности данных
            if (beta === null || gamma === null || alpha === null) {
                log("Данные ориентации недоступны (null значения)", "error");
                return;
            }

            // Обновление состояния ориентации
            setOrientationData({ beta, gamma, alpha });

            // Передача данных ориентации, если callback задан
            if (onOrientationChange) {
                onOrientationChange(beta, gamma, alpha);
            }

            const y = gamma;
            const prevY = prevOrientationState.current.gamma;

            // Определяем переход через мёртвую зону (-0...0)
            const isTransition = (prevY <= 0 && y >= -0) || (prevY >= -0 && y <= 0);

            if (isTransition) {
                isValidTransition.current = !isValidTransition.current;
                log(`Переход через 0/-0 обнаружен, isValidTransition=${isValidTransition.current}`, "info");
            }

            // Проверка мертвых зон
            const isDeadZone = (lastValidServo1.current <= 90 && y >= -0 && y <= 3) ||
                (lastValidServo1.current >= 90 && y <= 0 && y >= -3);

            if (isDeadZone) {
                log(`Мёртвая зона: gamma=${y.toFixed(2)}, servo1=${lastValidServo1.current}, данные не отправлены`, "info");
                prevOrientationState.current.gamma = y;
                return;
            }

            // Обработка данных, если переход валиден и не в мёртвой зоне
            if (isValidTransition.current || (y >= -89 && y <= 89)) {
                const servo1Value = mapGammaToServo(y);
                if (servo1Value !== lastValidServo1.current) {
                    onServoChange("1", servo1Value, true);
                    lastValidServo1.current = servo1Value;
                    log(`Сервопривод 1 обновлён: gamma=${y.toFixed(2)} -> servo1=${servo1Value}`, "success");
                }
            } else {
                log(`Данные не отправлены на servo1, gamma=${y.toFixed(2)}, isValidTransition=${isValidTransition.current}`, "info");
            }

            prevOrientationState.current.gamma = y;
        },
        [disabled, isVirtualBoxActive, hasOrientationPermission, onServoChange, onOrientationChange, log]
    );

    // Обработчик событий акселерометра
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

    // Обработчик запроса разрешений
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

    // Регистрация функции запроса разрешений
    useEffect(() => {
        // @ts-ignore
        const virtualBoxRef = (window as any).virtualBoxRef || { current: null };
        virtualBoxRef.current = { handleRequestPermissions };
        return () => {
            virtualBoxRef.current = null;
        };
    }, [handleRequestPermissions]);

    // Добавление и удаление обработчиков событий
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