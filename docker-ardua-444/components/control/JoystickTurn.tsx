"use client"
import { useCallback, useEffect, useState } from 'react'
import { Joystick } from 'react-joystick-component' // Исправлен импорт

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

        // Нормализуем значения от -255 до 255 для осей X и Y
        const x = Math.round(event.x * 255) // Ось X для поворота
        const y = Math.round(event.y * 255) // Ось Y для движения вперед/назад

        onChange({ x, y })
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
                throttle={40} // Ограничение частоты обновления
                stickShape="cross" // Крестообразная форма джойстика
            />
        </div>
    )
}

export default JoystickTurn