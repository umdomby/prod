"use client"
import { useCallback, useEffect, useState } from 'react'
import { Joystick } from 'react-joystick-component'

type JoystickProps = {
    onChange: (value: { x: number; y: number }) => void
    direction: 'forward' | 'backward' | 'stop'
    sp: number
    className?: string
    disabled?: boolean
}

const JoystickTurn = ({ onChange, direction, sp, disabled, className }: JoystickProps) => {
    const [isLandscape, setIsLandscape] = useState(false)

    useEffect(() => {
        const handleOrientationChange = () => {
            setIsLandscape(window.matchMedia("(orientation: landscape)").matches)
        }

        handleOrientationChange()
        const mediaQuery = window.matchMedia("(orientation: landscape)")
        mediaQuery.addEventListener('change', handleOrientationChange)

        return () => {
            mediaQuery.removeEventListener('change', handleOrientationChange)
        }
    }, [])

    const handleMove = useCallback((event: any) => {
        if (disabled) return

        // Нормализация значений джойстика от -1 до 1 в диапазон -255 до 255
        const x = Math.round(event.x * 255) // X-ось для поворота
        const y = Math.round(event.y * 255) // Y-ось для движения вперед/назад

        // Расчет скоростей и направлений моторов
        let motorASpeed = 0 // Левый мотор
        let motorBSpeed = 0 // Правый мотор
        let motorADirection = 'stop'
        let motorBDirection = 'stop'

        // Базовая скорость по Y-оси
        const baseSpeed = Math.abs(y)

        if (y !== 0) {
            // Движение вперед или назад
            motorADirection = y >= 0 ? 'backward' : 'forward'
            motorBDirection = y >= 0 ? 'backward' : 'forward'
            motorASpeed = baseSpeed
            motorBSpeed = baseSpeed

            // Корректировка скорости для поворота (X-ось)
            if (x !== 0) {
                const turnSpeed = Math.abs(x)
                if (x > 0) {
                    // Поворот вправо: уменьшаем скорость левого мотора (A)
                    motorASpeed = Math.max(0, baseSpeed - turnSpeed)
                    motorBSpeed = baseSpeed // Правый мотор на полной скорости
                    if (motorASpeed === 0) motorADirection = 'stop'
                } else {
                    // Поворот влево: уменьшаем скорость правого мотора (B)
                    motorASpeed = baseSpeed // Левый мотор на полной скорости
                    motorBSpeed = Math.max(0, baseSpeed - turnSpeed)
                    if (motorBSpeed === 0) motorBDirection = 'stop'
                }
            }
        } else if (x !== 0) {
            // Чистый поворот (без движения по Y)
            const turnSpeed = Math.abs(x)
            if (x > 0) {
                // Поворот вправо: правый мотор (B) работает, левый (A) останавливается
                motorASpeed = 0
                motorBSpeed = turnSpeed
                motorADirection = 'stop'
                motorBDirection = 'forward'
            } else {
                // Поворот влево: левый мотор (A) работает, правый (B) останавливается
                motorASpeed = turnSpeed
                motorBSpeed = 0
                motorADirection = 'forward'
                motorBDirection = 'stop'
            }
        }

        // Ограничение скоростей в диапазоне [0, 255]
        motorASpeed = Math.min(255, Math.max(0, Math.round(motorASpeed)))
        motorBSpeed = Math.min(255, Math.max(0, Math.round(motorBSpeed)))

        // Отладка: выводим значения для проверки
        console.log('Joystick Move:', { x, y, motorASpeed, motorBSpeed, motorADirection, motorBDirection })

        // Передаем значения моторов в родительский компонент (SocketClient)
        onChange({
            x: motorASpeed * (motorADirection === 'forward' ? 1 : motorADirection === 'backward' ? -1 : 0),
            y: motorBSpeed * (motorBDirection === 'forward' ? 1 : motorBDirection === 'backward' ? -1 : 0)
        })
    }, [onChange, disabled])

    const handleStop = useCallback(() => {
        if (disabled) return
        onChange({ x: 0, y: 0 })
    }, [onChange, disabled])

    return (
        <div
            className={className}
            style={{
                position: 'absolute',
                width: '150px',
                height: '150px',
                left: isLandscape ? '85%' : '80%', // Правый нижний угол
                top: isLandscape ? '80%' : '85%', // Правый нижний угол
                transform: 'translate(-50%, -50%)',
                touchAction: 'none',
                zIndex: 1001
            }}
        >
            <Joystick
                size={150}
                baseColor="rgba(255, 255, 255, 0.2)"
                stickColor="rgba(255, 255, 255, 0.7)"
                move={handleMove}
                stop={handleStop}
                disabled={disabled}
                throttle={40}
                stickShape="cross"
            />
        </div>
    )
}

export default JoystickTurn