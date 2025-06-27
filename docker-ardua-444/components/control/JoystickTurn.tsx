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
        let motorASpeed = 0
        let motorBSpeed = 0
        let motorADirection = 'stop'
        let motorBDirection = 'stop'

        // Y-ось имеет приоритет: оба мотора движутся в одном направлении
        if (y !== 0) {
            const baseSpeed = Math.abs(y)
            motorASpeed = baseSpeed
            motorBSpeed = baseSpeed
            motorADirection = y >= 0 ? 'forward' : 'backward'
            motorBDirection = y >= 0 ? 'forward' : 'backward'
        }
        // X-ось обрабатывается только если Y-ось не активна
        else if (x !== 0) {
            const turnSpeed = Math.abs(x)
            motorASpeed = turnSpeed
            motorBSpeed = turnSpeed
            motorADirection = x >= 0 ? 'forward' : 'backward'
            motorBDirection = x >= 0 ? 'backward' : 'forward'
        }

        // Отладка: выводим значения для проверки
        console.log('Joystick Move:', { x, y, motorASpeed, motorBSpeed, motorADirection, motorBDirection });

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
                left: '50%',
                top: isLandscape ? '50%' : '60%',
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