"use client";
import { useCallback, useEffect, useRef, useState } from "react";

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
    const lastValidServo1 = useRef(90); // Последнее валидное значение сервопривода 1 (по умолчанию 90°)
    const lastValidServo2 = useRef(90); // Последнее валидное значение сервопривода 2 (по умолчанию 90°)
    const isValidTransition1 = useRef<boolean>(false); // Флаг для отслеживания валидного перехода servo1
    const isValidTransition2 = useRef<boolean>(false); // Флаг для отслеживания валидного перехода servo2
    const prevOrientationState = useRef({ gamma: 90 });
    const prevOrientationState2 = useRef({ gamma: 90, alpha: 0 });
    // Состояние для хранения данных ориентации
    const [orientationData, setOrientationData] = useState<{
        beta: number | null;
        gamma: number | null;
        alpha: number | null;
    }>({ beta: null, gamma: null, alpha: null });


    // Обработка активации/деактивации VirtualBox
    useEffect(() => {
        if (!isVirtualBoxActive) {
            onServoChange("1", 90, true); // Возвращаем сервопривод 1 в центральное положение
            onServoChange("2", 90, true); // Возвращаем сервопривод 2 в центральное положение
            lastValidServo1.current = 90;
            lastValidServo2.current = 90;
            isValidTransition1.current = false; // Сбрасываем флаг перехода servo1
            isValidTransition2.current = false; // Сбрасываем флаг перехода servo2
        }
    }, [isVirtualBoxActive, onServoChange]);

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

    // Функция для преобразования alpha в значение сервопривода (0...180)
    const mapAlphaToServo = (alpha: number): number => {

        return lastValidServo2.current; // Возвращаем последнее валидное значение, если вне диапазона
    };

    // Обработчик событий ориентации устройства
    const handleDeviceOrientation = useCallback(
        (event: DeviceOrientationEvent) => {
            // Проверка условий для обработки
            if (disabled || !isVirtualBoxActive || !hasOrientationPermission) {
                return;
            }

            const { beta, gamma, alpha } = event;
            // Проверка валидности данных
            if (beta === null || gamma === null || alpha === null) {
                return;
            }

            // Обновление состояния ориентации
            setOrientationData({ beta, gamma, alpha });

            // Передача данных ориентации, если callback задан
            if (onOrientationChange) {
                onOrientationChange(beta, gamma, alpha);
            }

            // Обработка servo1 (gamma)
            const y = gamma;
            const prevY = prevOrientationState2.current.gamma;

            const isTransition1 = (y < -5 && prevOrientationState.current.gamma <= 120 && prevY <= 0) || (y > 5 && prevOrientationState.current.gamma >= 60 && prevY >= 0);


            if (isTransition1) {
                const servo1Value = mapGammaToServo(y);
                if (servo1Value !== lastValidServo1.current) {
                    onServoChange("1", servo1Value, true);
                    lastValidServo1.current = servo1Value;
                    prevOrientationState.current.gamma = servo1Value;
                    prevOrientationState2.current.gamma = y;
                }
            }





            // Обработка servo2 (alpha)
            const z = alpha;
            const prevZ = prevOrientationState2.current.alpha;


            const servo2Value = z;
            if (servo2Value !== lastValidServo2.current) {
                onServoChange("2", servo2Value, true);
                lastValidServo2.current = servo2Value;
                prevOrientationState2.current.alpha = z;
            }


            prevOrientationState2.current.gamma = y;
            prevOrientationState2.current.alpha = z;
        },
        [disabled, isVirtualBoxActive, hasOrientationPermission, onServoChange, onOrientationChange]
    );

    // Обработчик событий акселерометра
    const handleDeviceMotion = useCallback(
        (event: DeviceMotionEvent) => {
            if (disabled || !isVirtualBoxActive || !hasMotionPermission) {
                return;
            }

            const { acceleration } = event;
            if (!acceleration || acceleration.x === null || acceleration.y === null || acceleration.z === null) {
                return;
            }
        },
        [disabled, isVirtualBoxActive, hasMotionPermission]
    );

    // Обработчик запроса разрешений
    const handleRequestPermissions = useCallback(() => {
        if (!isVirtualBoxActive) {
            window.removeEventListener("deviceorientation", handleDeviceOrientation);
            window.removeEventListener("devicemotion", handleDeviceMotion);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        }
    }, [isVirtualBoxActive, handleDeviceOrientation, handleDeviceMotion]);

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
            }
            if (isMotionSupported && hasMotionPermission) {
                window.addEventListener("devicemotion", handleDeviceMotion);
            }

            return () => {
                window.removeEventListener("deviceorientation", handleDeviceOrientation);
                window.removeEventListener("devicemotion", handleDeviceMotion);
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
    ]);

    return null;
};

export default VirtualBox;