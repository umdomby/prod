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

        // Normalize joystick values from -1 to 1 to -255 to 255
        const x = Math.round(event.x * 255) // X-axis for forward/backward
        const y = Math.round(event.y * 255) // Y-axis for turning

        // Calculate motor speeds and directions
        let motorASpeed = 0
        let motorBSpeed = 0
        let motorADirection = 'stop'
        let motorBDirection = 'stop'

        // X-axis: Both motors move in the same direction
        const baseSpeed = Math.abs(x)
        if (x !== 0) {
            motorASpeed = baseSpeed
            motorBSpeed = baseSpeed
            motorADirection = x >= 0 ? 'forward' : 'backward'
            motorBDirection = x >= 0 ? 'forward' : 'backward'
        }

        // Y-axis: Motors move in opposite directions for turning
        if (y !== 0) {
            const turnSpeed = Math.abs(y)
            // Adjust motor speeds by adding/subtracting turning component
            motorASpeed = Math.min(255, Math.max(0, motorASpeed + turnSpeed))
            motorBSpeed = Math.min(255, Math.max(0, motorBSpeed + turnSpeed))
            // Set opposite directions for turning
            motorADirection = y >= 0 ? 'forward' : 'backward'
            motorBDirection = y >= 0 ? 'backward' : 'forward'
        }

        // If both axes are active, combine speeds (limit to 255)
        if (x !== 0 && y !== 0) {
            motorASpeed = Math.min(255, Math.max(0, Math.abs(x) + Math.abs(y)))
            motorBSpeed = Math.min(255, Math.max(0, Math.abs(x) + Math.abs(y)))
        }

        // Pass motor values to parent component (SocketClient)
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