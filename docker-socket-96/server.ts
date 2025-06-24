import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { getAllowedDeviceIds, getDeviceTelegramInfo } from './actions';
import { createServer } from 'http';
import axios from 'axios';

// Telegram Bot конфигурация
let TELEGRAM_BOT_TOKEN: string | null = null; // Динамически подставляем токен
let TELEGRAM_CHAT_ID: string | null = null; // Динамически подставляем chat_id
let lastTelegramMessageTime = 0;
const TELEGRAM_MESSAGE_INTERVAL = 5000;
const DEVICE_NAME = 'R1';

const PORT = 8096;
const WS_PATH = '/wsar';

// Функция для форматирования времени в формате "24.06.2025 13:56" (Москва, UTC+3)
function formatDateTime(date: Date): string {
    const moscowOffset = 3 * 60 * 60 * 1000; // Смещение Москвы в миллисекундах (+3 часа)
    const moscowDate = new Date(date.getTime() + moscowOffset);
    const day = String(moscowDate.getUTCDate()).padStart(2, '0');
    const month = String(moscowDate.getUTCMonth() + 1).padStart(2, '0');
    const year = moscowDate.getUTCFullYear();
    const hours = String(moscowDate.getUTCHours()).padStart(2, '0');
    const minutes = String(moscowDate.getUTCMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

const server = createServer();
const wss = new WebSocketServer({
    server,
    path: WS_PATH
});

interface ClientInfo {
    ws: WebSocket;
    de?: string; // deviceId → de
    ip: string;
    isIdentified: boolean;
    ct?: 'browser' | 'esp'; // clientType → ct
    lastActivity: number;
    isAlive: boolean;
}

const clients = new Map<number, ClientInfo>();

// Ping clients every 30 seconds
setInterval(() => {
    clients.forEach((client, clientId) => {
        if (!client.isAlive) {
            client.ws.terminate();
            clients.delete(clientId);
            console.log(`Client ${clientId} terminated (no ping response)`);
            return;
        }
        client.isAlive = false;
        client.ws.ping(null, false);
    });
}, 30000);

wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    // Проверяем путь подключения
    if (req.url !== WS_PATH) {
        ws.close(1002, 'Invalid path');
        return;
    }

    const clientId = Date.now();
    const ip = req.socket.remoteAddress || 'unknown';
    const client: ClientInfo = {
        ws,
        ip,
        isIdentified: false,
        lastActivity: Date.now(),
        isAlive: true
    };
    clients.set(clientId, client);

    console.log(`New connection: ${clientId} from ${ip}`);

    ws.on('pong', () => {
        client.isAlive = true;
        client.lastActivity = Date.now();
    });

    ws.send(JSON.stringify({
        ty: "sys", // type → ty, system → sys
        me: "Connection established", // message → me
        clientId,
        st: "awi" // status → st, awaiting_identification → awi
    }));

    ws.on('message', async (data: Buffer) => {
        try {
            client.lastActivity = Date.now();
            const message = data.toString();
            console.log(`[${clientId}] Received: ${message}`);
            const parsed = JSON.parse(message);

            if (parsed.ty === "clt") { // type → ty, client_type → clt
                client.ct = parsed.ct; // clientType → ct
                return;
            }

            if (parsed.ty === "idn") { // type → ty, identify → idn
                const allowedIds = new Set(await getAllowedDeviceIds());
                if (parsed.de && allowedIds.has(parsed.de)) { // deviceId → de
                    client.de = parsed.de; // deviceId → de
                    client.isIdentified = true;

                    // Загружаем Telegram-данные для устройства
                    const telegramInfo = await getDeviceTelegramInfo(parsed.de);
                    TELEGRAM_BOT_TOKEN = telegramInfo?.telegramToken ?? null;
                    TELEGRAM_CHAT_ID = telegramInfo?.telegramId?.toString() ?? null;

                    ws.send(JSON.stringify({
                        ty: "sys", // type → ty, system → sys
                        me: "Ident ok", // message → me
                        clientId,
                        de: parsed.de, // deviceId → de
                        st: "con" // status → st, connected → con
                    }));

                    // Notify browser clients about ESP connection
                    if (client.ct === "esp") { // clientType → ct
                        clients.forEach(targetClient => {
                            if (targetClient.ct === "browser" && // clientType → ct
                                targetClient.de === parsed.de && // deviceId → de
                                targetClient.de !== null) { // deviceId → de
                                console.log(`Notifying browser client ${targetClient.de} about ESP connection`); // deviceId → de
                                targetClient.ws.send(JSON.stringify({
                                    ty: "est", // type → ty, esp_status → est
                                    st: "con", // status → st, connected → con
                                    de: parsed.de, // deviceId → de
                                    // ts: new Date().toISOString() // timestamp → ts
                                }));
                            }
                        });
                    }
                } else {
                    ws.send(JSON.stringify({
                        ty: "err", // type → ty, error → err
                        me: "ID err", // message → me
                        clientId,
                        st: "rej" // status → st, rejected → rej
                    }));
                    ws.close();
                    return;
                }
                return;
            }

            if (!client.isIdentified) {
                ws.send(JSON.stringify({
                    ty: "err", // type → ty, error → err
                    me: "Ident Not", // message → me
                    clientId
                }));
                return;
            }

            // Process logs from ESP
            if (parsed.ty === "log" && client.ct === "esp") { // type → ty, log
                // Проверяем условия для отправки уведомления в Telegram
                if (parsed.b1 === 'on' && parsed.z && Number(parsed.z) < 1) { // Реле 1 включено и напряжение < 1В
                    const now = new Date();
                    const message = `🚨 Датчик движения сработал! Устройство: ${DEVICE_NAME}, Время: ${formatDateTime(now)}`;
                    console.log(message);
                    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
                        sendTelegramMessage(message);
                    } else {
                        console.log('Telegram credentials not available for device');
                    }
                }

                clients.forEach(targetClient => {
                    if (targetClient.ct === "browser" && // clientType → ct
                        targetClient.de === client.de) { // deviceId → de
                        targetClient.ws.send(JSON.stringify({
                            ty: "log", // type → ty
                            me: parsed.me, // message → me
                            de: client.de, // deviceId → de
                            // ts: new Date().toISOString(), // timestamp → ts
                            or: "esp", // origin → or
                            b1: parsed.b1, // Пересылаем состояние реле 1
                            b2: parsed.b2, // Пересылаем состояние реле 2
                            sp1: parsed.sp1, // Пересылаем угол первого сервопривода
                            sp2: parsed.sp2, // Пересылаем угол второго сервопривода
                            z: parsed.z // Пересылаем значение inputVoltage
                        }));
                    }
                });
                return;
            }

            // Process command acknowledgments
            if (parsed.ty === "ack" && client.ct === "esp") { // type → ty, acknowledge → ack
                clients.forEach(targetClient => {
                    if (targetClient.ct === "browser" && // clientType → ct
                        targetClient.de === client.de) { // deviceId → de
                        targetClient.ws.send(JSON.stringify({
                            ty: "ack", // type → ty, acknowledge → ack
                            co: parsed.co, // command → co
                            de: client.de, // deviceId → de
                            // ts: new Date().toISOString() // timestamp → ts
                        }));
                    }
                });
                return;
            }

            // Route commands to ESP
            if (parsed.co && parsed.de) { // command → co, deviceId → de
                let delivered = false;
                clients.forEach(targetClient => {
                    if (targetClient.de === parsed.de && // deviceId → de
                        targetClient.ct === "esp" && // clientType → ct
                        targetClient.isIdentified) {
                        targetClient.ws.send(message);
                        delivered = true;
                    }
                });

                ws.send(JSON.stringify({
                    ty: delivered ? "cst" : "err", // type → ty, command_status → cst, error → err
                    st: delivered ? "dvd" : "enf", // status → st, delivered → dvd, esp_not_found → enf
                    co: parsed.co, // command → co
                    de: parsed.de, // deviceId → de
                    // ts: new Date().toISOString() // timestamp → ts
                }));
            }

        } catch (err) {
            console.error(`[${clientId}] Message error:`, err);
            ws.send(JSON.stringify({
                ty: "err", // type → ty, error → err
                me: "Invalid message format", // message → me
                error: (err as Error).message,
                clientId
            }));
        }
    });

    ws.on('close', () => {
        console.log(`Client ${clientId} disconnected`);
        if (client.ct === "esp" && client.de) { // clientType → ct, deviceId → de
            clients.forEach(targetClient => {
                if (targetClient.ct === "browser" && // clientType → ct
                    targetClient.de === client.de) { // deviceId → de
                    targetClient.ws.send(JSON.stringify({
                        ty: "est", // type → ty, esp_status → est
                        st: "dis", // status → st, disconnected → dis
                        de: client.de, // deviceId → de
                        // ts: new Date().toISOString(), // timestamp → ts
                        re: "connection closed" // reason → re
                    }));
                }
            });
        }
        clients.delete(clientId);
    });

    ws.on('error', (err: Error) => {
        console.error(`[${clientId}] WebSocket error:`, err);
    });
});

async function sendTelegramMessage(message: string) {
    const currentTime = Date.now();
    if (currentTime - lastTelegramMessageTime < TELEGRAM_MESSAGE_INTERVAL) {
        console.log('Telegram message throttled');
        return;
    }
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('Cannot send Telegram message: Missing bot token or chat ID');
        return;
    }
    try {
        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
        });
        console.log(`Telegram message sent: ${message}`, response.data);
        lastTelegramMessageTime = currentTime;
    } catch (error: any) {
        console.error('Error sending Telegram message:', error.response?.data || error.message);
    }
}

server.listen(PORT, () => {
    console.log(`WebSocket server running on ws://0.0.0.0:${PORT}${WS_PATH}`);
});