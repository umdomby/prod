"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import Joystick from '@/components/control/Joystick';
import { useServo } from '@/components/ServoContext';
import { getDeviceSettings } from '@/app/actions';

type MessageType = {
    ty?: string;
    sp?: string;
    co?: string;
    de?: string;
    me?: string;
    mo?: string;
    pa?: any;
    clientId?: number;
    st?: string;
    ts?: string;
    or?: 'client' | 'esp' | 'server' | 'error';
    re?: string;
    b1?: string;
    b2?: string;
    sp1?: string;
    sp2?: string;
    z?: string;
};

type LogEntry = {
    me: string;
    ty: 'client' | 'esp' | 'server' | 'error' | 'success' | 'info';
};

interface NoRegSocketClientProps {
    idDevice: string;
}

export default function NoRegSocketClient({ idDevice }: NoRegSocketClientProps) {
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
        setShowServos,
    } = useServo();

    const [log, setLog] = useState<LogEntry[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isIdentified, setIsIdentified] = useState(false);
    const [espConnected, setEspConnected] = useState(false);
    const [logVisible, setLogVisible] = useState(false);
    const [motorASpeed, setMotorASpeed] = useState(0);
    const [motorBSpeed, setMotorBSpeed] = useState(0);
    const [motorADirection, setMotorADirection] = useState<'forward' | 'backward' | 'stop'>('stop');
    const [motorBDirection, setMotorBDirection] = useState<'forward' | 'backward' | 'stop'>('stop');
    const [button1State, setButton1State] = useState<boolean | null>(null);
    const [button2State, setButton2State] = useState<boolean | null>(null);
    const [showServos, setShowServosState] = useState<boolean | null>(null);
    const [inputVoltage, setInputVoltage] = useState<number | null>(null);

    const lastHeartbeatLogTime = useRef<number>(0);
    const reconnectAttemptRef = useRef(0);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastMotorACommandRef = useRef<{ sp: number; direction: 'forward' | 'backward' | 'stop' } | null>(null);
    const lastMotorBCommandRef = useRef<{ sp: number; direction: 'forward' | 'backward' | 'stop' } | null>(null);
    const motorAThrottleRef = useRef<NodeJS.Timeout | null>(null);
    const motorBThrottleRef = useRef<NodeJS.Timeout | null>(null);

    const addLog = useCallback((msg: string, ty: LogEntry['ty']) => {
        setLog((prev) => [...prev.slice(-100), { me: `${new Date().toLocaleTimeString()}: ${msg}`, ty }]);
    }, []);

    // Загрузка настроек устройства
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await getDeviceSettings(idDevice);
                setServo1MinAngle(settings.servo1MinAngle);
                setServo1MaxAngle(settings.servo1MaxAngle);
                setServo2MinAngle(settings.servo2MinAngle);
                setServo2MaxAngle(settings.servo2MaxAngle);
                setShowServos(settings.servoView);
                setShowServosState(settings.servoView);
                setButton1State(settings.b1);
                setButton2State(settings.b2);
            } catch (error) {
                addLog(`Ошибка загрузки настроек: ${String(error)}`, 'error');
            }
        };
        loadSettings();
    }, [idDevice, addLog, setServo1MinAngle, setServo1MaxAngle, setServo2MinAngle, setServo2MaxAngle, setShowServos]);

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

    const connectWebSocket = useCallback(() => {
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
            ws.send(JSON.stringify({ ty: "idn", de: idDevice }));
            ws.send(JSON.stringify({ co: "GET_RELAYS", de: idDevice, ts: Date.now() }));

            // Отправка настроек сервоприводов
            ws.send(JSON.stringify({
                co: 'SET_SERVO1_LIMITS',
                pa: { min: servo1MinAngle, max: servo1MaxAngle },
                de: idDevice,
                ts: Date.now(),
                expectAck: true,
            }));
            ws.send(JSON.stringify({
                co: 'SET_SERVO2_LIMITS',
                pa: { min: servo2MinAngle, max: servo2MaxAngle },
                de: idDevice,
                ts: Date.now(),
                expectAck: true,
            }));
            ws.send(JSON.stringify({
                co: 'SET_SERVO_VIEW',
                pa: { visible: showServos },
                de: idDevice,
                ts: Date.now(),
                expectAck: true,
            }));
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
                            addLog(`Реле 1 (D0) ${newState ? 'включено' : 'выключено'}`, 'esp');
                        } else if (data.pa.pin === '3') {
                            const newState = data.pa.state === 'on';
                            setButton2State(newState);
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
                        addLog(`Реле 1 (D0): ${newState ? 'включено' : 'выключено'}`, 'esp');
                    }
                    if (data.b2 !== undefined) {
                        const newState = data.b2 === 'on';
                        setButton2State(newState);
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
                    setEspConnected(data.st === 'con');
                    addLog(`ESP ${data.st === 'con' ? '✅ Подключено' : '❌ Отключено'}`, 'error');
                } else if (data.ty === 'cst') {
                    addLog(`Команда ${data.co} доставлена`, 'client');
                }
            } catch (error) {
                addLog(`Ошибка обработки сообщения: ${String(error)}`, 'error');
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
                    connectWebSocket();
                }, delay);
            } else {
                addLog("Достигнуто максимальное количество попыток переподключения", 'error');
            }
        };

        ws.onerror = (error) => {
            addLog(`Ошибка WebSocket: ${error.type}`, 'error');
        };

        socketRef.current = ws;
    }, [addLog, cleanupWebSocket, idDevice, servo1MinAngle, servo1MaxAngle, servo2MinAngle, servo2MaxAngle, showServos, setServoAngle, setServo2Angle]);

    const sendCommand = useCallback((co: string, pa?: any) => {
        if (!isIdentified) {
            addLog("Невозможно отправить команду: не идентифицирован", 'error');
            return;
        }

        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const msg = JSON.stringify({
                co,
                pa,
                de: idDevice,
                ts: Date.now(),
                expectAck: true,
            });

            socketRef.current.send(msg);
            addLog(`Отправлена команда на ${idDevice}: ${co}`, 'client');

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
    }, [addLog, idDevice, isIdentified, espConnected]);

    const createMotorHandler = useCallback(
        (mo: 'A' | 'B') => {
            const lastCommandRef = mo === 'A' ? lastMotorACommandRef : lastMotorBCommandRef;
            const throttleRef = mo === 'A' ? motorAThrottleRef : motorBThrottleRef;
            const setSpeed = mo === 'A' ? setMotorASpeed : setMotorBSpeed;
            const setDirection = mo === 'A' ? setMotorADirection : setMotorBDirection;

            return (value: number) => {
                if (!isConnected) {
                    return;
                }

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
                    sendCommand("SPD", { mo, sp: 0 });
                    sendCommand(mo === 'A' ? "MSA" : "MSB");
                    return;
                }

                if (throttleRef.current) {
                    clearTimeout(throttleRef.current);
                }

                throttleRef.current = setTimeout(() => {
                    sendCommand("SPD", { mo, sp });
                    sendCommand(direction === 'forward' ? `MF${mo}` : `MR${mo}`);
                }, 40);
            };
        },
        [sendCommand, isConnected]
    );

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

            sendCommand(servoId === '1' ? 'SSR' : 'SSR2', { an: newAngle });
        },
        [servoAngle, servo2Angle, servo1MinAngle, servo1MaxAngle, servo2MinAngle, servo2MaxAngle, sendCommand, addLog]
    );

    const handleMotorAControl = createMotorHandler('A');
    const handleMotorBControl = createMotorHandler('B');

    useEffect(() => {
        connectWebSocket();
        return () => {
            cleanupWebSocket();
            if (motorAThrottleRef.current) clearTimeout(motorAThrottleRef.current);
            if (motorBThrottleRef.current) clearTimeout(motorBThrottleRef.current);
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        };
    }, [connectWebSocket, cleanupWebSocket]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isConnected && isIdentified) sendCommand("HBT");
        }, 1000);
        return () => clearInterval(interval);
    }, [isConnected, isIdentified, sendCommand]);

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-3rem)] p-4 overflow-hidden relative">
            <Joystick
                mo="A"
                onChange={handleMotorAControl}
                direction={motorADirection}
                sp={motorASpeed}
                disabled={!isConnected}
            />
            <Joystick
                mo="B"
                onChange={handleMotorBControl}
                direction={motorBDirection}
                sp={motorBSpeed}
                disabled={!isConnected}
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
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    onClick={() => adjustServo('1', -15)}
                                    className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                >
                                    <ArrowDown className="h-5 w-5" />
                                </Button>
                                <Button
                                    onClick={() => adjustServo('1', 15)}
                                    className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                >
                                    <ArrowUp className="h-5 w-5" />
                                </Button>
                                <Button
                                    onClick={() => adjustServo('1', 180)}
                                    className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                >
                                    <ArrowRight className="h-5 w-5" />
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
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    onClick={() => adjustServo('2', -15)}
                                    className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                >
                                    <ArrowDown className="h-5 w-5" />
                                </Button>
                                <Button
                                    onClick={() => adjustServo('2', 15)}
                                    className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                >
                                    <ArrowUp className="h-5 w-5" />
                                </Button>
                                <Button
                                    onClick={() => adjustServo('2', 180)}
                                    className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full"
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </div>
                            <span className="text-sm font-medium text-gray-700 mt-1">{servo2Angle}°</span>
                        </div>
                    </>
                )}
                {inputVoltage !== null && (
                    <span className="text-xl font-medium text-green-600 bg-transparent rounded-full flex items-center justify-center">
                        {inputVoltage.toFixed(2)}
                    </span>
                )}
                <div className="flex items-center justify-center space-x-2">
                    {button1State !== null && (
                        <Button
                            onClick={() => {
                                const newState = button1State ? 'off' : 'on';
                                sendCommand('RLY', { pin: 'D0', state: newState });
                            }}
                            className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full transition-all flex items-center"
                        >
                            {button1State ? (
                                <img width={'25px'} height={'25px'} src="/off.svg" alt="Image" />
                            ) : (
                                <img width={'25px'} height={'25px'} src="/on.svg" alt="Image" />
                            )}
                        </Button>
                    )}
                    {button2State !== null && (
                        <Button
                            onClick={() => {
                                const newState = button2State ? 'off' : 'on';
                                sendCommand('RLY', { pin: '3', state: newState });
                            }}
                            className="bg-transparent hover:bg-gray-700/30 backdrop-blur-sm border border-gray-600 p-2 rounded-full transition-all flex items-center"
                        >
                            {button2State ? (
                                <img width={'25px'} height={'25px'} src="/off.svg" alt="Image" />
                            ) : (
                                <img width={'25px'} height={'25px'} src="/on.svg" alt="Image" />
                            )}
                        </Button>
                    )}
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
                    {logVisible ? "Скрыть логи" : "Показать лог"}
                </Button>
                {logVisible && (
                    <div className="border border-gray-200 rounded-md overflow bg-transparent backdrop-blur-sm">
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
    );
}