// file: components/control/SocketClient.tsx
"use client"
import {useState, useEffect, useRef, useCallback} from 'react'
import {Button} from "@/components/ui/button"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Input} from "@/components/ui/input"
import {ChevronDown, ChevronUp, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X} from "lucide-react"
import {Checkbox} from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label"
import Joystick from '@/components/control/Joystick'
import {useServo} from '@/components/ServoContext';
import {
    getDevices,
    addDevice,
    deleteDevice,
    updateDeviceSettings,
    updateServoSettings,
    sendDeviceSettingsToESP
} from '@/app/actions';

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
}

export default function SocketClient({onConnectionStatusChange, selectedDeviceId}: SocketClientProps) {
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
    const [noDevices, setNoDevices] = useState(true) // Новое состояние для отслеживания отсутствия устройств
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
    const [activeTab, setActiveTab] = useState<'esp' | 'controls' | null>('esp');

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

    const [isProxy, setIsProxy] = useState(false);

    useEffect(() => {
        setIsProxy(!!selectedDeviceId);
    }, [selectedDeviceId]);

    const addLog = useCallback((msg: string, ty: LogEntry['ty']) => {
        setLog(prev => [...prev.slice(-100), {me: `${new Date().toLocaleTimeString()}: ${msg}`, ty}]);
    }, []);

    // Загрузка устройств и настроек из базы данных
    useEffect(() => {
        const loadDevices = async () => {
            try {
                const devices = await getDevices();
                setDeviceList(devices.map(d => d.idDevice));
                // Устанавливаем noDevices в false, если есть хотя бы одно устройство
                setNoDevices(devices.length === 0);
                if (devices.length > 0) {
                    const device = devices[0];
                    setInputDe(device.idDevice);
                    setDe(device.idDevice);
                    currentDeRef.current = device.idDevice;
                    setAutoReconnect(device.autoReconnect ?? false);
                    setAutoConnect(device.autoConnect ?? false);
                    setClosedDel(device.closedDel ?? false);
                    if (device.settings) {
                        setServo1MinAngle(device.settings.servo1MinAngle || 0);
                        setServo1MaxAngle(device.settings.servo1MaxAngle || 180);
                        setServo2MinAngle(device.settings.servo2MinAngle || 0);
                        setServo2MaxAngle(device.settings.servo2MaxAngle || 180);
                        setButton1State(device.settings.b1 ?? false);
                        setButton2State(device.settings.b2 ?? false);
                        setShowServos(device.settings.servoView ?? true);
                        setServo1MinInput((device.settings.servo1MinAngle || 0).toString());
                        setServo1MaxInput((device.settings.servo1MaxAngle || 180).toString());
                        setServo2MinInput((device.settings.servo2MinAngle || 0).toString());
                        setServo2MaxInput((device.settings.servo2MaxAngle || 180).toString());
                    }
                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                        const settings = await sendDeviceSettingsToESP(device.idDevice);
                        socketRef.current.send(JSON.stringify({
                            co: 'SET_SERVO1_LIMITS',
                            pa: {min: settings.servo1MinAngle, max: settings.servo1MaxAngle},
                            de: device.idDevice,
                            ts: Date.now(),
                            expectAck: true
                        }));
                        socketRef.current.send(JSON.stringify({
                            co: 'SET_SERVO2_LIMITS',
                            pa: {min: settings.servo2MinAngle, max: settings.servo2MaxAngle},
                            de: device.idDevice,
                            ts: Date.now(),
                            expectAck: true
                        }));
                        socketRef.current.send(JSON.stringify({
                            co: 'SET_SERVO_VIEW',
                            pa: {visible: settings.servoView},
                            de: device.idDevice,
                            ts: Date.now(),
                            expectAck: true
                        }));
                    }
                    if (device.autoConnect) {
                        connectWebSocket(device.idDevice);
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
            // Разрешаем ввод любых цифр или пустую строку, но не больше 180
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

                // Ограничиваем значения до 180
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
                    await updateServoSettings(inputDe, updateData);
                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                        if (field === 'servo1Min' || field === 'servo1Max') {
                            socketRef.current.send(JSON.stringify({
                                co: 'SET_SERVO1_LIMITS',
                                pa: {min: servo1MinAngle, max: servo1MaxAngle},
                                de: inputDe,
                                ts: Date.now(),
                                expectAck: true
                            }));
                        } else {
                            socketRef.current.send(JSON.stringify({
                                co: 'SET_SERVO2_LIMITS',
                                pa: {min: servo2MinAngle, max: servo2MaxAngle},
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

    useEffect(() => {
        const isFullyConnected = isConnected && isIdentified && espConnected;
        onConnectionStatusChange?.(isFullyConnected);
    }, [isConnected, isIdentified, espConnected, onConnectionStatusChange]);

    // Обработчики для настроек устройства
    const toggleAutoReconnect = useCallback(async (checked: boolean) => {
        setAutoReconnect(checked);
        try {
            await updateDeviceSettings(inputDe, {autoReconnect: checked});
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
            await updateDeviceSettings(inputDe, {autoConnect: checked});
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
            await updateDeviceSettings(inputDe, {closedDel: checked});
            addLog(`Запрет удаления: ${checked ? 'включен' : 'выключен'}`, 'success');
        } catch (error: unknown) {
            setClosedDel(!checked);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Ошибка сохранения closedDel: ${errorMessage}`, 'error');
        }
    }, [inputDe, addLog]);

    // Форматирование и очистка ID устройства
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

    // Добавление нового устройства
    const saveNewDe = useCallback(async () => {
        const cleanId = cleanDeviceId(newDe);
        if (cleanId.length === 16 && !deviceList.includes(cleanId)) {
            try {
                await addDevice(cleanId, autoConnect, autoReconnect, closedDel);
                setDeviceList(prev => [...prev, cleanId]);
                setInputDe(cleanId);
                setDe(cleanId);
                setNoDevices(false); // Устройство добавлено, сбрасываем флаг
                setNewDe('');
                currentDeRef.current = cleanId;
                addLog(`Устройство ${cleanId} добавлено`, 'success');
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                addLog(`Ошибка добавления устройства: ${errorMessage}`, 'error');
            }
        }
    }, [newDe, deviceList, autoConnect, autoReconnect, closedDel, addLog]);

    // Удаление устройства
    const handleDeleteDevice = useCallback(async () => {
        if (!closedDel && confirm("Удалить устройство?")) {
            try {
                await deleteDevice(inputDe);
                const updatedList = deviceList.filter(id => id !== inputDe);
                setDeviceList(updatedList);
                setNoDevices(updatedList.length === 0); // Обновляем флаг
                const defaultDevice = updatedList.length > 0 ? updatedList[0] : '';
                setInputDe(defaultDevice);
                setDe(defaultDevice);
                currentDeRef.current = defaultDevice;
                addLog(`Устройство ${inputDe} удалено`, 'success');
            } catch (error: unknown) {
                console.error('Ошибка при удалении устройства:', error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                addLog(`Ошибка: ${errorMessage}`, 'error');
            }
        }
    }, [inputDe, deviceList, closedDel, addLog]);

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
                    pa: {visible: newState},
                    de: inputDe,
                    ts: Date.now(),
                    expectAck: true
                }));
            }
            await updateServoSettings(inputDe, {servoView: newState});
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

            ws.send(JSON.stringify({ty: "clt", ct: "browser"}));
            ws.send(JSON.stringify({ty: "idn", de: deToConnect}));
            ws.send(JSON.stringify({co: "GET_RELAYS", de: deToConnect, ts: Date.now()}));

            sendDeviceSettingsToESP(deToConnect)
                .then(settings => {
                    if (ws.readyState === WebSocket.OPEN) {
                        if (settings.servo1MinAngle !== undefined && settings.servo1MaxAngle !== undefined) {
                            ws.send(
                                JSON.stringify({
                                    co: 'SET_SERVO1_LIMITS',
                                    pa: {min: settings.servo1MinAngle, max: settings.servo1MaxAngle},
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
                                    pa: {min: settings.servo2MinAngle, max: settings.servo2MaxAngle},
                                    de: deToConnect,
                                    ts: Date.now(),
                                    expectAck: true,
                                })
                            );
                        }
                        ws.send(
                            JSON.stringify({
                                co: 'SET_SERVO_VIEW',
                                pa: {visible: settings.servoView},
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
                            updateServoSettings(deToConnect, {b1: newState}).catch((error: unknown) => {
                                const errorMessage = error instanceof Error ? error.message : String(error);
                                addLog(`Ошибка сохранения b1: ${errorMessage}`, 'error');
                            });
                            addLog(`Реле 1 (D0) ${newState ? 'включено' : 'выключено'}`, 'esp');
                        } else if (data.pa.pin === '3') {
                            const newState = data.pa.state === 'on';
                            setButton2State(newState);
                            updateServoSettings(deToConnect, {b2: newState}).catch((error: unknown) => {
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
                        updateServoSettings(deToConnect, {b1: newState}).catch((error: unknown) => {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            addLog(`Ошибка сохранения b1: ${errorMessage}`, 'error');
                        });
                        addLog(`Реле 1 (D0): ${newState ? 'включено' : 'выключено'}`, 'esp');
                    }
                    if (data.b2 !== undefined) {
                        const newState = data.b2 === 'on';
                        setButton2State(newState);
                        updateServoSettings(deToConnect, {b2: newState}).catch((error: unknown) => {
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

    // Определение disconnectWebSocket
    const disconnectWebSocket = useCallback(() => {
        return new Promise<void>((resolve) => {
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
            resolve();
        });
    }, [addLog, cleanupWebSocket]);

    // useEffect для переподключения при смене selectedDeviceId
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
            return; // Игнорируем, если выбрано то же устройство
        }
        setInputDe(value);
        currentDeRef.current = value;
        try {
            const devices = await getDevices();
            const selectedDevice = devices.find(device => device.idDevice === value);
            if (selectedDevice) {
                setAutoReconnect(selectedDevice.autoReconnect ?? false);
                setAutoConnect(selectedDevice.autoConnect ?? false);
                setClosedDel(selectedDevice.closedDel ?? false);
                if (selectedDevice.settings) {
                    setServo1MinAngle(selectedDevice.settings.servo1MinAngle || 0);
                    setServo1MaxAngle(selectedDevice.settings.servo1MaxAngle || 180);
                    setServo2MinAngle(selectedDevice.settings.servo2MinAngle || 0);
                    setServo2MaxAngle(selectedDevice.settings.servo2MaxAngle || 180);
                    setButton1State(selectedDevice.settings.b1 ?? false);
                    setButton2State(selectedDevice.settings.b2 ?? false);
                    setShowServos(selectedDevice.settings.servoView ?? true);
                    setServo1MinInput((selectedDevice.settings.servo1MinAngle || 0).toString());
                    setServo1MaxInput((selectedDevice.settings.servo1MaxAngle || 180).toString());
                    setServo2MinInput((selectedDevice.settings.servo2MinAngle || 0).toString());
                    setServo2MaxInput((selectedDevice.settings.servo2MaxAngle || 180).toString());
                }
                if (autoReconnect) {
                    await disconnectWebSocket();
                    connectWebSocket(value);
                }
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Ошибка при смене устройства: ${errorMessage}`, 'error');
        }
    }, [noDevices, selectedDeviceId, inputDe, autoReconnect, disconnectWebSocket, connectWebSocket, addLog, setServo1MinAngle, setServo1MaxAngle, setServo2MinAngle, setServo2MaxAngle]);

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
                ts: Date.now(),
                expectAck: true
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

    const adjustServo = useCallback(
        (servoId: '1' | '2', delta: number) => {
            const currentAngle = servoId === '1' ? servoAngle : servo2Angle;
            const minAngle = servoId === '1' ? servo1MinAngle : servo2MinAngle;
            const maxAngle = servoId === '1' ? servo1MaxAngle : servo2MaxAngle;

            const newAngle = Math.max(minAngle, Math.min(maxAngle, currentAngle + delta));

            if (newAngle === currentAngle) {
                addLog(`Угол сервопривода ${servoId} не изменён: в пределах ${minAngle}-${maxAngle}`, 'error');
                return;
            }

            sendCommand(servoId === '1' ? 'SSR' : 'SSR2', {an: newAngle});
        },
        [servoAngle, servo2Angle, servo1MinAngle, servo1MaxAngle, servo2MinAngle, servo2MaxAngle, sendCommand, addLog]
    );

    const handleMotorAControl = createMotorHandler('A');
    const handleMotorBControl = createMotorHandler('B');

    const emergencyStop = useCallback(() => {
        sendCommand("SPD", {mo: 'A', sp: 0});
        sendCommand("SPD", {mo: 'B', sp: 0});
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

    const handleOpenControls = () => {
        setActiveTab(null);
    };

    const handleCloseControls = () => {
        setActiveTab(activeTab === 'controls' ? null : 'controls');
    };

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-3rem)] p-4 overflow-hidden relative">
            {activeTab === 'controls' && (
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50">
                    <div
                        className="space-y-2 bg-black rounded-lg p-2 sm:p-2 border border-gray-200 backdrop-blur-sm"
                        style={{maxHeight: '90vh', overflowY: 'auto'}}
                    >
                        <Button
                            onClick={handleCloseControls}
                            className="absolute top-0 right-1 bg-transparent hover:bg-gray-700/30 backdrop-blur-sm p-1 rounded-full transition-all"
                            title="Закрыть"
                        >
                            <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
                        </Button>
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
                                            ? (espConnected ? 'Подключено' : 'Ожидание ESP')
                                            : 'Подключение...')
                                        : 'Отключено'}
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={handleOpenControls}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 h-8 sm:h-10 text-xs sm:text-sm"
                        >
                            Управление
                        </Button>

                        <div className="flex space-x-2">
                            <Select
                                value={selectedDeviceId || inputDe}
                                onValueChange={handleDeviceChange}
                                disabled={isProxy || (isConnected && !autoReconnect)}
                            >
                                <SelectTrigger className="flex-1 bg-transparent h-8 sm:h-10">
                                    <SelectValue placeholder={noDevices ? "Устройства еще не добавлены" : "Выберите устройство"} />
                                </SelectTrigger>
                                <SelectContent className="bg-transparent backdrop-blur-sm border border-gray-200">
                                    {deviceList.map(id => (
                                        <SelectItem key={id} value={id} className="hover:bg-gray-100/50 text-xs sm:text-sm">
                                            {formatDeviceId(id)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleDeleteDevice}
                                disabled={closedDel || !!selectedDeviceId} // Удаляем noDevices из условия
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
                                    onChange={handleNewDeChange}
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    className="flex-1 bg-transparent h-8 sm:h-10 text-xs sm:text-sm uppercase"
                                    maxLength={19}
                                />
                                <Button
                                    onClick={saveNewDe}
                                    disabled={isAddDisabled}
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
                                    disabled={isProxy}
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
                                    disabled={isProxy}
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
                                    disabled={isProxy}
                                />
                                <Label htmlFor="closed-del" className="text-xs sm:text-sm font-medium text-gray-700">
                                    Запретить удаление устройств
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            <Label className="block text-xs sm:text-sm font-medium text-gray-700">Настройки
                                сервоприводов</Label>
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
                                        disabled={isProxy}
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
                                        disabled={isProxy}
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
                                        disabled={isProxy}
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
                                        disabled={isProxy}
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
                                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-2"/>
                            ) : (
                                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-2"/>
                            )}
                            {logVisible ? "Скрыть логи" : "Показать логи"}
                        </Button>

                        {logVisible && (
                            <div
                                className="border border-gray-200 rounded-md overflow-hidden bg-transparent backdrop-blur-sm">
                                <div className="h-32 sm:h-48 overflow-y-auto p-2 bg-transparent text-xs font-mono">
                                    {log.length === 0 ? (
                                        <div className="text-gray-500 italic">Логов пока нет</div>
                                    ) : (
                                        log.slice().reverse().map((entry, index) => (
                                            <div
                                                key={index}
                                                className={`truncate py-1 ${
                                                    entry.ty === 'client' ? 'text-blue-600' :
                                                        entry.ty === 'esp' ? 'text-green-600' :
                                                            entry.ty === 'server' ? 'text-purple-600' :
                                                                entry.ty === 'success' ? 'text-teal-600' :
                                                                    entry.ty === 'info' ? 'text-gray-600' : // Новый стиль для 'info'
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
                    {showServos && (
                        <>
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center space-x-2">
                                    <Button
                                        onClick={() => adjustServo('1', -180)}
                                        className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full transition-all"
                                    >
                                        <ArrowLeft className="h-5 w-5"/>
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('1', -15)}
                                        className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                    >
                                        <ArrowDown className="h-5 w-5"/>
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('1', 15)}
                                        className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                    >
                                        <ArrowUp className="h-5 w-5"/>
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('1', 180)}
                                        className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                    >
                                        <ArrowRight className="h-5 w-5"/>
                                    </Button>
                                </div>
                                <span className="text-sm font-medium text-gray-700 mt-1">{servoAngle}°</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center space-x-2">
                                    <Button
                                        onClick={() => adjustServo('2', -180)}
                                        className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                    >
                                        <ArrowLeft className="h-5 w-5"/>
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('2', -15)}
                                        className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                    >
                                        <ArrowDown className="h-5 w-5"/>
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('2', 15)}
                                        className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                    >
                                        <ArrowUp className="h-5 w-5"/>
                                    </Button>
                                    <Button
                                        onClick={() => adjustServo('2', 180)}
                                        className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                    >
                                        <ArrowRight className="h-5 w-5"/>
                                    </Button>
                                </div>
                                <span className="text-sm font-medium text-gray-700 mt-1">{servo2Angle}°</span>
                            </div>
                        </>
                    )}

                    {inputVoltage !== null && (
                        <span
                            className="text-xl font-medium text-green-600 bg-transparent rounded-full flex items-center justify-center"
                        >
                            {inputVoltage.toFixed(2)}
                        </span>
                    )}

                    <div className="flex items-center justify-center space-x-2">
                        {button1State !== null && (
                            <Button
                                onClick={() => {
                                    const newState = button1State ? 'off' : 'on';
                                    sendCommand('RLY', {pin: 'D0', state: newState});
                                }}
                                className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full transition-all flex items-center"
                            >
                                {button1State ? (
                                    <img width={'25px'} height={'25px'} src="/off.svg" alt="Image"/>
                                ) : (
                                    <img width={'25px'} height={'25px'} src="/on.svg" alt="Image"/>
                                )}
                            </Button>
                        )}

                        {button2State !== null && (
                            <Button
                                onClick={() => {
                                    const newState = button2State ? 'off' : 'on';
                                    sendCommand('RLY', {pin: '3', state: newState});
                                    // Не обновляем состояние локально, ждём ответа сервера
                                }}
                                className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full transition-all flex items-center"
                            >
                                {button2State ? (
                                    <img width={'25px'} height={'25px'} src="/off.svg" alt="Image"/>
                                ) : (
                                    <img width={'25px'} height={'25px'} src="/on.svg" alt="Image"/>
                                )}
                            </Button>
                        )}

                        {showServos !== null && (
                            <Button
                                onClick={toggleServosVisibility}
                                className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full transition-all flex items-center"
                                title={showServos ? 'Скрыть сервоприводы' : 'Показать сервоприводы'}
                            >
                                {showServos ? (
                                    <img width={'25px'} height={'25px'} src="/turn2.svg" alt="Image"/>
                                ) : (
                                    <img width={'25px'} height={'25px'} src="/turn1.svg" alt="Image"/>
                                )}
                            </Button>
                        )}

                        <Button
                            onClick={handleCloseControls}
                            className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full transition-all flex items-center"
                        >
                            {activeTab === 'controls' ? (
                                <img width={'25px'} height={'25px'} src="/settings2.svg" alt="Image"/>
                            ) : (
                                <img width={'25px'} height={'25px'} src="/settings1.svg" alt="Image"/>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}