"use client"
import { useCallback, useRef, useEffect, useState } from 'react'

type JoystickProps = {
    mo: 'A' | 'B' // motor → mo
    onChange: (value: number) => void
    direction: 'forward' | 'backward' | 'stop'
    sp: number // speed → sp
    className?: string
}

const Joystick = ({ mo, onChange, direction, sp, className }: JoystickProps) => { // motor → mo, speed → sp
    const containerRef = useRef<HTMLDivElement>(null)
    const knobRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)
    const touchId = useRef<number | null>(null)
    const [isLandscape, setIsLandscape] = useState(false)
    const [knobPosition, setKnobPosition] = useState(50)

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

    const motorStyles = {
        A: { border: '1px solid #ffffff', left: '10px' },
        B: { border: '1px solid #ffffff', right: '10px' }
    }

    const updateValue = useCallback((clientY: number) => {
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const containerHeight = rect.height
        const y = clientY - rect.top
        const normalizedY = Math.max(0, Math.min(containerHeight, y))

        const positionPercentage = (1 - (normalizedY / containerHeight)) * 100
        setKnobPosition(positionPercentage)

        let value = ((containerHeight - normalizedY) / containerHeight) * 510 - 255
        value = Math.max(-255, Math.min(255, value))

        onChange(value)
    }, [onChange])

    const handleStart = useCallback((clientY: number) => {
        isDragging.current = true
        updateValue(clientY)
    }, [updateValue])

    const handleMove = useCallback((clientY: number) => {
        if (isDragging.current) {
            updateValue(clientY)
        }
    }, [updateValue])

    const handleEnd = useCallback(() => {
        if (!isDragging.current) return
        isDragging.current = false
        touchId.current = null
        setKnobPosition(50)
        onChange(0)
    }, [onChange])

    const onTouchStart = useCallback((e: TouchEvent) => {
        if (touchId.current === null && containerRef.current?.contains(e.target as Node)) {
            const touch = e.changedTouches[0]
            touchId.current = touch.identifier
            handleStart(touch.clientY)
            e.preventDefault()
        }
    }, [handleStart])

    const onTouchMove = useCallback((e: TouchEvent) => {
        if (touchId.current !== null && containerRef.current?.contains(e.target as Node)) {
            const touch = Array.from(e.changedTouches).find(
                t => t.identifier === touchId.current
            )
            if (touch) {
                handleMove(touch.clientY)
                e.preventDefault()
            }
        }
    }, [handleMove])

    const onTouchEnd = useCallback((e: TouchEvent) => {
        if (touchId.current !== null) {
            const touch = Array.from(e.changedTouches).find(
                t => t.identifier === touchId.current
            )
            if (touch) {
                handleEnd()
            }
        }
    }, [handleEnd])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const onMouseDown = (e: MouseEvent) => {
            if (container.contains(e.target as Node)) {
                handleStart(e.clientY)
                e.preventDefault()
            }
        }

        const onMouseMove = (e: MouseEvent) => {
            if (isDragging.current) {
                handleMove(e.clientY)
                e.preventDefault()
            }
        }

        const onMouseUp = () => {
            if (isDragging.current) {
                handleEnd()
            }
        }

        container.addEventListener('touchstart', onTouchStart, { passive: false })
        container.addEventListener('touchmove', onTouchMove, { passive: false })
        container.addEventListener('touchend', onTouchEnd, { passive: false })
        container.addEventListener('touchcancel', onTouchEnd, { passive: false })

        container.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        container.addEventListener('mouseleave', handleEnd)

        return () => {
            container.removeEventListener('touchstart', onTouchStart)
            container.removeEventListener('touchmove', onTouchMove)
            container.removeEventListener('touchend', onTouchEnd)
            container.removeEventListener('touchcancel', onTouchEnd)

            container.removeEventListener('mousedown', onMouseDown)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            container.removeEventListener('mouseleave', handleEnd)
        }
    }, [handleEnd, handleMove, handleStart, onTouchEnd, onTouchMove, onTouchStart])

    return (
        <div
            ref={containerRef}
            className={`noSelect ${className}`}
            style={{
                position: 'absolute',
                width: '80px',
                height: isLandscape ? '77vh' : '45vh',
                top: isLandscape ? '5%' : '55%',
                transform: isLandscape ? 'translateY(-5%)' : 'translateY(-55%)',
                bottom: '0',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                touchAction: 'none',
                userSelect: 'none',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                ...motorStyles[mo], // motor → mo
                zIndex: 1001
            }}
        >
            <div style={{
                position: 'absolute',
                width: '20px',
                height: '80%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '10px'
            }} />

            <div
                ref={knobRef}
                style={{
                    position: 'absolute',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: `${knobPosition}%`,
                    marginTop: '-20px',
                    transition: isDragging.current ? 'none' : 'top 0.2s ease-out',
                    pointerEvents: 'none'
                }}
            />

            <div style={{
                position: 'absolute',
                width: '20px',
                height: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            }} />
        </div>
    )
}

export default Joystick