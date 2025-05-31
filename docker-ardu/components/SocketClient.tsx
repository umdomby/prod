"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";

type MessageType = {
    type?: string
    command?: string
    deviceId?: string
    message?: string
    params?: any
    clientId?: number
    status?: string
    timestamp?: string
    origin?: 'client' | 'esp' | 'server' | 'error'
    reason?: string
}

type LogEntry = {
    message: string
    type: 'client' | 'esp' | 'server' | 'error'
}

const Joystick = ({
                      motor,
                      onChange,
                      direction,
                      speed
                  }: {
    motor: 'A' | 'B'
    onChange: (value: number) => void
    direction: 'forward' | 'backward' | 'stop'
    speed: number
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)
    const touchId = useRef<number | null>(null)
    const motorStyles = {
        A: { bg: 'rgba(255, 87, 34, 0.2)', border: '2px solid #ff5722' },
        B: { bg: 'rgba(76, 175, 80, 0.2)', border: '2px solid #4caf50' }
    }

    const updateValue = useCallback((clientY: number) => {
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const y = clientY - rect.top
        const height = rect.height
        let value = ((height - y) / height) * 510 - 255
        value = Math.max(-255, Math.min(255, value))

        const intensity = Math.abs(value) / 255 * 0.3 + 0.2
        container.style.backgroundColor = `rgba(${
            motor === 'A' ? '255, 87, 34' : '76, 175, 80'
        }, ${intensity})`

        onChange(value)
    }, [motor, onChange])

    const handleStart = useCallback((clientY: number) => {
        isDragging.current = true
        const container = containerRef.current
        if (container) {
            container.style.transition = 'none'
        }
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

        const container = containerRef.current
        if (container) {
            container.style.transition = 'background-color 0.3s'
            container.style.backgroundColor = motorStyles[motor].bg
        }

        onChange(0) // Важно: отправляем 0 при отпускании
    }, [motor, motorStyles, onChange])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const onTouchStart = (e: TouchEvent) => {
            if (touchId.current === null) {
                const touch = e.changedTouches[0]
                touchId.current = touch.identifier
                handleStart(touch.clientY)
            }
        }

        const onTouchMove = (e: TouchEvent) => {
            if (touchId.current !== null) {
                const touch = Array.from(e.changedTouches).find(
                    t => t.identifier === touchId.current
                )
                if (touch) {
                    handleMove(touch.clientY)
                }
            }
        }

        const onTouchEnd = (e: TouchEvent) => {
            if (touchId.current !== null) {
                const touch = Array.from(e.changedTouches).find(
                    t => t.identifier === touchId.current
                )
                if (touch) {
                    handleEnd()
                }
            }
        }

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            handleStart(e.clientY)
        }

        const onMouseMove = (e: MouseEvent) => {
            e.preventDefault()
            handleMove(e.clientY)
        }

        const onMouseUp = () => {
            handleEnd()
        }

        container.addEventListener('touchstart', onTouchStart, { passive: false })
        container.addEventListener('touchmove', onTouchMove, { passive: false })
        container.addEventListener('touchend', onTouchEnd, { passive: false })
        container.addEventListener('touchcancel', onTouchEnd, { passive: false })

        container.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        container.addEventListener('mouseleave', handleEnd)

        // Добавляем глобальные обработчики для гарантированного завершения
        const handleGlobalMouseUp = () => {
            if (isDragging.current) {
                handleEnd()
            }
        }

        const handleGlobalTouchEnd = (e: TouchEvent) => {
            if (isDragging.current && touchId.current !== null) {
                const touch = Array.from(e.changedTouches).find(
                    t => t.identifier === touchId.current
                )
                if (touch) {
                    handleEnd()
                }
            }
        }

        document.addEventListener('mouseup', handleGlobalMouseUp)
        document.addEventListener('touchend', handleGlobalTouchEnd)

        return () => {
            container.removeEventListener('touchstart', onTouchStart)
            container.removeEventListener('touchmove', onTouchMove)
            container.removeEventListener('touchend', onTouchEnd)
            container.removeEventListener('touchcancel', onTouchEnd)

            container.removeEventListener('mousedown', onMouseDown)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            container.removeEventListener('mouseleave', handleEnd)

            document.removeEventListener('mouseup', handleGlobalMouseUp)
            document.removeEventListener('touchend', handleGlobalTouchEnd)
        }
    }, [handleEnd, handleMove, handleStart])

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: '150px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                touchAction: 'none',
                userSelect: 'none',
                ...motorStyles[motor]
            }}
        >
            <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '0',
                right: '0',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#333',
                zIndex: '1'
            }}>
                {direction !== 'stop' ? (
                    <span>{direction === 'forward' ? '↑' : '↓'} {speed}</span>
                ) : (
                    <span>Motor {motor}</span>
                )}
            </div>
        </div>
    )
}

export default function WebsocketController() {
    const [log, setLog] = useState<LogEntry[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [isIdentified, setIsIdentified] = useState(false)
    const [deviceId, setDeviceId] = useState('123')
    const [inputDeviceId, setInputDeviceId] = useState('123')
    const [espConnected, setEspConnected] = useState(false)
    const [controlVisible, setControlVisible] = useState(false)
    const [motorASpeed, setMotorASpeed] = useState(0)
    const [motorBSpeed, setMotorBSpeed] = useState(0)
    const [motorADirection, setMotorADirection] = useState<'forward' | 'backward' | 'stop'>('stop')
    const [motorBDirection, setMotorBDirection] = useState<'forward' | 'backward' | 'stop'>('stop')
    const [isLandscape, setIsLandscape] = useState(false)
    const reconnectAttemptRef = useRef(0);
    const socketRef = useRef<WebSocket | null>(null)
    const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastMotorACommandRef = useRef<{speed: number, direction: 'forward' | 'backward' | 'stop'} | null>(null)
    const lastMotorBCommandRef = useRef<{speed: number, direction: 'forward' | 'backward' | 'stop'} | null>(null)
    const motorAThrottleRef = useRef<NodeJS.Timeout | null>(null)
    const motorBThrottleRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const checkOrientation = () => {
            setIsLandscape(window.innerWidth > window.innerHeight)
        }

        checkOrientation()
        window.addEventListener('resize', checkOrientation)
        return () => window.removeEventListener('resize', checkOrientation)
    }, [])

    const addLog = useCallback((msg: string, type: LogEntry['type']) => {
        setLog(prev => [...prev.slice(-100), {message: `${new Date().toLocaleTimeString()}: ${msg}`, type}])
    }, [])

    const sendCommand = useCallback((command: string, params?: any) => {
        if (!isIdentified) {
            addLog("Cannot send command: not identified", 'error')
            return
        }

        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const msg = JSON.stringify({
                command,
                params,
                deviceId,
                timestamp: Date.now(),
                expectAck: true
            })

            socketRef.current.send(msg)
            addLog(`Sent command to ${deviceId}: ${command}`, 'client')

            if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current)
            commandTimeoutRef.current = setTimeout(() => {
                if (espConnected) {
                    addLog(`Command ${command} not acknowledged by ESP`, 'error')
                    setEspConnected(false)
                }
            }, 5000)
        } else {
            addLog("WebSocket not ready!", 'error')
        }
    }, [addLog, deviceId, isIdentified, espConnected])

    const createMotorHandler = useCallback((motor: 'A' | 'B') => {
        const lastCommandRef = motor === 'A' ? lastMotorACommandRef : lastMotorBCommandRef
        const throttleRef = motor === 'A' ? motorAThrottleRef : motorBThrottleRef
        const setSpeed = motor === 'A' ? setMotorASpeed : setMotorBSpeed
        const setDirection = motor === 'A' ? setMotorADirection : setMotorBDirection

        return (value: number) => {
            // Определяем направление и скорость
            let direction: 'forward' | 'backward' | 'stop' = 'stop'
            let speed = 0

            if (value > 0) {
                direction = 'forward'
                speed = value
            } else if (value < 0) {
                direction = 'backward'
                speed = -value
            }

            // Обновляем UI сразу
            setSpeed(speed)
            setDirection(direction)

            // Если команда не изменилась - ничего не делаем
            const currentCommand = { speed, direction }
            if (JSON.stringify(lastCommandRef.current) === JSON.stringify(currentCommand)) {
                return
            }

            // Запоминаем последнюю команду
            lastCommandRef.current = currentCommand

            // Отменяем предыдущий таймер
            if (throttleRef.current) {
                clearTimeout(throttleRef.current)
            }

            // Если скорость 0 (отпустили джойстик) - отправляем команду остановки немедленно
            if (speed === 0) {
                sendCommand("set_speed", { motor, speed: 0 })
                return
            }

            // Для движения - отправляем с задержкой (но гарантируем отправку последней команды)
            throttleRef.current = setTimeout(() => {
                sendCommand("set_speed", { motor, speed })
                sendCommand(direction === 'forward'
                    ? `motor_${motor.toLowerCase()}_forward`
                    : `motor_${motor.toLowerCase()}_backward`)
            }, 40)
        }
    }, [sendCommand])

    const handleMotorAControl = createMotorHandler('A')
    const handleMotorBControl = createMotorHandler('B')

    const emergencyStop = useCallback(() => {
        // Немедленная остановка без задержек
        sendCommand("set_speed", { motor: 'A', speed: 0 })
        sendCommand("set_speed", { motor: 'B', speed: 0 })
        setMotorASpeed(0)
        setMotorBSpeed(0)
        setMotorADirection('stop')
        setMotorBDirection('stop')

        // Очищаем все pending команды
        if (motorAThrottleRef.current) clearTimeout(motorAThrottleRef.current)
        if (motorBThrottleRef.current) clearTimeout(motorBThrottleRef.current)
    }, [sendCommand])

    const connectWebSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.close();
        }

        reconnectAttemptRef.current = 0;
        const ws = new WebSocket('wss://ardu.site/ws');

        ws.onopen = () => {
            setIsConnected(true);
            reconnectAttemptRef.current = 0;
            addLog("Connected to WebSocket server", 'server');

            ws.send(JSON.stringify({
                type: 'client_type',
                clientType: 'browser'
            }));

            ws.send(JSON.stringify({
                type: 'identify',
                deviceId: inputDeviceId
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data: MessageType = JSON.parse(event.data);
                console.log("Received message:", data);

                if (data.type === "system") {
                    if (data.status === "connected") {
                        setIsIdentified(true);
                        setDeviceId(inputDeviceId);
                    }
                    addLog(`System: ${data.message}`, 'server');
                }
                else if (data.type === "error") {
                    addLog(`Error: ${data.message}`, 'error');
                    setIsIdentified(false);
                }
                else if (data.type === "log") {
                    addLog(`ESP: ${data.message}`, 'esp');
                    if (data.message && data.message.includes("Heartbeat")) {
                        setEspConnected(true);
                    }
                }
                else if (data.type === "esp_status") {
                    console.log(`Received ESP status: ${data.status}`);
                    setEspConnected(data.status === "connected");
                    addLog(`ESP ${data.status === "connected" ? "✅ Connected" : "❌ Disconnected"}${data.reason ? ` (${data.reason})` : ''}`,
                        data.status === "connected" ? 'esp' : 'error');
                }
                else if (data.type === "command_ack") {
                    if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);
                    addLog(`ESP executed command: ${data.command}`, 'esp');
                }
                else if (data.type === "command_status") {
                    addLog(`Command ${data.command} delivered to ESP`, 'server');
                }
            } catch (error) {
                console.error("Error processing message:", error);
                addLog(`Received invalid message: ${event.data}`, 'error');
            }
        };

        ws.onclose = (event) => {
            setIsConnected(false);
            setIsIdentified(false);
            setEspConnected(false);
            addLog(`Disconnected from server${event.reason ? `: ${event.reason}` : ''}`, 'server');
        };

        ws.onerror = (error) => {
            addLog(`WebSocket error: ${error.type}`, 'error');
        };

        socketRef.current = ws;
    }, [addLog, inputDeviceId]);

    const disconnectWebSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
            setIsConnected(false);
            setIsIdentified(false);
            setEspConnected(false);
            addLog("Disconnected manually", 'server');
            reconnectAttemptRef.current = 5;
        }
    }, [addLog]);

    useEffect(() => {
        return () => {
            if (socketRef.current) socketRef.current.close()
            if (motorAThrottleRef.current) clearTimeout(motorAThrottleRef.current)
            if (motorBThrottleRef.current) clearTimeout(motorBThrottleRef.current)
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            if (isConnected && isIdentified) sendCommand("heartbeat2")
        }, 1000)
        return () => clearInterval(interval)
    }, [isConnected, isIdentified, sendCommand])

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'Arial'
        }}>
            <h1>ESP8266 WebSocket Control</h1>

            <div style={{
                margin: '10px 0',
                padding: '10px',
                background: isConnected ? (isIdentified ? (espConnected ? '#e6f7e6' : '#fff3e0') : '#fff3e0') : '#ffebee',
                border: `1px solid ${isConnected ? (isIdentified ? (espConnected ? '#4caf50' : '#ffa000') : '#ffa000') : '#f44336'}`,
                borderRadius: '4px'
            }}>
                Status: {isConnected ? (isIdentified ? `✅ Connected & Identified (ESP: ${espConnected ? '✅' : '❌'})` : "🟡 Connected (Pending)") : "❌ Disconnected"}
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                margin: '15px 0',
                padding: '15px',
                background: '#f5f5f5',
                borderRadius: '8px'
            }}>
                <input
                    type="text"
                    placeholder="Device ID"
                    value={inputDeviceId}
                    onChange={(e) => setInputDeviceId(e.target.value)}
                    disabled={isConnected}
                    style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={connectWebSocket}
                        disabled={isConnected}
                        style={{
                            padding: '10px 15px',
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        Connect
                    </button>
                    <button
                        onClick={disconnectWebSocket}
                        disabled={!isConnected}
                        style={{
                            padding: '10px 15px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        Disconnect
                    </button>
                    <button
                        onClick={emergencyStop}
                        disabled={!isConnected || !isIdentified}
                        style={{
                            padding: '10px 15px',
                            background: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        Emergency Stop
                    </button>
                </div>
            </div>

            <Dialog open={controlVisible} onOpenChange={setControlVisible}>
                <DialogTrigger asChild>
                    <Button onClick={() => setControlVisible(!controlVisible)}>
                        {controlVisible ? "Hide Controls" : "Show Controls"}
                    </Button>
                </DialogTrigger>
                <DialogContent style={{
                    width: '100%',
                    height: '80vh',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'stretch',
                    gap: 0
                }}>
                    <DialogHeader>
                        <DialogTitle></DialogTitle>
                    </DialogHeader>

                    <DialogClose className="absolute left-1/2 -translate-x-1/2">
                        X
                    </DialogClose>

                    {/* Левый сенсор (A) */}
                    <div className="flex w-full justify-between">
                        <div className="w-[calc(50%-10px)] h-[50%] mt-[12%] landscape:h-[70%]">
                            <Joystick
                                motor="A"
                                onChange={(value) => {
                                    handleMotorAControl(value)
                                }}
                                direction={motorADirection}
                                speed={motorASpeed}
                            />
                        </div>

                        {/* Правый сенсор (B) */}
                        <div className="w-[calc(50%-10px)] h-[50%] mt-[12%] landscape:h-[70%]">
                            <Joystick
                                motor="B"
                                onChange={(value) => {
                                    handleMotorBControl(value)
                                }}
                                direction={motorBDirection}
                                speed={motorBSpeed}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
                marginTop: '20px'
            }}>
                <h3 style={{ padding: '10px', background: '#eee', margin: 0 }}>Event Log</h3>
                <div style={{
                    height: '300px',
                    overflowY: 'auto',
                    padding: '10px',
                    background: '#fafafa'
                }}>
                    {log.slice().reverse().map((entry, index) => (
                        <div key={index} style={{
                            margin: '5px 0',
                            padding: '5px',
                            borderBottom: '1px solid #eee',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            color:
                                entry.type === 'client' ? '#2196F3' :
                                    entry.type === 'esp' ? '#4CAF50' :
                                        entry.type === 'server' ? '#9C27B0' : '#F44336',
                            fontWeight: entry.type === 'error' ? 'bold' : 'normal'
                        }}>
                            {entry.message}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}