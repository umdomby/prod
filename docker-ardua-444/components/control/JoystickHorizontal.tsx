"use client"
import { useCallback, useEffect, useState } from 'react'
import { Joystick } from 'react-joystick-component'
import styles from './JoystickStyles.module.css'

type JoystickHorizontalProps = {
    onChange: (value: { x: number; y: number }) => void
    disabled?: boolean
    className?: string
}

const JoystickHorizontal = ({ onChange, disabled, className }: JoystickHorizontalProps) => {
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

        // Нормализация значений джойстика (только X-ось, Y игнорируется)
        const x = Math.round(event.x * 255) // X-ось для поворота
        const y = 0 // Y-ось не используется

        // Расчет скоростей и направлений моторов
        let motorASpeed = 0 // Левый мотор
        let motorBSpeed = 0 // Правый мотор
        let motorADirection = 'stop'
        let motorBDirection = 'stop'

        if (x !== 0) {
            const turnSpeed = Math.abs(x)
            if (x > 0) {
                // Ползунок вправо: мотор A вперед, мотор B назад (поворот влево)
                motorASpeed = turnSpeed
                motorBSpeed = turnSpeed
                motorADirection = 'forward'
                motorBDirection = 'backward'
            } else {
                // Ползунок влево: мотор A назад, мотор B вперед (поворот вправо)
                motorASpeed = turnSpeed
                motorBSpeed = turnSpeed
                motorADirection = 'backward'
                motorBDirection = 'forward'
            }
        }

        // Ограничение скоростей в диапазоне [0, 255]
        motorASpeed = Math.min(255, Math.max(0, Math.round(motorASpeed)))
        motorBSpeed = Math.min(255, Math.max(0, Math.round(motorBSpeed)))

        // Отладка
        console.log('Horizontal Joystick Move:', { x, motorASpeed, motorBSpeed, motorADirection, motorBDirection })

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
            className={`${className} ${styles.horizontalJoystickContainer} select-none`}
            style={{
                position: 'absolute',
                width: '150px',
                height: '150px',
                left: isLandscape ? '15%' : '75%',
                top: isLandscape ? '65%' : '20%',
                transform: 'translate(-50%, -50%)',
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MsUserSelect: 'none',
                MozUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                zIndex: 1001
            }}
        >
            <Joystick
                size={150}
                baseColor="transparent"
                stickColor="rgba(255, 255, 255, 0.7)"
                stickSize={40}
                move={handleMove}
                stop={handleStop}
                disabled={disabled}
                throttle={40}
                stickShape="cross"
                controlPlaneShape="horizontal" // Ограничение движения ползунка по горизонтали
            />
        </div>
    )
}

export default JoystickHorizontal