"use client"
import { useCallback, useEffect, useState } from 'react'
import { Joystick, JoystickShape } from 'react-joystick-component'

type JoystickProps = {
    mo: 'A' | 'B' // motor → mo
    onChange: (value: number) => void
    direction: 'forward' | 'backward' | 'stop'
    sp: number // speed → sp
    className?: string
    disabled?: boolean
}

const JoystickTurn = ({ mo, onChange, direction, sp, disabled, className }: JoystickProps) => {
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

        // Отладочные логи для проверки значений
        console.log(`JoystickTurn mo: ${mo}, x: ${event.x}, y: ${event.y}`);

        // Motor A (forward/backward) uses Y-axis, Motor B (left/right) uses X-axis
        const value = mo === 'A' ? -event.y : event.x // Invert Y for natural control (up = forward)
        const clampedValue = Math.max(-255, Math.min(255, value * 255)) // Scale from -100..100 to -255..255
        onChange(clampedValue)
    }, [mo, onChange, disabled])

    const handleStop = useCallback(() => {
        console.log(`JoystickTurn mo: ${mo}, stopped`);
        onChange(0) // Reset to 0 when joystick is released
    }, [mo, onChange])

    return (
        <div
            className={`noSelect ${className}`}
            style={{
                position: 'absolute',
                width: '150px',
                height: '150px',
                right: '20px', // Positioned on the right
                top: isLandscape ? '50%' : '70%',
                transform: isLandscape ? 'translateY(-50%)' : 'translateY(-70%)',
                touchAction: 'none',
                userSelect: 'none',
                cursor: disabled ? 'not-allowed' : 'default',
                zIndex: 1001
            }}
        >
            <Joystick
                size={150}
                baseColor="rgba(255, 255, 255, 0.2)"
                stickColor="rgba(255, 255, 255, 0.7)"
                throttle={40} // Match SocketClient throttling
                controlPlaneShape={JoystickShape.Cross} // Cross-shaped joystick
                disabled={disabled}
                move={handleMove}
                stop={handleStop}
                stickSize={50} // Уменьшаем размер стика для чёткости
                minDistance={10} // Минимальное расстояние для активации
            />
        </div>
    )
}

export default JoystickTurn