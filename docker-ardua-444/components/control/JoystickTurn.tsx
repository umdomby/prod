"use client"
import { useCallback, useRef, useEffect, useState } from 'react'

type JoystickProps = {
    mo: 'A' | 'B' // motor → mo
    onChange: (value: number) => void
    direction: 'forward' | 'backward' | 'stop'
    sp: number // speed → sp
    className?: string
    disabled?: boolean
}

const JoystickTurn = ({ mo, onChange, direction, sp, disabled, className }: JoystickProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const verticalKnobRef = useRef<HTMLDivElement>(null)
    const horizontalKnobRef = useRef<HTMLDivElement>(null)
    const isDraggingVertical = useRef(false)
    const isDraggingHorizontal = useRef(false)
    const touchIdVertical = useRef<number | null>(null)
    const touchIdHorizontal = useRef<number | null>(null)
    const [isLandscape, setIsLandscape] = useState(false)
    const [verticalKnobPosition, setVerticalKnobPosition] = useState(50)
    const [horizontalKnobPosition, setHorizontalKnobPosition] = useState(50)

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

    const updateVerticalValue = useCallback((clientY: number) => {
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const containerHeight = rect.height
        const y = clientY - rect.top

        // Ограничиваем движение вертикального ползунка в пределах 60% высоты (20% сверху, 80% снизу)
        const trackHeight = containerHeight * 0.6
        const trackTop = containerHeight * 0.2
        const trackBottom = containerHeight * 0.8
        const normalizedY = Math.max(trackTop, Math.min(trackBottom, y))

        // Вычисляем процент позиции внутри 60%-й полосы
        const positionPercentage = ((normalizedY - trackTop) / trackHeight) * 100
        setVerticalKnobPosition(20 + (positionPercentage * 0.6))

        // Вычисляем значение скорости от -255 до 255 (вверх - вперед, вниз - назад)
        const value = ((normalizedY - trackTop) / trackHeight) * 510 - 255
        const clampedValue = Math.max(-255, Math.min(255, value))

        // Для вертикального ползунка отправляем одинаковую скорость для обоих моторов
        onChange(clampedValue)
    }, [onChange])

    const updateHorizontalValue = useCallback((clientX: number) => {
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const containerWidth = rect.width
        const x = clientX - rect.left

        // Ограничиваем движение горизонтального ползунка в пределах 60% ширины (20% слева, 80% справа)
        const trackWidth = containerWidth * 0.6
        const trackLeft = containerWidth * 0.2
        const trackRight = containerWidth * 0.8
        const normalizedX = Math.max(trackLeft, Math.min(trackRight, x))

        // Вычисляем процент позиции внутри 60%-й полосы
        const positionPercentage = ((normalizedX - trackLeft) / trackWidth) * 100
        setHorizontalKnobPosition(20 + (positionPercentage * 0.6))

        // Вычисляем значение скорости от -255 до 255 (влево - мотор A назад, мотор B вперед; вправо - мотор A вперед, мотор B назад)
        const value = ((normalizedX - trackLeft) / trackWidth) * 510 - 255
        const clampedValue = Math.max(-255, Math.min(255, value))

        // Для горизонтального ползунка: если mo='A', то значение как есть, если mo='B', то противоположное
        onChange(mo === 'A' ? clampedValue : -clampedValue)
    }, [onChange, mo])

    const handleVerticalStart = useCallback((clientY: number) => {
        isDraggingVertical.current = true
        updateVerticalValue(clientY)
    }, [updateVerticalValue])

    const handleHorizontalStart = useCallback((clientX: number) => {
        isDraggingHorizontal.current = true
        updateHorizontalValue(clientX)
    }, [updateHorizontalValue])

    const handleVerticalMove = useCallback((clientY: number) => {
        if (isDraggingVertical.current) {
            updateVerticalValue(clientY)
        }
    }, [updateVerticalValue])

    const handleHorizontalMove = useCallback((clientX: number) => {
        if (isDraggingHorizontal.current) {
            updateHorizontalValue(clientX)
        }
    }, [updateHorizontalValue])

    const handleVerticalEnd = useCallback(() => {
        if (!isDraggingVertical.current) return
        isDraggingVertical.current = false
        touchIdVertical.current = null
        setVerticalKnobPosition(50)
        onChange(0)
    }, [onChange])

    const handleHorizontalEnd = useCallback(() => {
        if (!isDraggingHorizontal.current) return
        isDraggingHorizontal.current = false
        touchIdHorizontal.current = null
        setHorizontalKnobPosition(50)
        onChange(0)
    }, [onChange])

    const onTouchStart = useCallback(
        (e: TouchEvent) => {
            if (disabled || !containerRef.current?.contains(e.target as Node)) return
            const touch = e.changedTouches[0]

            // Определяем, к какому ползунку ближе касание
            const rect = containerRef.current!.getBoundingClientRect()
            const clientX = touch.clientX - rect.left
            const clientY = touch.clientY - rect.top
            const containerWidth = rect.width
            const containerHeight = rect.height
            const verticalKnobY = (verticalKnobPosition / 100) * containerHeight
            const horizontalKnobX = (horizontalKnobPosition / 100) * containerWidth

            const distToVertical = Math.abs(clientY - verticalKnobY)
            const distToHorizontal = Math.abs(clientX - horizontalKnobX)

            if (distToVertical <= distToHorizontal && touchIdVertical.current === null) {
                touchIdVertical.current = touch.identifier
                handleVerticalStart(touch.clientY)
            } else if (touchIdHorizontal.current === null) {
                touchIdHorizontal.current = touch.identifier
                handleHorizontalStart(touch.clientX)
            }
            e.preventDefault()
        },
        [handleVerticalStart, handleHorizontalStart, disabled, verticalKnobPosition, horizontalKnobPosition]
    )

    const onTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) return
            const verticalTouch = touchIdVertical.current !== null && Array.from(e.changedTouches).find(t => t.identifier === touchIdVertical.current)
            const horizontalTouch = touchIdHorizontal.current !== null && Array.from(e.changedTouches).find(t => t.identifier === touchIdHorizontal.current)

            if (verticalTouch) {
                handleVerticalMove(verticalTouch.clientY)
                e.preventDefault()
            }
            if (horizontalTouch) {
                handleHorizontalMove(horizontalTouch.clientX)
                e.preventDefault()
            }
        },
        [handleVerticalMove, handleHorizontalMove]
    )

    const onTouchEnd = useCallback(
        (e: TouchEvent) => {
            const verticalTouch = touchIdVertical.current !== null && Array.from(e.changedTouches).find(t => t.identifier === touchIdVertical.current)
            const horizontalTouch = touchIdHorizontal.current !== null && Array.from(e.changedTouches).find(t => t.identifier === touchIdHorizontal.current)

            if (verticalTouch) {
                handleVerticalEnd()
            }
            if (horizontalTouch) {
                handleHorizontalEnd()
            }
        },
        [handleVerticalEnd, handleHorizontalEnd]
    )

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const onMouseDown = (e: MouseEvent) => {
            if (disabled || !container.contains(e.target as Node)) return
            const rect = container.getBoundingClientRect()
            const clientX = e.clientX - rect.left
            const clientY = e.clientY - rect.top
            const containerWidth = rect.width
            const containerHeight = rect.height
            const verticalKnobY = (verticalKnobPosition / 100) * containerHeight
            const horizontalKnobX = (horizontalKnobPosition / 100) * containerWidth

            const distToVertical = Math.abs(clientY - verticalKnobY)
            const distToHorizontal = Math.abs(clientX - horizontalKnobX)

            if (distToVertical <= distToHorizontal) {
                handleVerticalStart(e.clientY)
            } else {
                handleHorizontalStart(e.clientX)
            }
            e.preventDefault()
        }

        const onMouseMove = (e: MouseEvent) => {
            if (isDraggingVertical.current) {
                handleVerticalMove(e.clientY)
                e.preventDefault()
            }
            if (isDraggingHorizontal.current) {
                handleHorizontalMove(e.clientX)
                e.preventDefault()
            }
        }

        const onMouseUp = () => {
            if (isDraggingVertical.current) {
                handleVerticalEnd()
            }
            if (isDraggingHorizontal.current) {
                handleHorizontalEnd()
            }
        }

        container.addEventListener('touchstart', onTouchStart, { passive: false })
        container.addEventListener('touchmove', onTouchMove, { passive: false })
        container.addEventListener('touchend', onTouchEnd, { passive: false })
        container.addEventListener('touchcancel', onTouchEnd, { passive: false })

        container.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        container.addEventListener('mouseleave', () => {
            handleVerticalEnd()
            handleHorizontalEnd()
        })

        return () => {
            container.removeEventListener('touchstart', onTouchStart)
            container.removeEventListener('touchmove', onTouchMove)
            container.removeEventListener('touchend', onTouchEnd)
            container.removeEventListener('touchcancel', onTouchEnd)

            container.removeEventListener('mousedown', onMouseDown)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            container.removeEventListener('mouseleave', handleVerticalEnd)
            container.removeEventListener('mouseleave', handleHorizontalEnd)
        }
    }, [handleVerticalEnd, handleHorizontalEnd, handleVerticalMove, handleHorizontalMove, handleVerticalStart, handleHorizontalStart, onTouchEnd, onTouchMove, onTouchStart, verticalKnobPosition, horizontalKnobPosition])

    return (
        <div
            ref={containerRef}
            className={`noSelect ${className}`}
            style={{
                position: 'absolute',
                width: isLandscape ? '50vw' : '90vw',
                height: isLandscape ? '50vh' : '45vh',
                top: isLandscape ? '50%' : '55%',
                left: '50%',
                transform: isLandscape ? 'translate(-50%, -50%)' : 'translate(-50%, -55%)',
                borderRadius: '0px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                touchAction: 'none',
                userSelect: 'none',
                cursor: disabled ? 'not-allowed' : 'default',
                zIndex: 1001
            }}
        >
            {/* Вертикальный трек */}
            <div style={{
                position: 'absolute',
                width: '20px',
                height: '60%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '10px'
            }} />

            {/* Горизонтальный трек */}
            <div style={{
                position: 'absolute',
                width: '60%',
                height: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '10px'
            }} />

            {/* Вертикальный ползунок */}
            <div
                ref={verticalKnobRef}
                style={{
                    position: 'absolute',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: `${verticalKnobPosition}%`,
                    marginTop: '-20px',
                    transition: isDraggingVertical.current ? 'none' : 'top 0.2s ease-out',
                    zIndex: 1002
                }}
            />

            {/* Горизонтальный ползунок */}
            <div
                ref={horizontalKnobRef}
                style={{
                    position: 'absolute',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: `${horizontalKnobPosition}%`,
                    marginLeft: '-20px',
                    transition: isDraggingHorizontal.current ? 'none' : 'left 0.2s ease-out',
                    zIndex: 1002
                }}
            />

            {/* Центральная линия для вертикального трека */}
            <div style={{
                position: 'absolute',
                width: '20px',
                height: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            }} />

            {/* Центральная линия для горизонтального трека */}
            <div style={{
                position: 'absolute',
                width: '2px',
                height: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            }} />
        </div>
    )
}

export default JoystickTurn