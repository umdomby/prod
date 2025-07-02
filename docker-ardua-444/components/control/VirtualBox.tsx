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

    // Функция логирования событий с обработкой ошибок
    const log = useCallback(async (message: string, type: "info" | "error" | "success" = "info") => {
        try {
            await logVirtualBoxEvent(message, type);
        } catch (error) {
            console.error(`[VirtualBox Client] ERROR: Failed to send log - ${String(error)}`);
        }
    }, []);

    // Проверка информации об устройстве и поддержке сенсоров при монтировании компонента
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

    // Проверка настроек Safari для iOS-устройств
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

    // Обработчик событий ориентации устройства
    const handleDeviceOrientation = useCallback(
        (event: DeviceOrientationEvent) => {
            // Проверка условий для обработки ориентации
            if (disabled || !isVirtualBoxActive || !hasOrientationPermission) {
                if (isVirtualBoxActive && (!hasOrientationPermission || disabled)) {
                    log("Обработка ориентации отключена: disabled, неактивно или нет разрешения", "info");
                }
                return;
            }

            const { beta, gamma, alpha } = event;
            // Проверка валидности данных ориентации
            if (beta === null || gamma === null || alpha === null) {
                log("Данные ориентации недоступны (null значения)", "error");
                return;
            }

            // Обновление состояния ориентации
            setOrientationData({ beta, gamma, alpha });

            // Вызов callback для передачи данных ориентации, если он задан
            if (onOrientationChange) {
                onOrientationChange(beta, gamma, alpha);
            }

            const y = gamma;
            const prevY = prevOrientationState.current.gamma;

            // Определяем переход через мёртвую зону (-89/+89)
            const isTransition = (prevY <= -87 && y >= 87) || (prevY >= 87 && y <= -87);

            if (isTransition) {
                isValidTransition.current = !isValidTransition.current;
                log(`Переход через -89/+89 обнаружен, isValidTransition=${isValidTransition.current}`, "info");
            }

            // Конфигурируемый центр для сервопривода 1
            const SERVO1_CENTER = 90; // Центральное значение сервопривода, соответствующее gamma = 0°
            // Отправляем данные только в валидном диапазоне и при валидном переходе
            if (isValidTransition.current && y >= -89 && y <= 89) {
                // Масштабируем gamma: [-89, 89] -> [0, 180], где gamma = 0 соответствует servo1 = SERVO1_CENTER (90°)
                // Формула: servo1Value = SERVO1_CENTER + (y / 89) * 90
                // - При y = 0°, servo1Value = 90° (SERVO1_CENTER)
                // - При y = -89°, servo1Value = 0°
                // - При y = 89°, servo1Value = 180°
                // Это обеспечивает линейное масштабирование gamma в диапазоне [-89, 89] на servo1 в [0, 180]
                // Чтобы изменить центр, измените SERVO1_CENTER, например, на 80 или 100, сохраняя диапазон 0–180
                const servo1Value = Math.round(SERVO1_CENTER + (y / 89) * 90);
                if (servo1Value !== lastValidServo1.current) {
                    onServoChange("1", servo1Value, true);
                    lastValidServo1.current = servo1Value;
                    log(`Servo1 (gamma Y): ${servo1Value}° (gamma=${y.toFixed(2)})`, "info");
                }
            } else if (!isValidTransition.current) {
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

    // Добавление и удаление обработчиков событий ориентации и акселерометра
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