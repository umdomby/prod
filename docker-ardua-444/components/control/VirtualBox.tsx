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
    // lastValidServo1 теперь отражает последнее отправленное значение servo1,
    // это важно для логики мёртвых зон и границ.
    const lastValidServo1 = useRef(90);

    // Состояние для хранения данных ориентации
    const [orientationData, setOrientationData] = useState<{
        beta: number | null;
        gamma: number | null;
        alpha: number | null;
    }>({ beta: null, gamma: null, alpha: null });

    // Флаг, который помогает отслеживать, был ли произведен "валидный" переход через 0/180
    // Это предотвращает резкие скачки сервопривода при прохождении через 0 градусов.
    // Если true, то система готова принимать новые значения gamma для пересчёта servo.
    // Сбрасывается при прохождении gamma через "мёртвую зону перехода" вокруг 0.
    const isGammaTrackingActive = useRef<boolean>(true);


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
            // При активации сбрасываем флаг, чтобы быть готовыми к первому корректному отсчёту
            isGammaTrackingActive.current = true;
        } else {
            log("VirtualBox деактивирован", "info");
            onServoChange("1", 90, true); // Возвращаем сервопривод в центральное положение
            lastValidServo1.current = 90;
            log("Сервопривод 1 установлен в центральное положение (90°)", "info");
            isGammaTrackingActive.current = true; // Сбрасываем флаг при деактивации
        }
    }, [isVirtualBoxActive, log, onServoChange]);

    /**
     * Функция для преобразования gamma в значение сервопривода (0...180).
     * Gamma: [-89...89] -> Servo: [0...90...180]
     * -89° (почти "вниз" от пользователя) -> 0° Servo
     * 0° (прямо на пользователя)     -> 90° Servo
     * 89° (почти "вверх" от пользователя) -> 180° Servo
     */
    const mapGammaToServo = useCallback((gamma: number): number => {
        // Ограничиваем gamma для стабильности, хотя по спецификации она должна быть в пределах [-90, 90].
        // Учтём небольшие отклонения, но основная логика остаётся для [-89, 89].
        const clampedGamma = Math.max(-89, Math.min(89, gamma));

        // Линейное преобразование:
        // Диапазон gamma [-89, 89] имеет ширину 178.
        // Диапазон servo [0, 180] имеет ширину 180.
        // Масштабируем gamma к диапазону [0, 1]
        const normalizedGamma = (clampedGamma + 89) / 178; // 0 для -89, 0.5 для 0, 1 для 89

        // Преобразуем к диапазону сервопривода [0, 180]
        const servoValue = normalizedGamma * 180;

        return Math.round(servoValue);
    }, []);

    // Обработчик событий ориентации устройства
    const handleDeviceOrientation = useCallback(
        (event: DeviceOrientationEvent) => {
            // Проверка условий для обработки
            if (disabled || !isVirtualBoxActive || !hasOrientationPermission) {
                if (isVirtualBoxActive && (!hasOrientationPermission || disabled)) {
                    // Логируем только если VirtualBox активен, но есть проблемы с разрешениями/отключением
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

            // Обновление состояния ориентации для отображения (если необходимо)
            setOrientationData({ beta, gamma, alpha });

            // Передача данных ориентации, если callback задан
            if (onOrientationChange) {
                onOrientationChange(beta, gamma, alpha);
            }

            const currentGamma = gamma;
            const previousServoValue = lastValidServo1.current;
            const calculatedServoValue = mapGammaToServo(currentGamma);

            // --- Логика "Мёртвых Зон" и "Границ Servo" ---

            // 1. Мёртвая зона вокруг 0 для gamma (зона нечувствительности для предотвращения дребезга)
            // Определяем "мёртвую зону перехода" вокруг 0.
            // Если gamma находится в этом диапазоне, мы перестаём активно отслеживать её изменения
            // до тех пор, пока она не выйдет за пределы этой зоны.
            const DEAD_ZONE_RANGE = 3; // Например, от -3 до 3 градусов
            const isInDeadZone = currentGamma >= -DEAD_ZONE_RANGE && currentGamma <= DEAD_ZONE_RANGE;

            if (isInDeadZone) {
                // Если мы находимся в мёртвой зоне, прекращаем активное отслеживание gamma
                // и не отправляем новых данных на сервопривод.
                // Это предотвращает постоянные микро-обновления сервопривода, когда gamma колеблется около 0.
                isGammaTrackingActive.current = false;
                log(`В мёртвой зоне: gamma=${currentGamma.toFixed(2)}, Servo1=${previousServoValue}, данные не отправлены. Ожидание выхода.`, "info");
                return;
            } else {
                // Если мы вышли из мёртвой зоны, возобновляем активное отслеживание gamma.
                if (!isGammaTrackingActive.current) {
                    log(`Выход из мёртвой зоны: gamma=${currentGamma.toFixed(2)}, возобновление отслеживания.`, "info");
                    isGammaTrackingActive.current = true;
                }
            }

            // Если isGammaTrackingActive.current теперь false (потому что мы в dead zone), то дальше не идём
            if (!isGammaTrackingActive.current) {
                return;
            }

            // 2. Обработка крайних границ Servo1 (0 и 180)
            // Если servo1 достиг 0 и gamma продолжает двигаться в "отрицательную" сторону (уменьшается)
            // (т.е. CalculatedServoValue, рассчитанный из текущей gamma, меньше или равен 0),
            // то мы не отправляем новые данные, так как сервопривод уже на своей границе.
            if (previousServoValue === 0 && calculatedServoValue <= 0) {
                log(`Достигнута нижняя граница servo1=0. Gamma=${currentGamma.toFixed(2)}. Данные не отправлены.`, "info");
                return;
            }
            // Если servo1 достиг 180 и gamma продолжает двигаться в "положительную" сторону (увеличивается)
            // (т.е. CalculatedServoValue, рассчитанный из текущей gamma, больше или равен 180),
            // то мы не отправляем новые данные, так как сервопривод уже на своей границе.
            if (previousServoValue === 180 && calculatedServoValue >= 180) {
                log(`Достигнута верхняя граница servo1=180. Gamma=${currentGamma.toFixed(2)}. Данные не отправлены.`, "info");
                return;
            }

            // 3. Отправка данных на сервопривод
            // Отправляем данные только если новое значение отличается от предыдущего
            // и мы не находимся в одной из "блокирующих" ситуаций выше.
            if (calculatedServoValue !== previousServoValue) {
                // Ограничиваем значение в диапазоне [0...180] (хотя mapGammaToServo уже это делает)
                const clampedServo1Value = Math.max(0, Math.min(180, calculatedServoValue));
                onServoChange("1", clampedServo1Value, true);
                lastValidServo1.current = clampedServo1Value;
                log(`Сервопривод 1 обновлён: gamma=${currentGamma.toFixed(2)} -> servo1=${clampedServo1Value}`, "success");
            } else {
                log(`Сервопривод 1: gamma=${currentGamma.toFixed(2)} -> servo1=${calculatedServoValue}, без изменений.`, "info");
            }
        },
        [disabled, isVirtualBoxActive, hasOrientationPermission, onServoChange, onOrientationChange, log, mapGammaToServo]
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

    // Обработчик запроса разрешений (регистрируется вовне для вызова извне компонента)
    const handleRequestPermissions = useCallback(() => {
        // Эта функция может быть вызвана из родительского компонента для запроса разрешений.
        // Её содержимое будет зависеть от того, как вы реализуете запрос разрешений.
        // Здесь мы просто логируем, что запрос был инициирован.
        log("Запрос разрешений инициирован (место для вашей логики запроса DeviceOrientation/DeviceMotion)", "info");
        // Пример (для iOS 13+ Safari, если разрешения не получены ранее):
        // if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        //     (DeviceOrientationEvent as any).requestPermission()
        //         .then((state: 'granted' | 'denied') => {
        //             if (state === 'granted') {
        //                 log("Разрешение на DeviceOrientation получено", "success");
        //                 // Возможно, здесь нужно триггернуть переактивацию обработчиков
        //             } else {
        //                 log("Разрешение на DeviceOrientation отклонено", "error");
        //             }
        //         })
        //         .catch(console.error);
        // }
    }, [log]);


    // Регистрация функции запроса разрешений
    // Это позволяет родительскому компоненту вызвать handleRequestPermissions
    // Например, через кнопку "Запросить разрешения"
    useEffect(() => {
        // @ts-ignore
        // Создаем глобальный объект, если его нет, и привязываем к нему нашу функцию
        if (!(window as any).virtualBoxRef) {
            (window as any).virtualBoxRef = { current: null };
        }
        (window as any).virtualBoxRef.current = { handleRequestPermissions };

        return () => {
            // Очищаем ссылку при размонтировании компонента
            if ((window as any).virtualBoxRef && (window as any).virtualBoxRef.current === handleRequestPermissions) {
                (window as any).virtualBoxRef.current = null;
            }
        };
    }, [handleRequestPermissions]);

    // Добавление и удаление обработчиков событий DeviceOrientation и DeviceMotion
    useEffect(() => {
        if (isVirtualBoxActive) {
            // Добавляем обработчики только если VirtualBox активен и есть соответствующие разрешения
            if (isOrientationSupported && hasOrientationPermission) {
                window.addEventListener("deviceorientation", handleDeviceOrientation);
                log("Обработчик DeviceOrientationEvent добавлен", "success");
            } else if (isOrientationSupported && !hasOrientationPermission) {
                log("DeviceOrientation поддерживается, но разрешение не предоставлено.", "info");
            } else if (!isOrientationSupported) {
                log("DeviceOrientation не поддерживается на этом устройстве.", "info");
            }

            if (isMotionSupported && hasMotionPermission) {
                window.addEventListener("devicemotion", handleDeviceMotion);
                log("Обработчик DeviceMotionEvent добавлен", "success");
            } else if (isMotionSupported && !hasMotionPermission) {
                log("DeviceMotion поддерживается, но разрешение не предоставлено.", "info");
            } else if (!isMotionSupported) {
                log("DeviceMotion не поддерживается на этом устройстве.", "info");
            }

            // Функция очистки (выполняется при размонтировании или изменении зависимостей)
            return () => {
                window.removeEventListener("deviceorientation", handleDeviceOrientation);
                window.removeEventListener("devicemotion", handleDeviceMotion);
                log("Обработчики DeviceOrientationEvent и DeviceMotionEvent удалены", "info");
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            };
        } else {
            // Если VirtualBox неактивен, убедимся, что все обработчики удалены.
            // Это важно, чтобы избежать утечек памяти и лишней работы.
            window.removeEventListener("deviceorientation", handleDeviceOrientation);
            window.removeEventListener("devicemotion", handleDeviceMotion);
            log("VirtualBox неактивен, обработчики событий удалены.", "info");
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
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

    return null; // Компонент не рендерит никакого UI
};

export default VirtualBox;