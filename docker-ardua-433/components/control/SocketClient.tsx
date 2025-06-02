"use client"
import {useState, useEffect, useRef, useCallback} from 'react'
import {Button} from "@/components/ui/button"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Input} from "@/components/ui/input"
import {ChevronDown, ChevronUp, ArrowUp, ArrowDown, ArrowLeft, ArrowRight} from "lucide-react"
import {Checkbox} from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label"
import Joystick from '@/components/control/Joystick'

type MessageType = {
    ty?: string // type → ty
    sp?: string
    co?: string // command → co
    de?: string // deviceId → de
    me?: string // message → me
    mo?: string
    pa?: any // params → pa
    clientId?: number
    st?: string // status → st
    ts?: string // timestamp → ts
    or?: 'client' | 'esp' | 'server' | 'error' // origin → or
    re?: string // reason → re
}

type LogEntry = {
    me: string // message → me
    ty: 'client' | 'esp' | 'server' | 'error' // type → ty
}

export default function SocketClient() {
    const [log, setLog] = useState<LogEntry[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [isIdentified, setIsIdentified] = useState(false)
    const [de, setDe] = useState('123') // deviceId → de
    const [inputDe, setInputDe] = useState('123') // deviceId → de
    const [newDe, setNewDe] = useState('') // deviceId → de
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
    const [activeTab, setActiveTab] = useState<'webrtc' | 'esp' | 'controls' | null>('esp')
    const [servoAngle, setServoAngle] = useState(90)

    const reconnectAttemptRef = useRef(0)
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)
    const socketRef = useRef<WebSocket | null>(null)
    const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastMotorACommandRef = useRef<{ sp: number, direction: 'forward' | 'backward' | 'stop' } | null>(null) // speed → sp
    const lastMotorBCommandRef = useRef<{ sp: number, direction: 'forward' | 'backward' | 'stop' } | null>(null) // speed → sp
    const motorAThrottleRef = useRef<NodeJS.Timeout | null>(null)
    const motorBThrottleRef = useRef<NodeJS.Timeout | null>(null)
    const currentDeRef = useRef(inputDe) // deviceId → de

    const [preventDeletion, setPreventDeletion] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);

    useEffect(() => {
        const savedPreventDeletion = localStorage.getItem('preventDeletion');
        if (savedPreventDeletion) {
            setPreventDeletion(savedPreventDeletion === 'true');
        }
    }, []);

    useEffect(() => {
        const checkOrientation = () => {
            if (window.screen.orientation) {
                setIsLandscape(window.screen.orientation.type.includes('landscape'));
            } else {
                setIsLandscape(window.innerWidth > window.innerHeight);
            }
        };

        checkOrientation();

        if (window.screen.orientation) {
            window.screen.orientation.addEventListener('change', checkOrientation);
        } else {
            window.addEventListener('resize', checkOrientation);
        }

        return () => {
            if (window.screen.orientation) {
                window.screen.orientation.removeEventListener('change', checkOrientation);
            } else {
                window.removeEventListener('resize', checkOrientation);
            }
        };
    }, []);

    useEffect(() => {
        currentDeRef.current = inputDe // deviceId → de
    }, [inputDe])

    useEffect(() => {
        const savedDevices = localStorage.getItem('espDeviceList')
        if (savedDevices) {
            const devices = JSON.parse(savedDevices)
            setDeviceList(devices)
            if (devices.length > 0) {
                const savedDe = localStorage.getItem('selectedDeviceId') // deviceId → de
                const initialDe = savedDe && devices.includes(savedDe) // deviceId → de
                    ? savedDe
                    : devices[0]
                setInputDe(initialDe) // deviceId → de
                setDe(initialDe) // deviceId → de
                currentDeRef.current = initialDe // deviceId → de
            }
        }

        const savedAutoReconnect = localStorage.getItem('autoReconnect')
        if (savedAutoReconnect) {
            setAutoReconnect(savedAutoReconnect === 'true')
        }

        const savedAutoConnect = localStorage.getItem('autoConnect')
        if (savedAutoConnect) {
            setAutoConnect(savedAutoConnect === 'true')
        }
    }, [])

    const togglePreventDeletion = useCallback((checked: boolean) => {
        setPreventDeletion(checked);
        localStorage.setItem('preventDeletion', checked.toString());
    }, []);

    const saveNewDe = useCallback(() => { // deviceId → de
        if (newDe && !deviceList.includes(newDe)) { // deviceId → de
            const updatedList = [...deviceList, newDe] // deviceId → de
            setDeviceList(updatedList)
            localStorage.setItem('espDeviceList', JSON.stringify(updatedList))
            setInputDe(newDe) // deviceId → de
            setNewDe('') // deviceId → de
            currentDeRef.current = newDe // deviceId → de
        }
    }, [newDe, deviceList])

    const addLog = useCallback((msg: string, ty: LogEntry['ty']) => { // type → ty
        setLog(prev => [...prev.slice(-100), {me: `${new Date().toLocaleTimeString()}: ${msg}`, ty}]) // message → me, type → ty
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

    const connectWebSocket = useCallback((deToConnect: string) => { // deviceId → de
        cleanupWebSocket()

        reconnectAttemptRef.current = 0
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current)
            reconnectTimerRef.current = null
        }

        const ws = new WebSocket('wss://ardua.site/wsar')

        ws.onopen = () => {
            setIsConnected(true)
            reconnectAttemptRef.current = 0
            addLog("Connected to WebSocket server", 'server')

            ws.send(JSON.stringify({
                ty: "clt", // type → ty, client_type → clt
                ct: "browser" // clientType → ct
            }))

            ws.send(JSON.stringify({
                ty: "idn", // type → ty, identify → idn
                de: deToConnect // deviceId → de
            }))
        }

        ws.onmessage = (event) => {
            try {
                const data: MessageType = JSON.parse(event.data)
                console.log("Received message:", data)

                if (data.ty === "ack") {
                    if (data.co === "SPD" && data.sp !== undefined) {
                        addLog(`Speed set: ${data.sp} for motor ${data.mo || 'unknown'}`, 'esp');
                    } else {
                        addLog(`Command ${data.co} acknowledged`, 'esp');
                    }
                }

                if (data.ty === "sys") { // type → ty, system → sys
                    if (data.st === "con") { // status → st, connected → con
                        setIsIdentified(true)
                        setDe(deToConnect) // deviceId → de
                        setEspConnected(true)
                    }
                    addLog(`System: ${data.me}`, 'server') // message → me
                } else if (data.ty === "err") { // type → ty, error → err
                    addLog(`Error: ${data.me}`, 'error') // message → me
                    setIsIdentified(false)
                } else if (data.ty === "log") { // type → ty
                    addLog(`ESP: ${data.me}`, 'esp') // message → me
                    if (data.me && data.me.includes("Heartbeat")) { // message → me
                        setEspConnected(true)
                    }
                } else if (data.ty === "est") { // type → ty, esp_status → est
                    console.log(`Received ESP status: ${data.st}`) // status → st
                    setEspConnected(data.st === "con") // status → st, connected → con
                    addLog(`ESP ${data.st === "con" ? "✅ Connected" : "❌ Disconnected"}${data.re ? ` (${data.re})` : ''}`, // reason → re
                        data.st === "con" ? 'esp' : 'error') // status → st, connected → con
                } else if (data.ty === "ack") { // type → ty, acknowledge → ack
                    if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current)
                    addLog(`ESP executed co: ${data.co}`, 'esp') // command → co
                } else if (data.ty === "cst") { // type → ty, command_status → cst
                    addLog(`Command ${data.co} delivered to ESP`, 'server') // command → co
                }
            } catch (error) {
                console.error("Error processing message:", error)
                addLog(`Received invalid message: ${event.data}`, 'error')
            }
        }

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
                    connectWebSocket(currentDeRef.current) // deviceId → de
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
            connectWebSocket(currentDeRef.current) // deviceId → de
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
        setInputDe(value) // deviceId → de
        currentDeRef.current = value // deviceId → de
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

    const sendCommand = useCallback((co: string, pa?: any) => { // command → co, params → pa
        if (!isIdentified) {
            addLog("Cannot send co: not identified", 'error') // command → co
            return
        }

        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const msg = JSON.stringify({
                co, // command → co
                pa, // params → pa
                de, // deviceId → de
                ts: Date.now(), // timestamp → ts
                expectAck: true
            })

            socketRef.current.send(msg)
            addLog(`Sent co to ${de}: ${co}`, 'client') // command → co, deviceId → de

            if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current)
            commandTimeoutRef.current = setTimeout(() => {
                if (espConnected) {
                    addLog(`Command ${co} not acknowledged by ESP`, 'error') // command → co
                    setEspConnected(false)
                }
            }, 5000)
        } else {
            addLog("WebSocket not ready!", 'error')
        }
    }, [addLog, de, isIdentified, espConnected])

    const createMotorHandler = useCallback((mo: 'A' | 'B') => { // motor → mo
        const lastCommandRef = mo === 'A' ? lastMotorACommandRef : lastMotorBCommandRef
        const throttleRef = mo === 'A' ? motorAThrottleRef : motorBThrottleRef
        const setSpeed = mo === 'A' ? setMotorASpeed : setMotorBSpeed
        const setDirection = mo === 'A' ? setMotorADirection : setMotorBDirection

        return (value: number) => {
            let direction: 'forward' | 'backward' | 'stop' = 'stop'
            let sp = 0 // speed → sp

            if (value > 0) {
                direction = 'forward'
                sp = value // speed → sp
            } else if (value < 0) {
                direction = 'backward'
                sp = -value // speed → sp
            }

            setSpeed(sp) // speed → sp
            setDirection(direction)

            const currentCommand = {sp, direction} // speed → sp
            if (JSON.stringify(lastCommandRef.current) === JSON.stringify(currentCommand)) {
                return
            }

            lastCommandRef.current = currentCommand

            if (sp === 0) { // speed → sp
                if (throttleRef.current) {
                    clearTimeout(throttleRef.current)
                    throttleRef.current = null
                }
                sendCommand("SPD", {mo, sp: 0}) // set_speed → SPD, motor → mo, speed → sp
                sendCommand(mo === 'A' ? "MSA" : "MSB")
                return
            }

            if (throttleRef.current) {
                clearTimeout(throttleRef.current)
            }

            throttleRef.current = setTimeout(() => {
                sendCommand("SPD", {mo, sp}) // set_speed → SPD, motor → mo, speed → sp
                sendCommand(direction === 'forward'
                    ? `MF${mo}` // motor_a_forward → MFA, motor_b_forward → MFB
                    : `MR${mo}`) // motor_a_backward → MRA, motor_b_backward → MRB
            }, 40)
        }
    }, [sendCommand])

    const adjustServoAngle = useCallback((delta: number) => {
        const newAngle = Math.max(0, Math.min(180, servoAngle + delta))
        setServoAngle(newAngle)
        sendCommand("SSR", {an: newAngle}) // set_servo → SSR, angle → an
    }, [servoAngle, sendCommand])

    const handleMotorAControl = createMotorHandler('A')
    const handleMotorBControl = createMotorHandler('B')

    const emergencyStop = useCallback(() => {
        sendCommand("SPD", {mo: 'A', sp: 0}) // set_speed → SPD, motor → mo, speed → sp
        sendCommand("SPD", {mo: 'B', sp: 0}) // set_speed → SPD, motor → mo, speed → sp
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
            if (isConnected && isIdentified) sendCommand("HBT") // heartbeat2 → HBT
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
        <div className="flex flex-col items-center min-h-screen p-4 bg-transparent mt-12">
            {activeTab === 'esp' && (
                <div
                    className="w-full max-w-md space-y-2 bg-transparent rounded-lg p-2 sm:p-2 border border-gray-200 backdrop-blur-sm"
                    style={{maxHeight: '90vh', overflowY: 'auto'}}>
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
                            value={inputDe} // deviceId → de
                            onValueChange={handleDeviceChange}
                            disabled={isConnected && !autoReconnect}
                        >
                            <SelectTrigger className="flex-1 bg-transparent h-8 sm:h-10">
                                <SelectValue placeholder="Select device"/>
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
                                    const defaultDevice = '123';
                                    setDeviceList([defaultDevice]);
                                    setInputDe(defaultDevice); // deviceId → de
                                    localStorage.setItem('espDeviceList', JSON.stringify([defaultDevice]));
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
                                value={newDe} // deviceId → de
                                onChange={(e) => setNewDe(e.target.value)} // deviceId → de
                                placeholder="Enter new device ID"
                                className="flex-1 bg-transparent h-8 sm:h-10 text-xs sm:text-sm"
                            />
                            <Button
                                onClick={saveNewDe} // deviceId → de
                                disabled={!newDe} // deviceId → de
                                className="bg-blue-600 hover:bg-blue-700 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <Button
                            onClick={() => connectWebSocket(currentDeRef.current)} // deviceId → de
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
                                className="border-gray-300 bg-transparent w-4 h-4 sm:w-5 sm:h-5"
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
                                className="border-gray-300 bg-transparent w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <Label htmlFor="auto-connect" className="text-xs sm:text-sm font-medium text-gray-700">
                                Auto connect on page load
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="prevent-deletion"
                                checked={preventDeletion}
                                onCheckedChange={togglePreventDeletion}
                                className="border-gray-300 bg-transparent w-4 h-4 sm:w-5 sm:h-5"
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
                            <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-2"/>
                        ) : (
                            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-2"/>
                        )}
                        {logVisible ? "Hide Logs" : "Show Logs"}
                    </Button>

                    {logVisible && (
                        <div
                            className="border border-gray-200 rounded-md overflow-hidden bg-transparent backdrop-blur-sm">
                            <div className="h-32 sm:h-48 overflow-y-auto p-2 bg-transparent text-xs font-mono">
                                {log.length === 0 ? (
                                    <div className="text-gray-500 italic">No logs yet</div>
                                ) : (
                                    log.slice().reverse().map((entry, index) => (
                                        <div
                                            key={index}
                                            className={`truncate py-1 ${
                                                entry.ty === 'client' ? 'text-blue-600' : // type → ty
                                                    entry.ty === 'esp' ? 'text-green-600' : // type → ty
                                                        entry.ty === 'server' ? 'text-purple-600' : // type → ty
                                                            'text-red-600 font-semibold'
                                            }`}
                                        >
                                            {entry.me} // message → me
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
                        mo="A" // motor → mo
                        onChange={handleMotorAControl}
                        direction={motorADirection}
                        sp={motorASpeed} // speed → sp
                    />

                    <Joystick
                        mo="B" // motor → mo
                        onChange={handleMotorBControl}
                        direction={motorBDirection}
                        sp={motorBSpeed} // speed → sp
                    />

                    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-4 z-50">
                        <Button
                            onClick={() => adjustServoAngle(-180)}
                            className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 p-2 rounded-full transition-all"
                        >
                            <ArrowLeft className="h-5 w-5"/>
                        </Button>

                        <Button
                            onClick={() => adjustServoAngle(15)}
                            className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 p-2 rounded-full transition-all"
                        >
                            <ArrowDown className="h-5 w-5" />
                        </Button>

                        <Button
                            onClick={() => adjustServoAngle(-15)}
                            className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 p-2 rounded-full transition-all"
                        >
                            <ArrowUp className="h-5 w-5" />
                        </Button>

                        <Button
                            onClick={() => adjustServoAngle(180)}
                            className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 p-2 rounded-full transition-all"
                        >
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>

                    <Button
                        onClick={handleCloseControls}
                        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 text-gray-600 px-4 py-1 sm:px-6 sm:py-2 rounded-full transition-all text-xs sm:text-sm"
                        style={{minWidth: '6rem'}}
                    >
                        Close
                    </Button>
                </div>
            )}
        </div>
    )
}