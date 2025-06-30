"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Joystick from '@/components/control/Joystick'
import JoystickVertical from '@/components/control/JoystickVertical'
import JoystickHorizontal from '@/components/control/JoystickHorizontal' // Добавляем новый компонент
import { useServo } from '@/components/ServoContext';
import {
    getDevices,
    addDevice,
    deleteDevice,
    updateServoSettings,
    sendDeviceSettingsToESP,
    getSavedRoomWithDevice,
    updateDeviceSettings
} from '@/app/actions';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import JoystickUp from "@/components/control/JoystickUp";
import JoyAnalog from '@/components/control/JoyAnalog';
import VirtualBox from "@/components/control/VirtualBox";


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
    z?: string
}

type LogEntry = {
    me: string
    ty: 'client' | 'esp' | 'server' | 'error' | 'success' | 'info'
}

interface SocketClientProps {
    onConnectionStatusChange?: (isFullyConnected: boolean) => void;
    selectedDeviceId?: string | null;
    onDisconnectWebSocket?: { disconnectWebSocket?: () => Promise<void> };
    onDeviceAdded?: (deviceId: string) => void;
    isProxySocket?: boolean;
}

export default function SocketClient({ onConnectionStatusChange, selectedDeviceId, onDisconnectWebSocket, onDeviceAdded, isProxySocket }: SocketClientProps) {
    const {
        servoAngle,
        servo2Angle,
        servo1MinAngle,
        servo1MaxAngle,
        servo2MinAngle,
        servo2MaxAngle,
        setServoAngle,
        setServo2Angle,
        setServo1MinAngle,
        setServo1MaxAngle,
        setServo2MinAngle,
        setServo2MaxAngle,
    } = useServo();
    const [log, setLog] = useState<LogEntry[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [isIdentified, setIsIdentified] = useState(false)
    const [de, setDe] = useState('')
    const [inputDe, setInputDe] = useState('')
    const [newDe, setNewDe] = useState('')
    const [noDevices, setNoDevices] = useState(true)
    const [deviceList, setDeviceList] = useState<string[]>([])
    const [espConnected, setEspConnected] = useState(false)
    const [logVisible, setLogVisible] = useState(false)
    const [motorASpeed, setMotorASpeed] = useState(0)
    const [motorBSpeed, setMotorBSpeed] = useState(0)
    const [motorADirection, setMotorADirection] = useState<'forward' | 'backward' | 'stop'>('stop')
    const [motorBDirection, setMotorBDirection] = useState<'forward' | 'backward' | 'stop'>('stop')
    const [autoReconnect, setAutoReconnect] = useState(false)
    const [autoConnect, setAutoConnect] = useState(false)
    const [closedDel, setClosedDel] = useState(false)
    const [isLandscape, setIsLandscape] = useState(false)
    const [button1State, setButton1State] = useState<boolean | null>(null)
    const [button2State, setButton2State] = useState<boolean | null>(null)
    const [showServos, setShowServos] = useState<boolean | null>(null)
    const [activeTab, setActiveTab] = useState<'esp' | 'controls' | 'joystickControl' | null>('esp')
    const [showJoystickMenu, setShowJoystickMenu] = useState(false)
    const [selectedJoystick, setSelectedJoystick] = useState<'JoystickTurn' | 'Joystick' | 'JoystickUp' | 'JoyAnalog'>(
        (typeof window !== 'undefined' && localStorage.getItem('selectedJoystick') as 'Joystick' | 'JoystickTurn' | 'JoystickUp' | 'JoyAnalog') || 'JoystickTurn'
    );
    const [isVirtualBoxActive, setIsVirtualBoxActive] = useState(false);

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

    const [servo1MinInput, setServo1MinInput] = useState('');
    const [servo1MaxInput, setServo1MaxInput] = useState('');
    const [servo2MinInput, setServo2MinInput] = useState('');
    const [servo2MaxInput, setServo2MaxInput] = useState('');

    const [inputVoltage, setInputVoltage] = useState<number | null>(null);
    const [telegramToken, setTelegramToken] = useState<string | null>(null);
    const [telegramTokenInput, setTelegramTokenInput] = useState('');
    const [telegramIdInput, setTelegramIdInput] = useState('');
    const [isDeviceOrientationSupported, setIsDeviceOrientationSupported] = useState(false);
    const virtualBoxRef = useRef<{ handleRequestPermissions: () => void } | null>(null);

    const [isProxy, setIsProxy] = useState(false);

    // Новое состояние для данных ориентации
    const [orientationData, setOrientationData] = useState<{ beta: number | null; gamma: number | null }>({
        beta: null,
        gamma: null,
    });

    // Callback для обработки данных ориентации
    const handleOrientationChange = useCallback((beta: number, gamma: number) => {
        setOrientationData({ beta, gamma });
    }, []);


    useEffect(() => {
        setIsProxy(!!selectedDeviceId);
    }, [selectedDeviceId]);

    useEffect(() => {
        localStorage.setItem('selectedJoystick', selectedJoystick)
    }, [selectedJoystick])

    const addLog = useCallback((msg: string, ty: LogEntry['ty']) => {
        setLog(prev => [...prev.slice(-100), { me: `${new Date().toLocaleTimeString()}: ${msg}`, ty }]);
    }, []);

    const [telegramId, setTelegramId] = useState<BigInt | null>(null);

    useEffect(() => {
        const loadDevices = async () => {
            if (isProxySocket) return;
            try {
                const devices = await getDevices();
                setDeviceList(devices.map(d => d.idDevice));
                setNoDevices(devices.length === 0);
                if (devices.length > 0) {
                    const autoConnectDevice = devices.find(device => device.autoConnect) || devices[0];
                    const device = autoConnectDevice;
                    setInputDe(device.idDevice);
                    setDe(device.idDevice);
                    currentDeRef.current = device.idDevice;
                    setAutoReconnect(device.autoReconnect ?? false);
                    setAutoConnect(device.autoConnect ?? false);
                    setClosedDel(device.closedDel ?? false);
                    setTelegramToken(device.telegramToken ?? null);
                    setTelegramId(device.telegramId !== null ? BigInt(device.telegramId) : null);
                    setTelegramTokenInput(device.telegramToken ?? '');
                    setTelegramIdInput(device.telegramId?.toString() ?? '');
                    if (device.settings && device.settings.length > 0) {
                        const settings = device.settings[0];
                        setServo1MinAngle(settings.servo1MinAngle || 0);
                        setServo1MaxAngle(settings.servo1MaxAngle || 180);
                        setServo2MinAngle(settings.servo2MinAngle || 0);
                        setServo2MaxAngle(settings.servo2MaxAngle || 180);
                        setButton1State(settings.b1 ?? false);
                        setButton2State(settings.b2 ?? false);
                        setShowServos(settings.servoView ?? true);
                        setServo1MinInput((settings.servo1MinAngle || 0).toString());
                        setServo1MaxInput((settings.servo1MaxAngle || 180).toString());
                        setServo2MinInput((settings.servo2MinAngle || 0).toString());
                        setServo2MaxInput((settings.servo2MaxAngle || 180).toString());
                    }
                    if (device.autoConnect) {
                        connectWebSocket(device.idDevice);
                        addLog(`Автоматическое подключение к устройству ${formatDeviceId(device.idDevice)}`, 'success');
                    }
                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                        const settings = await sendDeviceSettingsToESP(device.idDevice);
                        socketRef.current.send(JSON.stringify({
                            co: 'SET_SERVO1_LIMITS',
                            pa: { min: settings.servo1MinAngle, max: settings.servo1MaxAngle },
                            de: device.idDevice,
                            ts: Date.now(),
                            expectAck: true
                        }));
                        socketRef.current.send(JSON.stringify({
                            co: 'SET_SERVO2_LIMITS',
                            pa: { min: settings.servo2MinAngle, max: settings.servo2MaxAngle },
                            de: device.idDevice,
                            ts: Date.now(),
                            expectAck: true
                        }));
                        socketRef.current.send(JSON.stringify({
                            co: 'SET_SERVO_VIEW',
                            pa: { visible: settings.servoView },
                            de: device.idDevice,
                            ts: Date.now(),
                            expectAck: true
                        }));
                    }
                } else {
                    setDeviceList([]);
                    setNoDevices(true);
                    setInputDe('');
                    setDe('');
                    setShowServos(true);
                    setServo1MinInput('0');
                    setServo1MaxInput('180');
                    setServo2MinInput('0');
                    setServo2MaxInput('180');
                }
            } catch (error: unknown) {
                let errorMessage = 'Неизвестная ошибка';
                if (error instanceof Error) {
                    errorMessage = error.message;
                } else if (typeof error === 'object' && error !== null && 'message' in error) {
                    errorMessage = (error as { message: string }).message;
                } else {
                    errorMessage = String(error);
                }
                addLog(`Ошибка: ${errorMessage}`, 'error');
                setNoDevices(true);
            }
        };
        loadDevices();
    }, [setServo1MinAngle, setServo1MaxAngle, setServo2MinAngle, setServo2MaxAngle, addLog]);

    const handleServoInputChange = useCallback(
        (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
            if (value === '' || (/^[0-9]*$/.test(value) && parseInt(value) <= 180)) {
                setter(value);
            }
        },
        []
    );

    const handleServoInputBlur = useCallback(
        async (field: 'servo1Min' | 'servo1Max' | 'servo2Min' | 'servo2Max', value: string) => {
            try {
                let newValue = value === '' ? 0 : parseInt(value);
                let isValid = true;
                let updateData: {
                    servo1MinAngle?: number;
                    servo1MaxAngle?: number;
                    servo2MinAngle?: number;
                    servo2MaxAngle?: number;
                } = {};

                if (newValue > 180) {
                    newValue = 180;
                    isValid = false;
                }

                if (field === 'servo1Min') {
                    if (newValue > servo1MaxAngle) {
                        newValue = servo1MinAngle;
                        setServo1MinInput(servo1MinAngle.toString());
                        isValid = false;
                    } else {
                        setServo1MinAngle(newValue);
                        setServo1MinInput(newValue.toString());
                        updateData.servo1MinAngle = newValue;
                    }
                } else if (field === 'servo1Max') {
                    if (newValue < servo1MinAngle) {
                        newValue = servo1MaxAngle;
                        setServo1MaxInput(servo1MaxAngle.toString());
                        isValid = false;
                    } else {
                        setServo1MaxAngle(newValue);
                        setServo1MaxInput(newValue.toString());
                        updateData.servo1MaxAngle = newValue;
                    }
                } else if (field === 'servo2Min') {
                    if (newValue > servo2MaxAngle) {
                        newValue = servo2MinAngle;
                        setServo2MinInput(servo2MinAngle.toString());
                        isValid = false;
                    } else {
                        setServo2MinAngle(newValue);
                        setServo2MinInput(newValue.toString());
                        updateData.servo2MinAngle = newValue;
                    }
                } else if (field === 'servo2Max') {
                    if (newValue < servo2MinAngle) {
                        newValue = servo2MaxAngle;
                        setServo2MaxInput(servo2MaxAngle.toString());
                        isValid = false;
                    } else {
                        setServo2MaxAngle(newValue);
                        setServo2MaxInput(newValue.toString());
                        updateData.servo2MaxAngle = newValue;
                    }
                }

                if (isValid && Object.keys(updateData).length > 0) {
                    await updateServoSettings(inputDe, updateData, isProxy);
                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                        if (field === 'servo1Min' || field === 'servo1Max') {
                            socketRef.current.send(JSON.stringify({
                                co: 'SET_SERVO1_LIMITS',
                                pa: { min: servo1MinAngle, max: servo1MaxAngle },
                                de: inputDe,
                                ts: Date.now(),
                                expectAck: true
                            }));
                        } else {
                            socketRef.current.send(JSON.stringify({
                                co: 'SET_SERVO2_LIMITS',
                                pa: { min: servo2MinAngle, max: servo2MaxAngle },
                                de: inputDe,
                                ts: Date.now(),
                                expectAck: true
                            }));
                        }
                    }
                    addLog(`Угол ${field} обновлён: ${newValue}°`, 'success');
                } else if (!isValid) {
                    addLog(`Недопустимое значение для ${field}: ${value}`, 'error');
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                addLog(`Ошибка сохранения ${field}: ${errorMessage}`, 'error');
                if (field === 'servo1Min') setServo1MinInput(servo1MinAngle.toString());
                else if (field === 'servo1Max') setServo1MaxInput(servo1MaxAngle.toString());
                else if (field === 'servo2Min') setServo2MinInput(servo2MinAngle.toString());
                else if (field === 'servo2Max') setServo2MaxInput(servo2MaxAngle.toString());
            }
        },
        [servo1MinAngle, servo1MaxAngle, servo2MinAngle, servo2MaxAngle, inputDe, addLog, setServo1MinAngle, setServo1MaxAngle, setServo2MinAngle, setServo2MaxAngle]
    );

    useEffect(() => {
        const checkOrientation = () => {
            if (window.screen.orientation) {
                setIsLandscape(window.screen.orientation.type.includes('landscape'));
            } else {
                setIsLandscape(window.innerWidth > window.innerHeight);
            }
            // Проверка поддержки DeviceOrientationEvent
            setIsDeviceOrientationSupported(typeof window.DeviceOrientationEvent !== "undefined");
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
        currentDeRef.current = inputDe
    }, [inputDe])

    useEffect(() => {
        const isFullyConnected = isConnected && isIdentified && espConnected;
        onConnectionStatusChange?.(isFullyConnected);
    }, [isConnected, isIdentified, espConnected, onConnectionStatusChange]);

    const toggleAutoReconnect = useCallback(async (checked: boolean) => {
        setAutoReconnect(checked);
        try {
            await updateDeviceSettings(inputDe, { autoReconnect: checked });
            addLog(`Автоматическое переподключение: ${checked ? 'включено' : 'выключено'}`, 'success');
        } catch (error: unknown) {
            setAutoReconnect(!checked);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Ошибка сохранения autoReconnect: ${errorMessage}`, 'error');
        }
    }, [inputDe, addLog]);

    const toggleAutoConnect = useCallback(async (checked: boolean) => {
        setAutoConnect(checked);
        try {
            await updateDeviceSettings(inputDe, { autoConnect: checked });
            addLog(`Автоматическое подключение: ${checked ? 'включено' : 'выключено'}`, 'success');
        } catch (error: unknown) {
            setAutoConnect(!checked);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Ошибка сохранения autoConnect: ${errorMessage}`, 'error');
        }
    }, [inputDe, addLog]);

    const toggleClosedDel = useCallback(async (checked: boolean) => {
        setClosedDel(checked);
        try {
            await updateDeviceSettings(inputDe, { closedDel: checked });
            addLog(`Запрет удаления: ${checked ? 'включен' : 'выключен'}`, 'success');
        } catch (error: unknown) {
            setClosedDel(!checked);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Ошибка сохранения closedDel: ${errorMessage}`, 'error');
        }
    }, [inputDe, addLog]);

    const formatDeviceId = (id: string): string => {
        const cleanId = id.replace(/[^A-Z0-9]/gi, '');
        return cleanId.replace(/(.{4})(?=.)/g, '$1-');
    };

    const cleanDeviceId = (id: string): string => {
        return id.replace(/[^A-Z0-9]/gi, '');
    };

    const handleNewDeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.toUpperCase();
        const cleanInput = input.replace(/[^A-Z0-9]/gi, '');
        if (cleanInput.length <= 16) {
            const formatted = formatDeviceId(cleanInput);
            setNewDe(formatted);
        }
    };

    const isAddDisabled = cleanDeviceId(newDe).length !== 16;

    const handleTelegramPaste = useCallback(
        async (e: React.ClipboardEvent<HTMLInputElement>, field: 'telegramToken' | 'telegramId') => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text').trim();

            try {
                if (field === 'telegramToken') {
                    setTelegramTokenInput(pastedText);
                    await updateDeviceSettings(inputDe, {
                        telegramToken: pastedText || null,
                        telegramId: telegramId !== null ? Number(telegramId) : null,
                    });
                    setTelegramToken(pastedText || null);
                    addLog('Telegram Token успешно сохранён', 'success');
                } else {
                    if (!/^[0-9]*$/.test(pastedText)) {
                        addLog('Telegram ID должен содержать только цифры', 'error');
                        return;
                    }
                    const parsedTelegramId = pastedText ? BigInt(pastedText) : null;
                    if (parsedTelegramId === null) {
                        addLog('Telegram ID должен быть числом', 'error');
                        return;
                    }
                    setTelegramIdInput(pastedText);
                    await updateDeviceSettings(inputDe, {
                        telegramToken: telegramTokenInput || null,
                        telegramId: parsedTelegramId !== null ? Number(parsedTelegramId) : null,
                    });
                    setTelegramId(parsedTelegramId);
                    addLog('Telegram ID успешно сохранён', 'success');
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                addLog(`Ошибка сохранения настроек Telegram: ${errorMessage}`, 'error');
                console.error('Ошибка в handleTelegramPaste:', errorMessage);
                if (field === 'telegramToken') {
                    setTelegramTokenInput(telegramToken ?? '');
                } else {
                    setTelegramIdInput(telegramId?.toString() ?? '');
                }
            }
        },
        [inputDe, telegramToken, telegramId, addLog]
    );

    const handleTelegramInputBlur = useCallback(
        async () => {
            try {
                const parsedTelegramId = telegramIdInput ? BigInt(telegramIdInput) : null;
                if (telegramIdInput && parsedTelegramId === null) {
                    throw new Error('Telegram ID должен быть числом');
                }

                await updateDeviceSettings(inputDe, {
                    telegramToken: telegramTokenInput || null,
                    telegramId: parsedTelegramId !== null ? Number(parsedTelegramId) : null,
                });

                setTelegramToken(telegramTokenInput || null);
                setTelegramId(parsedTelegramId);
                addLog('Настройки Telegram успешно сохранены', 'success');
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                addLog(`Ошибка сохранения настроек Telegram: ${errorMessage}`, 'error');
                setTelegramTokenInput(telegramToken ?? '');
                setTelegramIdInput(telegramId?.toString() ?? '');
            }
        },
        [inputDe, telegramTokenInput, telegramIdInput, telegramToken, telegramId, addLog]
    );

    const saveNewDe = useCallback(async () => {
        const cleanId = cleanDeviceId(newDe);
        if (cleanId.length === 16 && !deviceList.includes(cleanId)) {
            try {
                await addDevice(cleanId, autoConnect, autoReconnect, closedDel);
                setDeviceList(prev => [...prev, cleanId]);
                setInputDe(cleanId);
                setDe(cleanId);
                setNoDevices(false);
                setNewDe('');
                currentDeRef.current = cleanId;
                addLog(`Устройство ${cleanId} добавлено`, 'success');
                onDeviceAdded?.(cleanId);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                addLog(`Ошибка добавления устройства: ${errorMessage}`, 'error');
            }
        }
    }, [newDe, deviceList, autoConnect, autoReconnect, closedDel, addLog, onDeviceAdded]);

    const handleDeleteDevice = useCallback(async () => {
        if (isConnected) {
            addLog('Невозможно удалить устройство: активное соединение с WebSocket', 'error');
            return;
        }
        if (noDevices) {
            addLog('Нет устройств для удаления', 'error');
            return;
        }
        if (closedDel) {
            addLog('Удаление устройства запрещено', 'error');
            return;
        }

        try {
            const roomWithDevice = await getSavedRoomWithDevice(inputDe);
            if (roomWithDevice.deviceId) {
                addLog(`Устройство ${formatDeviceId(inputDe)} привязано к комнате ${roomWithDevice.id}, удаление невозможно`, 'error');
                return;
            }

            if (!confirm("Удалить устройство?")) {
                return;
            }

            await deleteDevice(inputDe);
            const updatedList = deviceList.filter(id => id !== inputDe);
            setDeviceList(updatedList);
            setNoDevices(updatedList.length === 0);
            const defaultDevice = updatedList.length > 0 ? updatedList[0] : '';
            setInputDe(defaultDevice);
            setDe(defaultDevice);
            currentDeRef.current = defaultDevice;
            addLog(`Устройство ${formatDeviceId(inputDe)} удалено`, 'success');
        } catch (error: unknown) {
            console.error('Ошибка при удалении устройства:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Ошибка удаления устройства: ${errorMessage}`, 'error');
        }
    }, [isConnected, noDevices, closedDel, inputDe, deviceList, addLog, formatDeviceId]);

    const cleanupWebSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.onopen = null;
            socketRef.current.onclose = null;
            socketRef.current.onmessage = null;
            socketRef.current.onerror = null;
            if (socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.close();
            }
            socketRef.current = null;
        }
    }, []);

    const toggleServosVisibility = useCallback(async () => {
        try {
            setShowServos(prev => !prev);
            const newState = !showServos;
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                    co: 'SET_SERVO_VIEW',
                    pa: { visible: newState },
                    de: inputDe,
                    ts: Date.now(),
                    expectAck: true
                }));
            }
            await updateServoSettings(inputDe, { servoView: newState });
            addLog(`Видимость сервоприводов: ${newState ? 'включена' : 'выключена'}`, 'success');
        } catch (error: unknown) {
            setShowServos(prev => !prev);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Ошибка servoView: ${errorMessage}`, 'error');
        }
    }, [inputDe, showServos, addLog]);

    const connectWebSocket = useCallback((deToConnect: string) => {
        cleanupWebSocket();
        reconnectAttemptRef.current = 0;
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }

        const ws = new WebSocket(process.env.WEBSOCKET_URL_WSAR || 'wss://ardua.site:444/wsar');

        ws.onopen = () => {
            setIsConnected(true);
            reconnectAttemptRef.current = 0;
            addLog("Подключено к WebSocket серверу", 'server');

            ws.send(JSON.stringify({ ty: "clt", ct: "browser" }));
            ws.send(JSON.stringify({ ty: "idn", de: deToConnect }));
            ws.send(JSON.stringify({ co: "GET_RELAYS", de: deToConnect, ts: Date.now() }));

            sendDeviceSettingsToESP(deToConnect)
                .then(settings => {
                    if (ws.readyState === WebSocket.OPEN) {
                        if (settings.servo1MinAngle !== undefined && settings.servo1MaxAngle !== undefined) {
                            ws.send(
                                JSON.stringify({
                                    co: 'SET_SERVO1_LIMITS',
                                    pa: { min: settings.servo1MinAngle, max: settings.servo1MaxAngle },
                                    de: deToConnect,
                                    ts: Date.now(),
                                    expectAck: true,
                                })
                            );
                        }
                        if (settings.servo2MinAngle !== undefined && settings.servo2MaxAngle !== undefined) {
                            ws.send(
                                JSON.stringify({
                                    co: 'SET_SERVO2_LIMITS',
                                    pa: { min: settings.servo2MinAngle, max: settings.servo2MaxAngle },
                                    de: deToConnect,
                                    ts: Date.now(),
                                    expectAck: true,
                                })
                            );
                        }
                        ws.send(
                            JSON.stringify({
                                co: 'SET_SERVO_VIEW',
                                pa: { visible: settings.servoView },
                                de: deToConnect,
                                ts: Date.now(),
                                expectAck: true,
                            })
                        );
                    }
                })
                .catch((error: unknown) => {
                    console.error('Ошибка отправки настроек на устройство:', error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    addLog(`Ошибка отправки настроек: ${errorMessage}`, 'error');
                });
        };

        ws.onmessage = (event) => {
            try {
                const data: MessageType = JSON.parse(event.data);
                console.log('Получено сообщение:', data);

                if (data.ty === 'ack') {
                    if (data.co === 'RLY' && data.pa) {
                        if (data.pa.pin === 'D0') {
                            const newState = data.pa.state === 'on';
                            setButton1State(newState);
                            updateServoSettings(deToConnect, { b1: newState }).catch((error: unknown) => {
                                const errorMessage = error instanceof Error ? error.message : String(error);
                                addLog(`Ошибка сохранения b1: ${errorMessage}`, 'error');
                            });
                            addLog(`Реле 1 (D0) ${newState ? 'включено' : 'выключено'}`, 'esp');
                        } else if (data.pa.pin === '3') {
                            const newState = data.pa.state === 'on';
                            setButton2State(newState);
                            updateServoSettings(deToConnect, { b2: newState }).catch((error: unknown) => {
                                const errorMessage = error instanceof Error ? error.message : String(error);
                                addLog(`Ошибка сохранения b2: ${errorMessage}`, 'error');
                            });
                            addLog(`Реле 2 (3) ${newState ? 'включено' : 'выключено'}`, 'esp');
                        }
                    } else if (data.co === 'SPD' && data.sp !== undefined) {
                        addLog(`Скорость установлена: ${data.sp} для мотора ${data.mo || 'unknown'}`, 'esp');
                    } else {
                        addLog(`Команда ${data.co} подтверждена`, 'esp');
                    }
                }

                if (data.ty === 'sys') {
                    if (data.st === 'con') {
                        setIsIdentified(true);
                        setDe(deToConnect);
                        setEspConnected(true);
                    }
                    addLog(`Система: ${data.me}`, 'server');
                } else if (data.ty === 'err') {
                    addLog(`Ошибка: ${data.me}`, 'error');
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
                        const newState = data.b1 === 'on';
                        setButton1State(newState);
                        updateServoSettings(deToConnect, { b1: newState }).catch((error: unknown) => {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            addLog(`Ошибка сохранения b1: ${errorMessage}`, 'error');
                        });
                        addLog(`Реле 1 (D0): ${newState ? 'включено' : 'выключено'}`, 'esp');
                    }
                    if (data.b2 !== undefined) {
                        const newState = data.b2 === 'on';
                        setButton2State(newState);
                        updateServoSettings(deToConnect, { b2: newState }).catch((error: unknown) => {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            addLog(`Ошибка сохранения b2: ${errorMessage}`, 'error');
                        });
                        addLog(`Реле 2 (3): ${newState ? 'включено' : 'выключено'}`, 'esp');
                    }
                    if (data.sp1 !== undefined) {
                        setServoAngle(Number(data.sp1));
                        addLog(`Угол сервопривода 1: ${data.sp1}°`, 'esp');
                    }
                    if (data.sp2 !== undefined) {
                        setServo2Angle(Number(data.sp2));
                        addLog(`Угол сервопривода 2: ${data.sp2}°`, 'esp');
                    }
                    if (data.z !== undefined) {
                        const voltage = Number(data.z);
                        setInputVoltage(voltage);
                        addLog(`Напряжение A0: ${voltage.toFixed(2)} В`, 'esp');
                    }
                } else if (data.ty === 'est') {
                    console.log(`Статус ESP: ${data.st}`);
                    setEspConnected(data.st === 'con');
                    addLog(`ESP ${data.st === 'con' ? '✅ Подключено' : '❌ Отключено'}`, 'error');
                } else if (data.ty === 'cst') {
                    addLog(`Команда ${data.co} доставлена`, 'client');
                }
            } catch (error: unknown) {
                console.error('Ошибка обработки сообщения:', error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                addLog(`Ошибка обработки сообщения: ${errorMessage}`, 'error');
            }
        };

        ws.onclose = (event) => {
            setIsConnected(false);
            setIsIdentified(false);
            setEspConnected(false);
            addLog(`Отключено от сервера${event.reason ? `: ${event.reason}` : ''}`, 'server');

            if (reconnectAttemptRef.current < 5) {
                reconnectAttemptRef.current += 1;
                const delay = Math.min(5000, reconnectAttemptRef.current * 1000);
                addLog(`Попытка переподключения через ${delay / 1000} секунд... (попытка ${reconnectAttemptRef.current})`, 'server');

                reconnectTimerRef.current = setTimeout(() => {
                    connectWebSocket(currentDeRef.current);
                }, delay);
            } else {
                addLog("Достигнуто максимальное количество попыток переподключения", 'error');
            }
        };

        ws.onerror = (error) => {
            addLog(`Ошибка WebSocket: ${error.type}`, 'error');
        };

        socketRef.current = ws;
    }, [addLog, cleanupWebSocket]);

    const disconnectWebSocket = useCallback(async () => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                if (isConnected && inputDe) {
                    try {
                        sendCommand("SPD", { mo: 'A', sp: 0 });
                        sendCommand("MSA");
                        sendCommand("SPD", { mo: 'B', sp: 0 });
                        sendCommand("MSB");
                        addLog("Команды остановки моторов отправлены через WebSocket", 'success');

                        setMotorASpeed(0);
                        setMotorBSpeed(0);
                        setMotorADirection('stop');
                        setMotorBDirection('stop');
                        lastMotorACommandRef.current = null;
                        lastMotorBCommandRef.current = null;
                        if (motorAThrottleRef.current) {
                            clearTimeout(motorAThrottleRef.current);
                            motorAThrottleRef.current = null;
                        }
                        if (motorBThrottleRef.current) {
                            clearTimeout(motorBThrottleRef.current);
                            motorBThrottleRef.current = null;
                        }
                    } catch (error: unknown) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        addLog(`Ошибка остановки моторов: ${errorMessage}`, 'error');
                    }
                }

                cleanupWebSocket();
                setIsConnected(false);
                setIsIdentified(false);
                setEspConnected(false);
                addLog("Отключено вручную", 'server');
                reconnectAttemptRef.current = 5;

                if (reconnectTimerRef.current) {
                    clearTimeout(reconnectTimerRef.current);
                    reconnectTimerRef.current = null;
                }

                if (autoReconnect || autoConnect) {
                    setAutoReconnect(false);
                    setAutoConnect(false);
                    try {
                        await updateDeviceSettings(inputDe, {
                            autoReconnect: false,
                            autoConnect: false,
                        });
                        addLog("Автоматическое переподключение и подключение отключены", 'success');
                    } catch (error: unknown) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        addLog(`Ошибка сохранения настроек устройства: ${errorMessage}`, 'error');
                    }
                }

                resolve();
            } catch (error) {
                addLog(`Ошибка при отключении WebSocket: ${String(error)}`, 'error');
                reject(error);
            }
        });
    }, [
        addLog,
        cleanupWebSocket,
        isConnected,
        inputDe,
        autoReconnect,
        autoConnect,
        updateDeviceSettings,
        setMotorASpeed,
        setMotorBSpeed,
        setMotorADirection,
        setMotorBDirection,
    ]);

    useEffect(() => {
        if (onDisconnectWebSocket) {
            onDisconnectWebSocket.disconnectWebSocket = disconnectWebSocket;
        }
        return () => {
            if (onDisconnectWebSocket) {
                onDisconnectWebSocket.disconnectWebSocket = undefined;
            }
        };
    }, [onDisconnectWebSocket, disconnectWebSocket]);

    useEffect(() => {
        if (selectedDeviceId && selectedDeviceId !== inputDe) {
            const reconnect = async () => {
                try {
                    await disconnectWebSocket();
                    setInputDe(selectedDeviceId);
                    currentDeRef.current = selectedDeviceId;
                    connectWebSocket(selectedDeviceId);
                    addLog(`Переподключено к устройству ${formatDeviceId(selectedDeviceId)} из-за смены комнаты`, 'success');
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    addLog(`Ошибка переподключения устройства: ${errorMessage}`, 'error');
                }
            };
            reconnect();
        }
    }, [selectedDeviceId, inputDe, disconnectWebSocket, connectWebSocket, addLog, formatDeviceId]);

    useEffect(() => {
        if (autoConnect && !isConnected) {
            connectWebSocket(currentDeRef.current);
        }
    }, [autoConnect, connectWebSocket, isConnected]);

    const handleDeviceChange = useCallback(async (value: string) => {
        if (noDevices) {
            addLog('Нет добавленных устройств', 'error');
            return;
        }
        if (selectedDeviceId) {
            addLog('Невозможно сменить устройство: оно привязано к комнате', 'error');
            return;
        }
        if (value === inputDe) {
            return;
        }
        setInputDe(value);
        currentDeRef.current = value;
        try {
            const devices = await getDevices();
            const selectedDevice = devices.find(device => device.idDevice === value);
            if (selectedDevice) {
                setAutoConnect(selectedDevice.autoConnect ?? false);
                setClosedDel(selectedDevice.closedDel ?? false);
                setTelegramToken(selectedDevice.telegramToken ?? null);
                setTelegramId(selectedDevice.telegramId ?? null);
                setTelegramTokenInput(selectedDevice.telegramToken ?? '');
                setTelegramIdInput(selectedDevice.telegramId?.toString() ?? '');
                if (selectedDevice.settings && selectedDevice.settings[0]) {
                    setServo1MinAngle(selectedDevice.settings[0].servo1MinAngle || 0);
                    setServo1MaxAngle(selectedDevice.settings[0].servo1MaxAngle || 180);
                    setServo2MinAngle(selectedDevice.settings[0].servo2MinAngle || 0);
                    setServo2MaxAngle(selectedDevice.settings[0].servo2MaxAngle || 180);
                    setButton1State(selectedDevice.settings[0].b1 ?? false);
                    setButton2State(selectedDevice.settings[0].b2 ?? false);
                    setShowServos(selectedDevice.settings[0].servoView ?? true);
                    setServo1MinInput((selectedDevice.settings[0].servo1MinAngle || 0).toString());
                    setServo1MaxInput((selectedDevice.settings[0].servo1MaxAngle || 180).toString());
                    setServo2MinInput((selectedDevice.settings[0].servo2MinAngle || 0).toString());
                    setServo2MaxInput((selectedDevice.settings[0].servo2MaxAngle || 180).toString());
                }
                if (selectedDevice.autoReconnect) {
                    setAutoReconnect(true);
                    await updateDeviceSettings(value, { autoReconnect: true });
                    await disconnectWebSocket();
                    connectWebSocket(value);
                    addLog(`Переподключено к устройству ${formatDeviceId(value)}`, 'success');
                } else {
                    setAutoReconnect(false);
                    await updateDeviceSettings(value, { autoReconnect: false });
                    await disconnectWebSocket();
                    addLog(`Устройство ${formatDeviceId(value)} выбрано, но автоматическое переподключение отключено`, 'info');
                }
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Ошибка при смене устройства: ${errorMessage}`, 'error');
        }
    }, [noDevices, selectedDeviceId, inputDe, disconnectWebSocket, connectWebSocket, addLog, setServo1MinAngle, setServo1MaxAngle, setServo2MinAngle, setServo2MaxAngle, updateDeviceSettings, formatDeviceId]);

    const sendCommand = useCallback((co: string, pa?: any) => {
        if (!isIdentified) {
            addLog("Невозможно отправить команду: не идентифицирован", 'error');
            return;
        }

        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const msg = JSON.stringify({
                co,
                pa,
                de,
            });

            socketRef.current.send(msg);
            addLog(`Отправлена команда на ${de}: ${co}`, 'client');

            if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);
            commandTimeoutRef.current = setTimeout(() => {
                if (espConnected) {
                    addLog(`Команда ${co} не подтверждена ESP`, 'error');
                    setEspConnected(false);
                }
            }, 5000);
        } else {
            addLog("WebSocket не готов!", 'error');
        }
    }, [addLog, de, isIdentified, espConnected]);

    const createMotorHandler = useCallback((mo: 'A' | 'B') => {
        const lastCommandRef = mo === 'A' ? lastMotorACommandRef : lastMotorBCommandRef;
        const throttleRef = mo === 'A' ? motorAThrottleRef : motorBThrottleRef;
        const setSpeed = mo === 'A' ? setMotorASpeed : setMotorBSpeed;
        const setDirection = mo === 'A' ? setMotorADirection : setMotorBDirection;

        return (value: number) => {
            if (!isConnected) return;

            let direction: 'forward' | 'backward' | 'stop' = 'stop';
            let sp = 0;

            if (value > 0) {
                direction = 'forward';
                sp = value;
            } else if (value < 0) {
                direction = 'backward';
                sp = -value;
            }

            setSpeed(sp);
            setDirection(direction);

            const currentCommand = { sp, direction };
            if (JSON.stringify(lastCommandRef.current) === JSON.stringify(currentCommand)) {
                return;
            }

            lastCommandRef.current = currentCommand;

            if (sp === 0) {
                if (throttleRef.current) {
                    clearTimeout(throttleRef.current);
                    throttleRef.current = null;
                }
                console.log('Motor Command:', { mo, sp, direction }); // Отладка
                sendCommand("SPD", { mo, sp: 0 });
                sendCommand(mo === 'A' ? "MSA" : "MSB");
                return;
            }

            if (throttleRef.current) {
                clearTimeout(throttleRef.current);
            }

            throttleRef.current = setTimeout(() => {
                console.log('Motor Command:', { mo, sp, direction }); // Отладка
                sendCommand("SPD", { mo, sp });
                sendCommand(direction === 'forward' ? `MF${mo}` : `MR${mo}`);
            }, 40);
        };
    }, [sendCommand, isConnected]);

    const adjustServo = useCallback(
        (servoId: '1' | '2', value: number, isAbsolute: boolean) => {
            const currentAngle = servoId === '1' ? servoAngle : servo2Angle;
            const minAngle = servoId === '1' ? servo1MinAngle : servo2MinAngle;
            const maxAngle = servoId === '1' ? servo1MaxAngle : servo2MaxAngle;

            let newAngle;
            if (isAbsolute) {
                newAngle = Math.max(minAngle, Math.min(maxAngle, value));
            } else {
                newAngle = Math.max(minAngle, Math.min(maxAngle, currentAngle + value));
            }

            sendCommand(servoId === '1' ? 'SSR' : 'SSR2', { an: newAngle });
            addLog(`Установлен угол сервопривода ${servoId}: ${newAngle}°`, 'info');
        },
        [servoAngle, servo2Angle, servo1MinAngle, servo1MaxAngle, servo2MinAngle, servo2MaxAngle, sendCommand, addLog]
    );

    const handleMotorAControl = createMotorHandler('A');
    const handleMotorBControl = createMotorHandler('B');

    const emergencyStop = useCallback(() => {
        sendCommand("SPD", { mo: 'A', sp: 0 });
        sendCommand("SPD", { mo: 'B', sp: 0 });
        setMotorASpeed(0);
        setMotorBSpeed(0);
        setMotorADirection('stop');
        setMotorBDirection('stop');

        if (motorAThrottleRef.current) clearTimeout(motorAThrottleRef.current);
        if (motorBThrottleRef.current) clearTimeout(motorBThrottleRef.current);
    }, [sendCommand]);

    useEffect(() => {
        return () => {
            cleanupWebSocket();
            if (motorAThrottleRef.current) clearTimeout(motorAThrottleRef.current);
            if (motorBThrottleRef.current) clearTimeout(motorBThrottleRef.current);
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        };
    }, [cleanupWebSocket]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isConnected && isIdentified) sendCommand("HBT");
        }, 1000);
        return () => clearInterval(interval);
    }, [isConnected, isIdentified, sendCommand]);

    const handleOpenControls = useCallback(() => {
        setActiveTab(null);
        if (noDevices) {
            addLog('Нет добавленных устройств', 'error');
            return;
        }
        if (!inputDe) {
            addLog('Выберите устройство для подключения', 'error');
            return;
        }
        if (!isConnected) {
            connectWebSocket(inputDe);
            addLog(`Попытка подключения к устройству ${formatDeviceId(inputDe)}`, 'info');
        } else {
            addLog('WebSocket уже подключён', 'info');
        }
    }, [noDevices, inputDe, isConnected, connectWebSocket, addLog, formatDeviceId]);

    const handleCloseControls = () => {
        setActiveTab(activeTab === 'controls' ? null : 'controls');
        setShowJoystickMenu(false);
    };

    const singleValueJoystickComponents = {
        Joystick: Joystick,
        JoystickUp: JoystickUp,
    };

    const dualValueJoystickComponents = {
        JoystickTurn: JoystickVertical,
        JoystickHorizontal: JoystickHorizontal,
        JoyAnalog: JoyAnalog,
    };

    const ActiveJoystick = singleValueJoystickComponents[selectedJoystick as keyof typeof singleValueJoystickComponents] || dualValueJoystickComponents[selectedJoystick as keyof typeof dualValueJoystickComponents];

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-3rem)] p-4 overflow-hidden relative">
            {activeTab === 'controls' && (
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50">
                    <div
                        className="space-y-2 bg-black rounded-lg p-2 sm:p-2 border border-gray-200"
                        style={{ maxHeight: '90vh', overflowY: 'auto' }}
                    >
                        <Button
                            onClick={handleCloseControls}
                            className="absolute top-0 right-1 bg-transparent hover:bg-gray-700/30 p-1 rounded-full transition-all"
                            title="Закрыть"
                        >
                            <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
                        </Button>
                        <div className="flex flex-col items-center space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isConnected
                                    ? (isIdentified
                                        ? (espConnected ? 'bg-green-500' : 'bg-yellow-500')
                                        : 'bg-yellow-500')
                                    : 'bg-red-500'
                                }`}></div>
                                <span className="text-xs sm:text-sm font-medium text-gray-600">
                                    {isConnected
                                        ? (isIdentified
                                            ? (espConnected ? 'Подключено' : 'Ожидание ESP')
                                            : 'Подключение...')
                                        : 'Отключено'}
                                </span>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                onClick={handleOpenControls}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-8 sm:h-10 text-xs sm:text-sm"
                                disabled={noDevices}
                            >
                                Управление
                            </Button>
                            <Button
                                onClick={disconnectWebSocket}
                                disabled={!isConnected}
                                className="flex-1 bg-red-600 hover:bg-red-700 h-8 sm:h-10 text-xs sm:text-sm"
                            >
                                Разъединить
                            </Button>
                        </div>

                        <div className="flex space-x-2">
                            <Select
                                value={selectedDeviceId || inputDe}
                                onValueChange={handleDeviceChange}
                                disabled={isProxy || (isConnected && !autoReconnect)}
                            >
                                <SelectTrigger className="flex-1 bg-transparent h-8 sm:h-10">
                                    <SelectValue placeholder={noDevices ? "Устройства еще не добавлены" : "Выберите устройство"} />
                                </SelectTrigger>
                                <SelectContent className="bg-transparent border border-gray-200">
                                    {deviceList.map(id => (
                                        <SelectItem key={id} value={id} className="hover:bg-gray-100/50 text-xs sm:text-sm">
                                            {formatDeviceId(id)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleDeleteDevice}
                                disabled={isConnected || closedDel || !!selectedDeviceId || noDevices}
                                className="bg-red-600 hover:bg-red-700 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
                            >
                                Удалить
                            </Button>
                        </div>

                        <div className="space-y-1 sm:space-y-2">
                            <Label className="block text-xs sm:text-sm font-medium text-gray-700">Добавить новое устройство</Label>
                            <div className="flex space-x-2">
                                <Input
                                    value={newDe}
                                    disabled={isProxy}
                                    onChange={handleNewDeChange}
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    className="flex-1 bg-transparent h-8 sm:h-10 text-xs sm:text-sm uppercase"
                                    maxLength={19}
                                />
                                <Button
                                    onClick={saveNewDe}
                                    disabled={isAddDisabled || isProxy}
                                    className="bg-blue-600 hover:bg-blue-700 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
                                >
                                    Добавить
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="auto-reconnect"
                                    checked={isProxy ? true : autoReconnect}
                                    onCheckedChange={isProxy ? undefined : toggleAutoReconnect}
                                    className={`border-gray-300 w-4 h-4 sm:w-5 sm:h-5 ${isProxy || autoReconnect ? 'bg-green-500' : 'bg-white'}`}
                                    disabled={noDevices || isProxy}
                                />
                                <Label htmlFor="auto-reconnect" className="text-xs sm:text-sm font-medium text-gray-700">
                                    Автоматическое переподключение при смене устройства
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="auto-connect"
                                    checked={isProxy ? true : autoConnect}
                                    onCheckedChange={isProxy ? undefined : toggleAutoConnect}
                                    className={`border-gray-300 w-4 h-4 sm:w-5 sm:h-5 ${isProxy || autoConnect ? 'bg-green-500' : 'bg-white'}`}
                                    disabled={noDevices || isProxy}
                                />
                                <Label htmlFor="auto-connect" className="text-xs sm:text-sm font-medium text-gray-700">
                                    Автоматическое подключение при загрузке страницы
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="closed-del"
                                    checked={isProxy ? true : closedDel}
                                    onCheckedChange={isProxy ? undefined : toggleClosedDel}
                                    className={`border-gray-300 w-4 h-4 sm:w-5 sm:h-5 ${isProxy || closedDel ? 'bg-green-500' : 'bg-white'}`}
                                    disabled={noDevices || isProxy}
                                />
                                <Label htmlFor="closed-del" className="text-xs sm:text-sm font-medium text-gray-700">
                                    Запретить удаление устройств
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            <Accordion type="single" collapsible>
                                <AccordionItem value="telegram-settings">
                                    <AccordionTrigger className="text-xs sm:text-sm font-medium text-gray-700">
                                        Настройки Telegram
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-2">
                                            <div>
                                                <Label htmlFor="telegram-token" className="text-xs sm:text-sm">Telegram Token</Label>
                                                <Input
                                                    id="telegram-token"
                                                    type="text"
                                                    value={telegramTokenInput}
                                                    onChange={(e) => setTelegramTokenInput(e.target.value)}
                                                    onPaste={(e) => handleTelegramPaste(e, 'telegramToken')}
                                                    onBlur={handleTelegramInputBlur}
                                                    placeholder="Введите токен"
                                                    className="bg-gray-700 text-white border-gray-600 h-8 sm:h-10 text-xs sm:text-sm"
                                                    disabled={noDevices || isProxy}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="telegram-id" className="text-xs sm:text-sm">Telegram ID</Label>
                                                <Input
                                                    id="telegram-id"
                                                    type="text"
                                                    value={telegramIdInput}
                                                    onChange={(e) => setTelegramIdInput(e.target.value)}
                                                    onPaste={(e) => handleTelegramPaste(e, 'telegramId')}
                                                    onBlur={handleTelegramInputBlur}
                                                    placeholder="Введите ID"
                                                    className="bg-gray-700 text-white border-gray-600 h-8 sm:h-10 text-xs sm:text-sm"
                                                    disabled={noDevices || isProxy}
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            <Label className="block text-xs sm:text-sm font-medium text-gray-700">Настройки сервоприводов</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="servo1-min" className="text-xs sm:text-sm">Servo 1 Min (°)</Label>
                                    <Input
                                        type="text"
                                        value={servo1MinInput}
                                        onChange={(e) => handleServoInputChange(setServo1MinInput, e.target.value)}
                                        onBlur={(e) => handleServoInputBlur('servo1Min', e.target.value)}
                                        placeholder="0"
                                        className="bg-gray-700 text-white border-gray-600"
                                        disabled={noDevices || isProxy}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="servo1-max" className="text-xs sm:text-sm">Servo 1 Max (°)</Label>
                                    <Input
                                        type="text"
                                        value={servo1MaxInput}
                                        onChange={(e) => handleServoInputChange(setServo1MaxInput, e.target.value)}
                                        onBlur={(e) => handleServoInputBlur('servo1Max', e.target.value)}
                                        placeholder="0"
                                        className={`bg-gray-700 text-white border-gray-600 ${parseInt(servo1MaxInput || '0') < servo1MinAngle ? 'border-red-500' : ''}`}
                                        disabled={noDevices || isProxy}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="servo2-min" className="text-xs sm:text-sm">Servo 2 Min (°)</Label>
                                    <Input
                                        type="text"
                                        value={servo2MinInput}
                                        onChange={(e) => handleServoInputChange(setServo2MinInput, e.target.value)}
                                        onBlur={(e) => handleServoInputBlur('servo2Min', e.target.value)}
                                        placeholder="0"
                                        className="bg-gray-700 text-white border-gray-600"
                                        disabled={noDevices || isProxy}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="servo2-max" className="text-xs sm:text-sm">Servo 2 Max (°)</Label>
                                    <Input
                                        type="text"
                                        value={servo2MaxInput}
                                        onChange={(e) => handleServoInputChange(setServo2MaxInput, e.target.value)}
                                        onBlur={(e) => handleServoInputBlur('servo2Max', e.target.value)}
                                        placeholder="0"
                                        className={`bg-gray-700 text-white border-gray-600 ${parseInt(servo2MaxInput || '0') < servo2MinAngle ? 'border-red-500' : ''}`}
                                        disabled={noDevices || isProxy}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => setLogVisible(!logVisible)}
                            variant="outline"
                            className="w-full border-gray-300 bg-transparent hover:bg-gray-100/50 h-8 sm:h-10 text-xs sm:text-sm"
                        >
                            {logVisible ? (
                                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            ) : (
                                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            )}
                            {logVisible ? "Скрыть логи" : "Показать логи"}
                        </Button>

                        {logVisible && (
                            <div className="border border-gray-200 rounded-md overflow-hidden bg-transparent">
                                <div className="h-32 sm:h-48 overflow-y-auto p-2 bg-transparent text-xs font-mono">
                                    {log.length === 0 ? (
                                        <div className="text-gray-500 italic">Логов пока нет</div>
                                    ) : (
                                        log.slice().reverse().map((entry, index) => (
                                            <div
                                                key={index}
                                                className={`truncate py-1 ${entry.ty === 'client' ? 'text-blue-600' :
                                                    entry.ty === 'esp' ? 'text-green-600' :
                                                        entry.ty === 'server' ? 'text-purple-600' :
                                                            entry.ty === 'success' ? 'text-teal-600' :
                                                                entry.ty === 'info' ? 'text-gray-600' :
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
                </div>
            )}

            <div className={`mt-24 ${activeTab === 'controls' ? 'opacity-50' : ''}`}>
                {selectedJoystick === 'Joystick' || selectedJoystick === 'JoystickUp' ? (
                    <>
                        <ActiveJoystick
                            mo="A"
                            onChange={handleMotorAControl}
                            direction={motorADirection}
                            sp={motorASpeed}
                            disabled={!isConnected}
                        />
                        <ActiveJoystick
                            mo="B"
                            onChange={handleMotorBControl}
                            direction={motorBDirection}
                            sp={motorBSpeed}
                            disabled={!isConnected}
                        />
                    </>
                ) : selectedJoystick === 'JoystickTurn' ? (
                    <>
                        <JoystickVertical
                            onChange={({ x, y }) => {
                                handleMotorAControl(x);
                                handleMotorBControl(y);
                            }}
                            direction={motorADirection}
                            sp={motorASpeed}
                            disabled={!isConnected}
                        />
                        <JoystickHorizontal
                            onChange={({ x, y }) => {
                                handleMotorAControl(x);
                                handleMotorBControl(y);
                            }}
                            disabled={!isConnected}
                        />
                    </>
                ) : selectedJoystick === 'JoyAnalog' ? (
                    <JoyAnalog
                        onChange={({ x, y }) => {
                            handleMotorAControl(x);
                            handleMotorBControl(y);
                        }}
                        onServoChange={adjustServo}
                        disabled={!isConnected}
                    />
                ) : null}
                {isDeviceOrientationSupported && isVirtualBoxActive && (
                    <VirtualBox
                        ref={virtualBoxRef}
                        onServoChange={adjustServo}
                        onOrientationChange={handleOrientationChange}
                        disabled={!isConnected}
                        isVirtualBoxActive={isVirtualBoxActive}
                    />
                )}

                <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex flex-col space-y-2 z-50">
                    {showServos && (
                        <>
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center space-x-2">
                                    <span className="text-sm font-medium text-green-300 mt-1">{servoAngle}°</span>
                                    <span className="text-sm font-medium text-green-300 mt-1">{servo2Angle}°</span>
                                </div>

                                <div className="flex items-center justify-center space-x-2">
                                    <Button
                                        onClick={() => adjustServo('1', 0, true)}
                                        className="bg-transparent hover:bg-gray-700/30 p-2 rounded-full transition-all flex items-center"
                                    >
                                        <img width={'25px'} height={'25px'} src="/arrow/twotone-keyboard-double-arrow-down.svg" alt="0°" />
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('1', -15, false)}
                                        className="bg-transparent hover:bg-gray-700/30 p-2 rounded-full transition-all flex items-center"
                                    >
                                        <img width={'25px'} height={'25px'} src="/arrow/arrow-down-2-thin.svg" alt="-15°" />
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('1', 90, true)}
                                        className="bg-transparent hover:bg-gray-700/30 p-2 rounded-full transition-all flex items-center"
                                    >
                                        <img width={'25px'} height={'25px'} src="/arrow/two-arrow-in-down-up.svg" alt="90°" />
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('1', 15, false)}
                                        className="bg-transparent hover:bg-gray-700/30 p-2 rounded-full transition-all flex items-center"
                                    >
                                        <img width={'25px'} height={'25px'} src="/arrow/arrow-up-2.svg" alt="+15°" />
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('1', 180, true)}
                                        className="bg-transparent hover:bg-gray-700/30 p-2 rounded-full transition-all flex items-center"
                                    >
                                        <img width={'25px'} height={'25px'} src="/arrow/twotone-keyboard-double-arrow-up.svg" alt="180°" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center space-x-2">
                                    <Button
                                        onClick={() => adjustServo('2', 180, true)}
                                        className="bg-transparent hover:bg-gray-700/30 p-2 rounded-full transition-all flex items-center"
                                    >
                                        <img width={'25px'} height={'25px'} src="/arrow/twotone-keyboard-double-arrow-left.svg" />
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('2', 15, false)}
                                        className="bg-transparent hover:bg-gray-700/30 p-2 rounded-full transition-all flex items-center"
                                    >
                                        <img width={'25px'} height={'25px'} src="/arrow/arrow-left-2.svg" alt="+15°" />
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('2', 90, true)}
                                        className="bg-transparent hover:bg-gray-700/30 p-2 rounded-full transition-all flex items-center"
                                    >
                                        <img width={'25px'} height={'25px'} src="/arrow/two-arrow-in-left-right.svg" />
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('2', -15, false)}
                                        className="bg-transparent hover:bg-gray-700/30 p-2 rounded-full transition-all flex items-center"
                                    >
                                        <img width={'25px'} height={'25px'} src="/arrow/arrow-right-2.svg" alt="-15°" />
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('2', 0, true)}
                                        className="bg-transparent hover:bg-gray-700/30 p-2 rounded-full transition-all flex items-center"
                                    >
                                        <img width={'25px'} height={'25px'} src="/arrow/twotone-keyboard-double-arrow-right.svg" alt="180°" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="flex items-center justify-center space-x-2">
                        {inputVoltage !== null && button2State ? (
                            <span className="text-xl font-medium text-green-600 bg-transparent rounded-full flex items-center justify-center">
                                {inputVoltage.toFixed(2)}
                            </span>
                        ) : (
                            <span className="text-xl font-medium text-green-600 bg-transparent rounded-full flex items-center justify-center">
                                {inputVoltage !== null && inputVoltage < 1 ? <span>Motion</span> : <span>Alarm</span>}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                        {button1State !== null && (
                            <Button
                                onClick={() => {
                                    const newState = button1State ? 'off' : 'on';
                                    sendCommand('RLY', { pin: 'D0', state: newState });
                                }}
                                className="bg-transparent hover:bg-gray-700/30 border border-gray-600 p-2 rounded-full transition-all flex items-center"
                            >
                                {button1State ? (
                                    <img width={'25px'} height={'25px'} src="/off.svg" alt="Image" />
                                ) : (
                                    <img width={'25px'} height={'25px'} src="/on.svg" alt="Image" />
                                )}
                            </Button>
                        )}

                        {button2State !== null && isProxySocket === false && (
                            <Button
                                onClick={() => {
                                    const newState = button2State ? 'off' : 'on';
                                    sendCommand('RLY', { pin: '3', state: newState });
                                }}
                                className="bg-transparent hover:bg-gray-700/30 border border-gray-600 p-2 rounded-full transition-all flex items-center"
                            >
                                {button2State ? (
                                    <img width={'25px'} height={'25px'} src="/off.svg" alt="Image" />
                                ) : (
                                    <img width={'25px'} height={'25px'} src="/on.svg" alt="Image" />
                                )}
                            </Button>
                        )}

                        <Button
                            onClick={() => setActiveTab(activeTab === 'controls' ? null : 'controls')}
                            className="bg-transparent hover:bg-gray-700/30 border border-gray-600 p-2 rounded-full transition-all flex items-center"
                            title="Настройки"
                        >
                            {activeTab === 'controls' ? (
                                <img width={'25px'} height={'25px'} src="/settings2.svg" alt="Image" />
                            ) : (
                                <img width={'25px'} height={'25px'} src="/settings1.svg" alt="Image" />
                            )}
                        </Button>

                        <Button
                            onClick={toggleServosVisibility}
                            className="bg-transparent hover:bg-gray-700/30 border border-gray-600 p-2 rounded-full transition-all flex items-center"
                            title={showServos ? 'Скрыть сервоприводы' : 'Показать сервоприводы'}
                        >
                            {showServos ? (
                                <img width={'25px'} height={'25px'} src="/turn2.svg" alt="Image" />
                            ) : (
                                <img width={'25px'} height={'25px'} src="/turn1.svg" alt="Image" />
                            )}
                        </Button>

                        <div className="relative">
                            <Button
                                onClick={() => {
                                    setShowJoystickMenu(!showJoystickMenu);
                                }}
                                className={`bg-transparent hover:bg-gray-700/30 border ${isVirtualBoxActive ? 'border-green-500' : 'border-gray-600'} p-0 rounded-full transition-all flex items-center`}
                                title={showJoystickMenu ? 'Скрыть выбор джойстика' : 'Показать выбор джойстика'}
                            >
                                <img
                                    width={'40px'}
                                    height={'40px'}
                                    className="object-contain"
                                    src={
                                        selectedJoystick === 'JoystickTurn' ? '/control/arrows-turn.svg' :
                                            selectedJoystick === 'Joystick' ? '/control/arrows-down.svg' :
                                                selectedJoystick === 'JoystickUp' ? '/control/arrows-up.svg' :
                                                    selectedJoystick === 'JoyAnalog' ? '/control/xbox-controller.svg' :
                                                        isVirtualBoxActive ? '/control/axis-arrow.svg' : '/control/axis-arrow.svg'
                                    }
                                    alt="Joystick Select"
                                />
                            </Button>
                            {showJoystickMenu && (
                                <div className="absolute bottom-12 bg-black rounded-lg border border-gray-200 z-150">
                                    <div className="flex flex-col items-center">
                                        <Button
                                            onClick={() => {
                                                setSelectedJoystick('Joystick');
                                                setShowJoystickMenu(false);
                                            }}
                                            className="bg-transparent hover:bg-gray-700/30 rounded-full transition-all flex items-center p-0 z-155"
                                        >
                                            <img width={'60px'} height={'60px'} className="object-contain" src="/control/arrows-down.svg" alt="Down Joystick" />
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setSelectedJoystick('JoystickUp');
                                                setShowJoystickMenu(false);
                                            }}
                                            className="bg-transparent hover:bg-gray-700/30 rounded-full transition-all flex items-center p-0 z-155"
                                        >
                                            <img width={'60px'} height={'60px'} className="object-contain" src="/control/arrows-up.svg" alt="Up Joystick" />
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setSelectedJoystick('JoystickTurn');
                                                setShowJoystickMenu(false);
                                            }}
                                            className="bg-transparent hover:bg-gray-700/30 rounded-full transition-all flex items-center p-0 z-155"
                                        >
                                            <img width={'60px'} height={'60px'} className="object-contain" src="/control/arrows-turn.svg" alt="Turn Joystick" />
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setSelectedJoystick('JoyAnalog');
                                                setShowJoystickMenu(false);
                                            }}
                                            className="bg-transparent hover:bg-gray-700/30 rounded-full transition-all flex items-center p-0 z-155"
                                        >
                                            <img width={'60px'} height={'60px'} className="object-contain" src="/control/xbox-controller.svg" alt="Xbox Joystick" />
                                        </Button>

                                        {isDeviceOrientationSupported && (
                                            <Button
                                                onClick={() => {
                                                    setIsVirtualBoxActive((prev) => !prev);
                                                    setShowJoystickMenu(false);
                                                }}
                                                className={`bg-transparent hover:bg-gray-700/30 rounded-full transition-all flex items-center p-0 ${isVirtualBoxActive ? 'border-2 border-green-500' : ''}`}
                                            >
                                                <img
                                                    width={'60px'}
                                                    height={'60px'}
                                                    className="object-contain"
                                                    src="/control/axis-arrow.svg"
                                                    alt="Gyroscope"
                                                />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Новый элемент для отображения данных ориентации */}
                    {isVirtualBoxActive && orientationData.beta !== null && orientationData.gamma !== null && (
                        <div className="fixed bottom-3 right-4 flex items-center justify-center z-50">
                        <span className="text-sm font-medium text-green-300 bg-black/50 px-2 py-1 rounded">
                            X: {orientationData.beta.toFixed(2)}° Y: {orientationData.gamma.toFixed(2)}°
                        </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}