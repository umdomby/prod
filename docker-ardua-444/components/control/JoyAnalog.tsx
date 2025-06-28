"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./JoystickStyles.module.css";

type JoyAnalogProps = {
    onChange: ({ x, y }: { x: number; y: number }) => void;
    onServoChange: (servoId: "1" | "2", value: number, isAbsolute: boolean) => void;
    disabled?: boolean;
};

const JoyAnalog = ({ onChange, onServoChange, disabled }: JoyAnalogProps) => {
    const [gamepadConnected, setGamepadConnected] = useState(false);
    const [motorDirection, setMotorDirection] = useState<"forward" | "backward">("forward");
    const animationFrameRef = useRef<number | null>(null);
    const prevButtonState = useRef({
        buttonA: false,
        buttonB: false,
        buttonX: false,
        buttonY: false,
        buttonLB: false,
        buttonRB: false,
    });
    const prevStickState = useRef({
        leftStickX: 0, // Для Servo2 (D8, SSR2)
        rightStickY: 0, // Для Servo1 (D7, SSR)
    });

    // Проверка подключения геймпада
    const checkGamepad = useCallback(() => {
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads.find((gp) => gp !== null && gp.id.includes("Xbox"));
        setGamepadConnected(!!gamepad);
        return gamepad;
    }, []);

    // Обработка ввода с геймпада
    const handleGamepadInput = useCallback(() => {
        if (disabled) return;

        const gamepad = checkGamepad();
        if (!gamepad) return;

        // Аналоговые триггеры (LT и RT)
        const ltValue = gamepad.buttons[6].value; // Left Trigger
        const rtValue = gamepad.buttons[7].value; // Right Trigger
        const motorASpeed = Math.round(ltValue * 255); // Мотор A
        const motorBSpeed = Math.round(rtValue * 255); // Мотор B

        // D-Pad (Крестовина)
        const dpadUp = gamepad.buttons[12].pressed; // Вверх
        const dpadDown = gamepad.buttons[13].pressed; // Вниз
        const dpadLeft = gamepad.buttons[14].pressed; // Влево
        const dpadRight = gamepad.buttons[15].pressed; // Вправо

        // Кнопки A, B, X, Y
        const buttonA = gamepad.buttons[0].pressed; // A (зеленая)
        const buttonB = gamepad.buttons[1].pressed; // B (красная)
        const buttonX = gamepad.buttons[2].pressed; // X (синяя)
        const buttonY = gamepad.buttons[3].pressed; // Y (желтая)

        // Бамперы LB и RB
        const buttonLB = gamepad.buttons[4].pressed; // Left Bumper
        const buttonRB = gamepad.buttons[5].pressed; // Right Bumper

        // Левый и правый стики
        const leftStickX = gamepad.axes[0]; // Ось X левого стика (Servo2)
        const rightStickY = gamepad.axes[3]; // Ось Y правого стика (Servo1)
        const deadZone = 0.1; // Зона нечувствительности 10%

        // Управление моторами
        let motorA = 0;
        let motorB = 0;

        // LT и RT управляют скоростью
        if (motorASpeed > 0) {
            motorA = motorDirection === "forward" ? -motorASpeed : motorASpeed; // Учитываем направление
        }
        if (motorBSpeed > 0) {
            motorB = motorDirection === "forward" ? -motorBSpeed : motorBSpeed; // Учитываем направление
        }

        // D-Pad: направление моторов
        if (dpadUp) {
            motorA = motorA || 255;
            motorB = motorB || 255;
        } else if (dpadDown) {
            motorA = motorA ? -motorA : -255;
            motorB = motorB ? -motorB : -255;
        } else if (dpadLeft) {
            motorA = -255;
            motorB = 255;
        } else if (dpadRight) {
            motorA = 255;
            motorB = -255;
        }

        onChange({ x: motorA, y: motorB });

        // Кнопки для управления сервоприводами
        if (buttonA && !prevButtonState.current.buttonA) {
            onServoChange("1", -15, false);
        }
        if (buttonB && !prevButtonState.current.buttonB) {
            onServoChange("2", -15, false);
        }
        if (buttonX && !prevButtonState.current.buttonX) {
            onServoChange("2", 15, false);
        }
        if (buttonY && !prevButtonState.current.buttonY) {
            onServoChange("1", 15, false);
        }

        // Бамперы для переключения направления моторов
        if (buttonLB && !prevButtonState.current.buttonLB) {
            setMotorDirection("backward");
        }
        if (buttonRB && !prevButtonState.current.buttonRB) {
            setMotorDirection("forward");
        }

        // Левый стик (Servo2, ось X)
        if (Math.abs(leftStickX) > deadZone) {
            const servo2Value = Math.round((leftStickX + 1) * 90); // От 0 до 180
            onServoChange("2", servo2Value, true);
        } else if (Math.abs(leftStickX) <= deadZone && Math.abs(prevStickState.current.leftStickX) > deadZone) {
            onServoChange("2", 90, true); // Возврат в центр (90°)
        }

        // Правый стик (Servo1, ось Y)
        if (Math.abs(rightStickY) > deadZone) {
            const servo1Value = Math.round((rightStickY + 1) * 90); // От 0 до 180
            onServoChange("1", servo1Value, true);
        } else if (Math.abs(rightStickY) <= deadZone && Math.abs(prevStickState.current.rightStickY) > deadZone) {
            onServoChange("1", 90, true); // Возврат в центр (90°)
        }

        // Обновление предыдущего состояния
        prevButtonState.current = {
            buttonA,
            buttonB,
            buttonX,
            buttonY,
            buttonLB,
            buttonRB,
        };
        prevStickState.current = {
            leftStickX,
            rightStickY,
        };

        // Продолжаем опрос геймпада
        animationFrameRef.current = requestAnimationFrame(handleGamepadInput);
    }, [disabled, checkGamepad, onChange, onServoChange]);

    // Обработка подключения/отключения геймпада
    useEffect(() => {
        const handleConnect = () => {
            setGamepadConnected(!!checkGamepad());
            animationFrameRef.current = requestAnimationFrame(handleGamepadInput);
        };

        const handleDisconnect = () => {
            setGamepadConnected(false);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };

        window.addEventListener("gamepadconnected", handleConnect);
        window.addEventListener("gamepaddisconnected", handleDisconnect);

        // Проверяем, есть ли уже подключенный геймпад
        if (checkGamepad()) {
            handleConnect();
        }

        return () => {
            window.removeEventListener("gamepadconnected", handleConnect);
            window.removeEventListener("gamepaddisconnected", handleDisconnect);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [checkGamepad, handleGamepadInput]);

    return (
        <div
            className={`${styles.joyAnalogContainer} ${disabled ? "opacity-50" : ""}`}
            style={{
                position: "absolute",
                width: "100px",
                height: "100px",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: gamepadConnected ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                touchAction: "none",
                userSelect: "none",
                zIndex: 1001,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: gamepadConnected ? "rgba(0, 255, 0, 0.7)" : "rgba(255, 0, 0, 0.7)",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                }}
            />
        </div>
    );
};

export default JoyAnalog;