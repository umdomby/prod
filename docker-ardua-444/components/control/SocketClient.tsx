// file: components/control/SocketClient.tsx
"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Power } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Joystick from '@/components/control/Joystick'
import { useServo } from '@/components/ServoContext';

type MessageType = {
    ty?: string
    sp?: string
    co?: string
    de?: string
    me?: string
    mo?: string
    pa?: any
    clientId?: number
    st?: string
    ts?: string
    or?: 'client' | 'esp' | 'server' | 'error'
    re?: string
    b1?: string
    b2?: string
    sp1?: string
    sp2?: string
}

type LogEntry = {
    me: string
    ty: 'client' | 'esp' | 'server' | 'error' | 'success'
}

// Добавляем новый пропс onConnectionStatusChange
interface SocketClientProps {
    onConnectionStatusChange?: (isFullyConnected: boolean) => void;
}

export default function SocketClient({ onConnectionStatusChange }: SocketClientProps) {
    const {
        servoAngle,
        servo2Angle,
        servo1MinAngle,
        servo1MaxAngle,
        servo2MinAngle,
        servo2MaxAngle,
        setServoAngle,
        setServo2Angle,
        setServo1MinAngle, // Добавляем
        setServo1MaxAngle, // Добавляем
        setServo2MinAngle, // Добавляем
        setServo2MaxAngle, // Добавляем
    } = useServo();

    const [log, setLog] = useState<LogEntry[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [isIdentified, setIsIdentified] = useState(false)
    const [de, setDe] = useState('123')
    const [inputDe, setInputDe] = useState('123')
    const [newDe, setNewDe] = useState('')
    const [deviceList, setDeviceList] = useState<string[]>(['123'])
    const [espConnected, setEspConnected] = useState(false)
    const [controlVisible, setControlVisible] = useState(false)
    const [logVisible, setLogVisible] = useState(false)
    const [motorASpeed, setMotorASpeed] = useState(0)
    const [motorBSpeed, setMotorBSpeed] = useState(0)
    const [motorADirection, setMotorADirection] = useState<'forward' | 'backward' | 'stop'>('stop')
    const [motorBDirection, setMotorBDirection] = useState<'forward' | 'backward' | 'stop'>('stop')
    const [autoReconnect, setAutoReconnect] = useState(false)
    const [autoConnect, setAutoConnect] = useState(false)
    const [autoShowControls, setAutoShowControls] = useState(false)
    const [preventDeletion, setPreventDeletion] = useState(false)
    const [isLandscape, setIsLandscape] = useState(false)
    const [button1State, setButton1State] = useState(0)
    const [button2State, setButton2State] = useState(0)
    const [activeTab, setActiveTab] = useState<'webrtc' | 'esp' | 'controls' | null>('esp');

    const lastHeartbeatLogTime = useRef<number>(0);
    const reconnectAttemptRef = useRef(0)
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)
    const socketRef = useRef<WebSocket | null>(null)
    const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastMotorACommandRef = useRef<{ sp: number, direction: 'forward' | 'backward' | 'stop' } | null>(null)
    const lastMotorBCommandRef = useRef<{ sp: number, direction: 'forward' | 'backward' | 'stop' } | null>(null)
    const motorAThrottleRef = useRef<NodeJS.Timeout | null>(null)
    const motorBThrottleRef = useRef<NodeJS.Timeout | null>(null)
    const currentDeRef = useRef(inputDe)


    // Загрузка сохранённых настроек
    useEffect(() => {
        const savedPreventDeletion = localStorage.getItem('preventDeletion');
        if (savedPreventDeletion) {
            setPreventDeletion(savedPreventDeletion === 'true');
        }
        const savedAutoReconnect = localStorage.getItem('autoReconnect');
        if (savedAutoReconnect) {
            setAutoReconnect(savedAutoReconnect === 'true');
        }
        const savedAutoConnect = localStorage.getItem('autoConnect');
        if (savedAutoConnect) {
            setAutoConnect(savedAutoConnect === 'true');
        }
        const savedAutoShowControls = localStorage.getItem('autoShowControls');
        if (savedAutoShowControls) {
            setAutoShowControls(savedAutoShowControls === 'true');
        }
        const savedDevices = localStorage.getItem('espDeviceList');
        if (savedDevices) {
            const devices = JSON.parse(savedDevices);
            setDeviceList(devices);
            if (devices.length > 0) {
                const savedDe = localStorage.getItem('selectedDeviceId');
                const initialDe = savedDe && devices.includes(savedDe) ? savedDe : devices[0];
                setInputDe(initialDe);
                setDe(initialDe);
                currentDeRef.current = initialDe;
            }
        }
        // Загрузка диапазонов сервоприводов (используем функции из useServo)
        const savedServo1MinAngle = localStorage.getItem('servo1MinAngle');
        if (savedServo1MinAngle) {
            setServo1MinAngle(Number(savedServo1MinAngle));
        }
        const savedServo1MaxAngle = localStorage.getItem('servo1MaxAngle');
        if (savedServo1MaxAngle) {
            setServo1MaxAngle(Number(savedServo1MaxAngle));
        }
        const savedServo2MinAngle = localStorage.getItem('servo2MinAngle');
        if (savedServo2MinAngle) {
            setServo2MinAngle(Number(savedServo2MinAngle));
        }
        const savedServo2MaxAngle = localStorage.getItem('servo2MaxAngle');
        if (savedServo2MaxAngle) {
            setServo2MaxAngle(Number(savedServo2MaxAngle));
        }
    }, [setServo1MinAngle, setServo1MaxAngle, setServo2MinAngle, setServo2MaxAngle]);

    useEffect(() => {
        const checkOrientation = () => {
            if (window.screen.orientation) {
                setIsLandscape(window.screen.orientation.type.includes('landscape'))
            } else {
                setIsLandscape(window.innerWidth > window.innerHeight)
            }
        }

        checkOrientation()

        if (window.screen.orientation) {
            window.screen.orientation.addEventListener('change', checkOrientation)
        } else {
            window.addEventListener('resize', checkOrientation)
        }

        return () => {
            if (window.screen.orientation) {
                window.screen.orientation.removeEventListener('change', checkOrientation)
            } else {
                window.removeEventListener('resize', checkOrientation)
            }
        }
    }, [])

    useEffect(() => {
        currentDeRef.current = inputDe
    }, [inputDe])

    // Уведомляем родительский компонент об изменении статуса подключения
    useEffect(() => {
        const isFullyConnected = isConnected && isIdentified && espConnected;
        onConnectionStatusChange?.(isFullyConnected);
    }, [isConnected, isIdentified, espConnected, onConnectionStatusChange]);

    useEffect(() => {
        // Показываем джойстики автоматически, если autoShowControls === true и статус Connected
        if (autoShowControls && isConnected && isIdentified && espConnected) {
            setControlVisible(true)
            setActiveTab(null)
        }
    }, [autoShowControls, isConnected, isIdentified, espConnected])

    const togglePreventDeletion = useCallback((checked: boolean) => {
        setPreventDeletion(checked)
        localStorage.setItem('preventDeletion', checked.toString())
    }, [])

    const toggleAutoShowControls = useCallback((checked: boolean) => {
        setAutoShowControls(checked)
        localStorage.setItem('autoShowControls', checked.toString())
        if (!checked) {
            setControlVisible(false)
            setActiveTab('esp')
        }
    }, [])

    const saveNewDe = useCallback(() => {
        if (newDe && !deviceList.includes(newDe)) {
            const updatedList = [...deviceList, newDe]
            setDeviceList(updatedList)
            localStorage.setItem('espDeviceList', JSON.stringify(updatedList))
            setInputDe(newDe)
            setNewDe('')
            currentDeRef.current = newDe
        }
    }, [newDe, deviceList])

    const addLog = useCallback((msg: string, ty: LogEntry['ty']) => {
        setLog(prev => [...prev.slice(-100), { me: `${new Date().toLocaleTimeString()}: ${msg}`, ty }])
    }, [])

    const cleanupWebSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.onopen = null
            socketRef.current.onclose = null
            socketRef.current.onmessage = null
            socketRef.current.onerror = null
            if (socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.close()
            }
            socketRef.current = null
        }
    }, [])

    const connectWebSocket = useCallback((deToConnect: string) => {
        cleanupWebSocket()

        reconnectAttemptRef.current = 0
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current)
            reconnectTimerRef.current = null
        }

        const ws = new WebSocket(process.env.WEBSOCKET_URL_WSAR || 'wss://ardua.site:444/wsar')

        ws.onopen = () => {
            setIsConnected(true)
            reconnectAttemptRef.current = 0
            addLog("Connected to WebSocket server", 'server')

            ws.send(JSON.stringify({
                ty: "clt",
                ct: "browser"
            }))

            ws.send(JSON.stringify({
                ty: "idn",
                de: deToConnect
            }))

            // Исправляем пробел в команде GET_RELAYS
            ws.send(JSON.stringify({
                co: "GET_RELAYS",
                de: deToConnect,
                ts: Date.now()
            }))
        }

        ws.onmessage = (event) => {
            try {
                const data: MessageType = JSON.parse(event.data);
                console.log('Received message:', data);

                if (data.ty === 'ack') {
                    if (data.co === 'RLY' && data.pa) {
                        if (data.pa.pin === 'D0') {
                            setButton1State(data.pa.state === 'on' ? 1 : 0);
                            addLog(`Реле 1 (D0) ${data.pa.state === 'on' ? 'включено' : 'выключено'}`, 'esp');
                        } else if (data.pa.pin === '3') {
                            setButton2State(data.pa.state === 'on' ? 1 : 0);
                            addLog(`Реле 2 (3) ${data.pa.state === 'on' ? 'включено' : 'выключено'}`, 'esp');
                        }
                    } else if (data.co === 'SPD' && data.sp !== undefined) {
                        addLog(`Speed set: ${data.sp} for motor ${data.mo || 'unknown'}`, 'esp');
                    } else {
                        addLog(`Command ${data.co} acknowledged`, 'esp');
                    }
                }

                if (data.ty === 'sys') {
                    if (data.st === 'con') {
                        setIsIdentified(true);
                        setDe(deToConnect);
                        setEspConnected(true);
                    }
                    addLog(`System: ${data.me}`, 'server');
                } else if (data.ty === 'err') {
                    addLog(`Error: ${data.me}`, 'error');
                    setIsIdentified(false);
                } else if (data.ty === 'log') {
                    if (data.me === 'Heartbeat - OK' && Date.now() - lastHeartbeatLogTime.current < 1000) {
                        return;
                    }
                    if (data.me === 'Heartbeat - OK') {
                        lastHeartbeatLogTime.current = Date.now();
                    }
                    addLog(`ESP: ${data.me}`, 'esp');
                    if (data.b1 !== undefined) {
                        setButton1State(data.b1 === 'on' ? 1 : 0);
                        addLog(`Реле 1 (D0): ${data.b1 === 'on' ? 'включено' : 'выключено'}`, 'esp');
                    }
                    if (data.b2 !== undefined) {
                        setButton2State(data.b2 === 'on' ? 1 : 0);
                        addLog(`Реле 2 (3): ${data.b2 === 'on' ? 'включено' : 'выключено'}`, 'esp');
                    }
                    if (data.sp1 !== undefined) {
                        setServoAngle(Number(data.sp1));
                        addLog(`Servo 1 angle: ${data.sp1}°`, 'esp');
                    }
                    if (data.sp2 !== undefined) {
                        setServo2Angle(Number(data.sp2));
                        addLog(`Servo 2 angle: ${data.sp2}°`, 'esp');
                    }
                } else if (data.ty === 'est') {
                    console.log(`Received ESP status: ${data.st}`);
                    setEspConnected(data.st === 'con');
                    addLog(`ESP ${data.st === 'con' ? '✅ Connected' : '❌ Disconnected'}`, 'error');
                } else if (data.ty === 'cst') {
                    addLog(`Command ${data.co} delivered`, 'client');
                }
            } catch (error) {
                console.error('Error processing message:', error);
                addLog(`Received message: ${event.data}`, 'error');
            }
        };

        ws.onclose = (event) => {
            setIsConnected(false)
            setIsIdentified(false)
            setEspConnected(false)
            addLog(`Disconnected from server${event.reason ? `: ${event.reason}` : ''}`, 'server')

            if (reconnectAttemptRef.current < 5) {
                reconnectAttemptRef.current += 1
                const delay = Math.min(5000, reconnectAttemptRef.current * 1000)
                addLog(`Attempting to reconnect in ${delay / 1000} seconds... (attempt ${reconnectAttemptRef.current})`, 'server')

                reconnectTimerRef.current = setTimeout(() => {
                    connectWebSocket(currentDeRef.current)
                }, delay)
            } else {
                addLog("Max reconnection attempts reached", 'error')
            }
        }

        ws.onerror = (error) => {
            addLog(`WebSocket error: ${error.type}`, 'error')
        }

        socketRef.current = ws
    }, [addLog, cleanupWebSocket])

    useEffect(() => {
        if (autoConnect && !isConnected) {
            connectWebSocket(currentDeRef.current)
        }
    }, [autoConnect, connectWebSocket, isConnected])

    const handleAutoConnectChange = useCallback((checked: boolean) => {
        setAutoConnect(checked)
        localStorage.setItem('autoConnect', checked.toString())
    }, [])

    const disconnectWebSocket = useCallback(() => {
        return new Promise<void>((resolve) => {
            cleanupWebSocket()
            setIsConnected(false)
            setIsIdentified(false)
            setEspConnected(false)
            addLog("Disconnected manually", 'server')
            reconnectAttemptRef.current = 5

            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current)
                reconnectTimerRef.current = null
            }
            resolve()
        })
    }, [addLog, cleanupWebSocket])

    const handleDeviceChange = useCallback(async (value: string) => {
        setInputDe(value)
        currentDeRef.current = value
        localStorage.setItem('selectedDeviceId', value)

        if (autoReconnect) {
            await disconnectWebSocket()
            connectWebSocket(value)
        }
    }, [autoReconnect, disconnectWebSocket, connectWebSocket])

    const toggleAutoReconnect = useCallback((checked: boolean) => {
        setAutoReconnect(checked)
        localStorage.setItem('autoReconnect', checked.toString())
    }, [])

    const sendCommand = useCallback((co: string, pa?: any) => {
        if (!isIdentified) {
            addLog("Cannot send co: not identified", 'error')
            return
        }

        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const msg = JSON.stringify({
                co,
                pa,
                de,
                ts: Date.now(),
                expectAck: true
            })

            socketRef.current.send(msg)
            addLog(`Sent co to ${de}: ${co}`, 'client')

            if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current)
            commandTimeoutRef.current = setTimeout(() => {
                if (espConnected) {
                    addLog(`Command ${co} not acknowledged by ESP`, 'error')
                    setEspConnected(false)
                }
            }, 5000)
        } else {
            addLog("WebSocket not ready!", 'error')
        }
    }, [addLog, de, isIdentified, espConnected])

    const createMotorHandler = useCallback((mo: 'A' | 'B') => {
        const lastCommandRef = mo === 'A' ? lastMotorACommandRef : lastMotorBCommandRef
        const throttleRef = mo === 'A' ? motorAThrottleRef : motorBThrottleRef
        const setSpeed = mo === 'A' ? setMotorASpeed : setMotorBSpeed
        const setDirection = mo === 'A' ? setMotorADirection : setMotorBDirection

        return (value: number) => {
            let direction: 'forward' | 'backward' | 'stop' = 'stop'
            let sp = 0

            if (value > 0) {
                direction = 'forward'
                sp = value
            } else if (value < 0) {
                direction = 'backward'
                sp = -value
            }

            setSpeed(sp)
            setDirection(direction)

            const currentCommand = { sp, direction }
            if (JSON.stringify(lastCommandRef.current) === JSON.stringify(currentCommand)) {
                return
            }

            lastCommandRef.current = currentCommand

            if (sp === 0) {
                if (throttleRef.current) {
                    clearTimeout(throttleRef.current)
                    throttleRef.current = null
                }
                sendCommand("SPD", { mo, sp: 0 })
                sendCommand(mo === 'A' ? "MSA" : "MSB")
                return
            }

            if (throttleRef.current) {
                clearTimeout(throttleRef.current)
            }

            throttleRef.current = setTimeout(() => {
                sendCommand("SPD", { mo, sp })
                sendCommand(direction === 'forward'
                    ? `MF${mo}`
                    : `MR${mo}`)
            }, 40)
        }
    }, [sendCommand])

    const adjustServo = useCallback(
        (servoId: '1' | '2', delta: number) => {
            const currentAngle = servoId === '1' ? servoAngle : servo2Angle;
            const minAngle = servoId === '1' ? servo1MinAngle : servo2MinAngle;
            const maxAngle = servoId === '1' ? servo1MaxAngle : servo2MaxAngle;

            const newAngle = Math.max(minAngle, Math.min(maxAngle, currentAngle + delta));

            if (newAngle === currentAngle) {
                addLog(`Servo ${servoId} angle not changed: within range ${minAngle}-${maxAngle}`, 'error');
                return;
            }

            if (servoId === '1') {
                setServoAngle(newAngle);
                sendCommand('SSR', { an: newAngle });
            } else {
                setServo2Angle(newAngle);
                sendCommand('SSR2', { an: newAngle });
            }
        },
        [servoAngle, servo2Angle, servo1MinAngle, servo1MaxAngle, servo2MinAngle, servo2MaxAngle, setServoAngle, setServo2Angle, sendCommand, addLog]
    );


    const handleServo1MinAngleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= servo1MaxAngle) {
            setServo1MinAngle(value);
            localStorage.setItem('servo1MinAngle', value.toString());
        }
    }, [servo1MaxAngle]);

    const handleMotorAControl = createMotorHandler('A')
    const handleMotorBControl = createMotorHandler('B')

    const emergencyStop = useCallback(() => {
        sendCommand("SPD", { mo: 'A', sp: 0 })
        sendCommand("SPD", { mo: 'B', sp: 0 })
        setMotorASpeed(0)
        setMotorBSpeed(0)
        setMotorADirection('stop')
        setMotorBDirection('stop')

        if (motorAThrottleRef.current) clearTimeout(motorAThrottleRef.current)
        if (motorBThrottleRef.current) clearTimeout(motorBThrottleRef.current)
    }, [sendCommand])

    useEffect(() => {
        return () => {
            cleanupWebSocket()
            if (motorAThrottleRef.current) clearTimeout(motorAThrottleRef.current)
            if (motorBThrottleRef.current) clearTimeout(motorBThrottleRef.current)
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
        }
    }, [cleanupWebSocket])

    useEffect(() => {
        const interval = setInterval(() => {
            if (isConnected && isIdentified) sendCommand("HBT")
        }, 1000)
        return () => clearInterval(interval)
    }, [isConnected, isIdentified, sendCommand])

    const handleOpenControls = () => {
        setControlVisible(true)
        setActiveTab(null)
    }

    const handleCloseControls = () => {
        setControlVisible(false)
        setActiveTab('esp')
    }

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-3rem)] p-4 bg-transparent overflow-hidden">
            {activeTab === 'esp' && (
                <div
                    className="w-full max-w-md space-y-2 bg-transparent rounded-lg p-2 sm:p-2 border border-gray-200 backdrop-blur-sm"
                    style={{ maxHeight: '90vh', overflowY: 'auto' }}
                >
                    <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                                isConnected
                                    ? (isIdentified
                                        ? (espConnected ? 'bg-green-500' : 'bg-yellow-500')
                                        : 'bg-yellow-500')
                                    : 'bg-red-500'
                            }`}></div>
                            <span className="text-xs sm:text-sm font-medium text-gray-600">
                                {isConnected
                                    ? (isIdentified
                                        ? (espConnected ? 'Connected' : 'Waiting for ESP')
                                        : 'Connecting...')
                                    : 'Disconnected'}
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={handleOpenControls}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-8 sm:h-10 text-xs sm:text-sm"
                    >
                        Controls
                    </Button>

                    <div className="flex space-x-2">
                        <Select
                            value={inputDe}
                            onValueChange={handleDeviceChange}
                            disabled={isConnected && !autoReconnect}
                        >
                            <SelectTrigger className="flex-1 bg-transparent h-8 sm:h-10">
                                <SelectValue placeholder="Select device" />
                            </SelectTrigger>
                            <SelectContent className="bg-transparent backdrop-blur-sm border border-gray-200">
                                {deviceList.map(id => (
                                    <SelectItem key={id} value={id}
                                                className="hover:bg-gray-100/50 text-xs sm:text-sm">{id}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => {
                                if (!preventDeletion && confirm("Delete ?")) {
                                    const defaultDevice = '123'
                                    setDeviceList([defaultDevice])
                                    setInputDe(defaultDevice)
                                    localStorage.setItem('espDeviceList', JSON.stringify([defaultDevice]))
                                }
                            }}
                            disabled={preventDeletion}
                            className="bg-red-600 hover:bg-red-700 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
                        >
                            Del
                        </Button>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                        <Label className="block text-xs sm:text-sm font-medium text-gray-700">Add New Device</Label>
                        <div className="flex space-x-2">
                            <Input
                                value={newDe}
                                onChange={(e) => setNewDe(e.target.value)}
                                placeholder="Enter new device ID"
                                className="flex-1 bg-transparent h-8 sm:h-10 text-xs sm:text-sm"
                            />
                            <Button
                                onClick={saveNewDe}
                                disabled={!newDe}
                                className="bg-blue-600 hover:bg-blue-700 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <Button
                            onClick={() => connectWebSocket(currentDeRef.current)}
                            disabled={isConnected}
                            className="flex-1 bg-green-600 hover:bg-green-700 h-8 sm:h-10 text-xs sm:text-sm"
                        >
                            Connect
                        </Button>
                        <Button
                            onClick={disconnectWebSocket}
                            disabled={!isConnected || autoConnect}
                            className="flex-1 bg-red-600 hover:bg-red-700 h-8 sm:h-10 text-xs sm:text-sm"
                        >
                            Disconnect
                        </Button>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="auto-reconnect"
                                checked={autoReconnect}
                                onCheckedChange={toggleAutoReconnect}
                                className={`border-gray-300 w-4 h-4 sm:w-5 sm:h-5 ${autoReconnect ? 'bg-green-500' : 'bg-white'}`}
                            />
                            <Label htmlFor="auto-reconnect" className="text-xs sm:text-sm font-medium text-gray-700">
                                Auto reconnect when changing device
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="auto-connect"
                                checked={autoConnect}
                                onCheckedChange={handleAutoConnectChange}
                                className={`border-gray-300 w-4 h-4 sm:w-5 sm:h-5 ${autoConnect ? 'bg-green-500' : 'bg-white'}`}
                            />
                            <Label htmlFor="auto-connect" className="text-xs sm:text-sm font-medium text-gray-700">
                                Auto connect on page load
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="auto-show-controls"
                                checked={autoShowControls}
                                onCheckedChange={toggleAutoShowControls}
                                className={`border-gray-300 w-4 h-4 sm:w-5 sm:h-5 ${autoShowControls ? 'bg-green-500' : 'bg-white'}`}
                            />
                            <Label htmlFor="auto-show-controls" className="text-xs sm:text-sm font-medium text-gray-700">
                                Auto show controls on load
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="prevent-deletion"
                                checked={preventDeletion}
                                onCheckedChange={togglePreventDeletion}
                                className={`border-gray-300 w-4 h-4 sm:w-5 sm:h-5 ${preventDeletion ? 'bg-green-500' : 'bg-white'}`}
                            />
                            <Label htmlFor="prevent-deletion" className="text-xs sm:text-sm font-medium text-gray-700">
                                Запретить удаление устройств
                            </Label>
                        </div>
                    </div>

                    <Button
                        onClick={() => setLogVisible(!logVisible)}
                        variant="outline"
                        className="w-full border-gray-300 bg-transparent hover:bg-gray-100/50 h-8 sm:h-10 text-xs sm:text-sm text-gray-700"
                    >
                        {logVisible ? (
                            <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        ) : (
                            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        )}
                        {logVisible ? "Hide Logs" : "Show Logs"}
                    </Button>

                    {logVisible && (
                        <div
                            className="border border-gray-200 rounded-md overflow-hidden bg-transparent backdrop-blur-sm"
                        >
                            <div className="h-32 sm:h-48 overflow-y-auto p-2 bg-transparent text-xs font-mono">
                                {log.length === 0 ? (
                                    <div className="text-gray-500 italic">No logs yet</div>
                                ) : (
                                    log.slice().reverse().map((entry, index) => (
                                        <div
                                            key={index}
                                            className={`truncate py-1 ${
                                                entry.ty === 'client' ? 'on' ? 'text-blue-500' : 'text-blue-600' :
                                                    entry.ty === 'esp' ? 'off' ? 'text-blue-500' : 'on' ? 'text-green-500' : 'text-green-600' :
                                                        entry.ty === 'server' ? 'text-purple-600' :
                                                            entry.ty === 'success' ? 'text-teal-600' :
                                                                'text-red-600 font-semibold'
                                            }`}
                                        >
                                            {entry.me}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {controlVisible && (
                <div>
                    <Joystick
                        mo="A"
                        onChange={handleMotorAControl}
                        direction={motorADirection}
                        sp={motorASpeed}
                    />

                    <Joystick
                        mo="B"
                        onChange={handleMotorBControl}
                        direction={motorBDirection}
                        sp={motorBSpeed}
                    />

                    <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex flex-col space-y-2 z-50">
                        {/* Управление первым сервоприводом */}
                        <div className="flex items-center justify-center space-x-2">
                            <Button
                                onClick={() => adjustServo('1', -180)}
                                className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 p-2 rounded-full transition-all"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                onClick={() => adjustServo('1', -15)}
                                className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 p-2 rounded-full transition-all"
                            >
                                <ArrowUp className="h-5 w-5" />
                            </Button>
                            <Button
                                onClick={() => adjustServo('1', 15)}
                                className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 p-2 rounded-full transition-all"
                            >
                                <ArrowDown className="h-5 w-5" />
                            </Button>
                            <Button
                                onClick={() => adjustServo('1', 180)}
                                className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 p-2 rounded-full transition-all"
                            >
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                            <span className="text-sm font-medium text-gray-700">{servoAngle}°</span>
                        </div>

                        {/* Управление вторым сервоприводом */}
                        <div className="flex items-center justify-center space-x-2">
                            <Button
                                onClick={() => adjustServo('2', -180)}
                                className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 p-2 rounded-full transition-all"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                onClick={() => adjustServo('2', -15)}
                                className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 p-2 rounded-full transition-all"
                            >
                                <ArrowUp className="h-5 w-5" />
                            </Button>
                            <Button
                                onClick={() => adjustServo('2', 15)}
                                className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 p-2 rounded-full transition-all"
                            >
                                <ArrowDown className="h-5 w-5" />
                            </Button>
                            <Button
                                onClick={() => adjustServo('2', 180)}
                                className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 p-2 rounded-full transition-all"
                            >
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                            <span className="text-sm font-medium text-gray-700">{servo2Angle}°</span>
                        </div>

                        {/* Кнопки реле и закрытия */}
                        <div className="flex items-center justify-center space-x-2">
                            <Button
                                onClick={() => {
                                    const newState = button1State ? 'off' : 'on';
                                    sendCommand('RLY', { pin: 'D0', state: newState });
                                    setButton1State(newState === 'on' ? 1 : 0);
                                }}
                                className={`${
                                    button1State ? 'bg-green-600 hover:bg-green-700' : 'bg-transparent hover:bg-gray-700/30'
                                } backdrop-blur-sm border border-gray-600 text-gray-600 rounded-full transition-all text-xs sm:text-sm flex items-center`}
                            >
                                <Power className="h-4 w-4" />
                            </Button>

                            <Button
                                onClick={() => {
                                    const newState = button2State ? 'off' : 'on';
                                    sendCommand('RLY', { pin: '3', state: newState });
                                    setButton2State(newState === 'on' ? 1 : 0);
                                }}
                                className={`${
                                    button2State ? 'bg-green-600 hover:bg-green-700' : 'bg-transparent hover:bg-gray-700/30'
                                } backdrop-blur-sm border border-gray-600 text-gray-600 rounded-full transition-all text-xs sm:text-sm flex items-center`}
                            >
                                <Power className="h-4 w-4" />
                            </Button>

                            <Button
                                onClick={handleCloseControls}
                                className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 px-4 py-1 sm:px-6 sm:py-2 rounded-full transition-all text-xs sm:text-sm"
                                style={{ minWidth: '6rem' }}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}