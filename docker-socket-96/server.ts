import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { getAllowedDeviceIds, getDeviceTelegramInfo } from './actions';
import { createServer } from 'http';
import axios from 'axios';

// Конфигурация для Telegram-бота
let TELEGRAM_BOT_TOKEN: string | null = null; // Переменная для хранения токена Telegram-бота, который будет получен динамически
let TELEGRAM_CHAT_ID: string | null = null; // Переменная для хранения ID чата Telegram, который будет получен динамически
let lastTelegramMessageTime = 0; // Время последней отправки сообщения в Telegram для предотвращения спама
const TELEGRAM_MESSAGE_INTERVAL = 5000; // Минимальный интервал (в миллисекундах) между отправками сообщений в Telegram
const DEVICE_NAME = 'R1'; // Название устройства, используется в сообщениях Telegram

const PORT = 8096; // Порт, на котором будет работать WebSocket-сервер
const WS_PATH = '/wsar'; // Путь для WebSocket-соединений

// Функция для форматирования даты и времени в формате "24.06.2025 13:56" с учетом часового пояса Москвы (UTC+3)
function formatDateTime(date: Date): string {
    const moscowOffset = 3 * 60 * 60 * 1000; // Смещение времени для Москвы (+3 часа) в миллисекундах
    const moscowDate = new Date(date.getTime() + moscowOffset); // Применяем смещение к переданной дате
    const day = String(moscowDate.getUTCDate()).padStart(2, '0'); // День месяца, дополненный ведущим нулем
    const month = String(moscowDate.getUTCMonth() + 1).padStart(2, '0'); // Месяц (нумерация с 0, поэтому +1), дополненный ведущим нулем
    const year = moscowDate.getUTCFullYear(); // Полный год
    const hours = String(moscowDate.getUTCHours()).padStart(2, '0'); // Часы, дополненные ведущим нулем
    const minutes = String(moscowDate.getUTCMinutes()).padStart(2, '0'); // Минуты, дополненные ведущим нулем
    return `${day}.${month}.${year} ${hours}:${minutes}`; // Форматированная строка с датой и временем
}

const server = createServer(); // Создаем HTTP-сервер, который будет использоваться для WebSocket
const wss = new WebSocketServer({
    server, // Привязываем WebSocket-сервер к созданному HTTP-серверу
    path: WS_PATH // Указываем путь для WebSocket-соединений
});

// Интерфейс для хранения информации о подключенных клиентах
interface ClientInfo {
    ws: WebSocket; // Объект WebSocket для общения с клиентом
    de?: string; // Идентификатор устройства (deviceId), может быть не определен на момент подключения
    ip: string; // IP-адрес клиента
    isIdentified: boolean; // Флаг, указывающий, идентифицирован ли клиент
    ct?: 'browser' | 'esp'; // Тип клиента: браузер или ESP-устройство
    lastActivity: number; // Время последней активности клиента (в миллисекундах)
    isAlive: boolean; // Флаг, указывающий, активен ли клиент (для проверки ping/pong)
}

const clients = new Map<number, ClientInfo>(); // Карта для хранения информации о клиентах, ключ — уникальный идентификатор клиента

// Периодическая проверка активности клиентов каждые 30 секунд
setInterval(() => {
    clients.forEach((client, clientId) => {
        if (!client.isAlive) { // Если клиент не ответил на ping, считаем его неактивным
            client.ws.terminate(); // Закрываем соединение с клиентом
            clients.delete(clientId); // Удаляем клиента из карты
            console.log(`Клиент ${clientId} отключен (не ответил на ping)`); // Логируем отключение клиента
            return;
        }
        client.isAlive = false; // Сбрасываем флаг активности перед отправкой нового ping
        client.ws.ping(null, false); // Отправляем ping клиенту для проверки активности
    });
}, 30000); // Интервал проверки — 30 секунд

// Обработка нового WebSocket-соединения
wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    // Проверяем, что запрос пришел по правильному пути
    if (req.url !== WS_PATH) {
        ws.close(1002, 'Неверный путь'); // Закрываем соединение, если путь неверный, с кодом ошибки 1002
        return;
    }

    const clientId = Date.now(); // Генерируем уникальный идентификатор клиента на основе текущего времени
    const ip = req.socket.remoteAddress || 'unknown'; // Получаем IP-адрес клиента или 'unknown', если адрес недоступен
    const client: ClientInfo = {
        ws, // Сохраняем объект WebSocket
        ip, // Сохраняем IP-адрес клиента
        isIdentified: false, // Клиент пока не идентифицирован
        lastActivity: Date.now(), // Устанавливаем время последней активности
        isAlive: true // Клиент считается активным при подключении
    };
    clients.set(clientId, client); // Добавляем клиента в карту

    console.log(`Новое подключение: ${clientId} с IP ${ip}`); // Логируем новое подключение

    // Обработка ответа на ping от клиента
    ws.on('pong', () => {
        client.isAlive = true; // Помечаем клиента как активного, так как он ответил на ping
        client.lastActivity = Date.now(); // Обновляем время последней активности
    });

    // Отправляем клиенту сообщение об успешном установлении соединения
    ws.send(JSON.stringify({
        ty: "sys", // Тип сообщения: системное
        me: "Соединение установлено", // Сообщение клиенту
        clientId, // Уникальный идентификатор клиента
        st: "awi" // Статус: ожидает идентификации
    }));

    // Обработка входящих сообщений от клиента
    ws.on('message', async (data: Buffer) => {
        try {
            client.lastActivity = Date.now(); // Обновляем время последней активности клиента
            const message = data.toString(); // Преобразуем буфер в строку
            console.log(`[${clientId}] Получено: ${message}`); // Логируем полученное сообщение
            const parsed = JSON.parse(message); // Парсим JSON-сообщение

            // Обработка сообщения о типе клиента
            if (parsed.ty === "clt") { // Тип сообщения: client_type (тип клиента)
                client.ct = parsed.ct; // Сохраняем тип клиента (browser или esp)
                return;
            }

            // Обработка сообщения идентификации клиента
            if (parsed.ty === "idn") { // Тип сообщения: identify (идентификация)
                const allowedIds = new Set(await getAllowedDeviceIds()); // Получаем список разрешенных идентификаторов устройств
                if (parsed.de && allowedIds.has(parsed.de)) { // Проверяем, что deviceId передан и находится в списке разрешенных
                    client.de = parsed.de; // Сохраняем идентификатор устройства
                    client.isIdentified = true; // Помечаем клиента как идентифицированного

                    // Загружаем данные для отправки уведомлений в Telegram
                    const telegramInfo = await getDeviceTelegramInfo(parsed.de); // Получаем информацию о Telegram для устройства
                    TELEGRAM_BOT_TOKEN = telegramInfo?.telegramToken ?? null; // Сохраняем токен Telegram, если он есть
                    TELEGRAM_CHAT_ID = telegramInfo?.telegramId?.toString() ?? null; // Сохраняем ID чата Telegram, если он есть

                    // Отправляем клиенту подтверждение успешной идентификации
                    ws.send(JSON.stringify({
                        ty: "sys", // Тип сообщения: системное
                        me: "Идентификация успешна", // Сообщение клиенту
                        clientId, // Уникальный идентификатор клиента
                        de: parsed.de, // Идентификатор устройства
                        st: "con" // Статус: подключен
                    }));

                    // Уведомляем браузерные клиенты о подключении ESP-устройства
                    if (client.ct === "esp") { // Если клиент — это ESP-устройство
                        clients.forEach(targetClient => {
                            if (targetClient.ct === "browser" && // Если целевой клиент — браузер
                                targetClient.de === parsed.de && // И имеет тот же deviceId
                                targetClient.de !== null) { // И deviceId определен
                                console.log(`Уведомление браузерного клиента ${targetClient.de} о подключении ESP`); // Логируем уведомление
                                targetClient.ws.send(JSON.stringify({
                                    ty: "est", // Тип сообщения: esp_status (статус ESP)
                                    st: "con", // Статус: подключен
                                    de: parsed.de // Идентификатор устройства
                                    // ts: new Date().toISOString() // Закомментировано: временная метка в формате ISO
                                }));
                            }
                        });
                    }
                } else {
                    // Если идентификатор устройства не разрешен, отправляем ошибку и закрываем соединение
                    ws.send(JSON.stringify({
                        ty: "err", // Тип сообщения: ошибка
                        me: "Ошибка идентификации", // Сообщение клиенту
                        clientId, // Уникальный идентификатор клиента
                        st: "rej" // Статус: отклонен
                    }));
                    ws.close(); // Закрываем соединение
                    return;
                }
                return;
            }

            // Проверяем, что клиент идентифицирован, иначе отправляем ошибку
            if (!client.isIdentified) {
                ws.send(JSON.stringify({
                    ty: "err", // Тип сообщения: ошибка
                    me: "Клиент не идентифицирован", // Сообщение клиенту
                    clientId // Уникальный идентификатор клиента
                }));
                return;
            }

            // Обработка логов от ESP-устройства
            if (parsed.ty === "log" && client.ct === "esp") { // Тип сообщения: log, клиент — ESP-устройство
                // Проверяем условия для отправки уведомления в Telegram: реле 1 включено и напряжение меньше 1В
                if (parsed.b1 === 'on' && parsed.z && Number(parsed.z) < 1) {
                    const now = new Date(); // Текущая дата и время
                    const message = `🚨 Датчик движения сработал! Устройство: ${DEVICE_NAME}, Время: ${formatDateTime(now)}`; // Формируем сообщение для Telegram
                    console.log(message); // Логируем сообщение
                    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) { // Проверяем наличие токена и ID чата
                        sendTelegramMessage(message); // Отправляем сообщение в Telegram
                    } else {
                        console.log('Отсутствуют данные для Telegram'); // Логируем отсутствие данных Telegram
                    }
                }
                // Закомментировано: пересылка логов от ESP браузерным клиентам
                // clients.forEach(targetClient => {
                //     if (targetClient.ct === "browser" && // Если целевой клиент — браузер
                //         targetClient.de === client.de) { // И имеет тот же deviceId
                //         targetClient.ws.send(JSON.stringify({
                //             ty: "log", // Тип сообщения: лог
                //             me: parsed.me, // Сообщение от ESP
                //             de: client.de, // Идентификатор устройства
                //             // ts: new Date().toISOString(), // Закомментировано: временная метка в формате ISO
                //             or: "esp", // Источник: ESP-устройство
                //             b1: parsed.b1, // Состояние реле 1
                //             b2: parsed.b2, // Состояние реле 2
                //             sp1: parsed.sp1, // Угол первого сервопривода
                //             sp2: parsed.sp2, // Угол второго сервопривода
                //             z: parsed.z // Значение входного напряжения
                //         }));
                //     }
                // });
                return;
            }

            // Обработка подтверждений команд от ESP
            if (parsed.ty === "ack" && client.ct === "esp") { // Тип сообщения: acknowledge (подтверждение), клиент — ESP
                clients.forEach(targetClient => {
                    if (targetClient.ct === "browser" && // Если целевой клиент — браузер
                        targetClient.de === client.de) { // И имеет тот же deviceId
                        targetClient.ws.send(JSON.stringify({
                            ty: "ack", // Тип сообщения: подтверждение
                            co: parsed.co, // Команда, которая была подтверждена
                            de: client.de // Идентификатор устройства
                            // ts: new Date().toISOString() // Закомментировано: временная метка в формате ISO
                        }));
                    }
                });
                return;
            }

            // Маршрутизация команд к ESP-устройству
            if (parsed.co && parsed.de) { // Если в сообщении есть команда и deviceId
                let delivered = false; // Флаг, указывающий, была ли команда доставлена
                clients.forEach(targetClient => {
                    if (targetClient.de === parsed.de && // Если deviceId совпадает
                        targetClient.ct === "esp" && // Целевой клиент — ESP
                        targetClient.isIdentified) { // И клиент идентифицирован
                        targetClient.ws.send(message); // Пересылаем команду ESP-устройству
                        delivered = true; // Помечаем, что команда доставлена
                    }
                });
                // Закомментировано: отправка подтверждения о статусе доставки команды
                // ws.send(JSON.stringify({
                //     ty: delivered ? "cst" : "err", // Тип сообщения: command_status (статус команды) или ошибка
                //     st: delivered ? "dvd" : "enf", // Статус: delivered (доставлено) или esp_not_found (ESP не найден)
                //     co: parsed.co, // Команда
                //     de: parsed.de, // Идентификатор устройства
                //     // ts: new Date().toISOString() // Закомментировано: временная метка в формате ISO
                // }));
            }

        } catch (err) {
            // Обработка ошибок при разборе сообщения
            console.error(`[${clientId}] Ошибка обработки сообщения:`, err); // Логируем ошибку
            ws.send(JSON.stringify({
                ty: "err", // Тип сообщения: ошибка
                me: "Неверный формат сообщения", // Сообщение клиенту
                error: (err as Error).message, // Текст ошибки
                clientId // Уникальный идентификатор клиента
            }));
        }
    });

    // Обработка закрытия соединения
    ws.on('close', () => {
        console.log(`Клиент ${clientId} отключился`); // Логируем отключение клиента
        if (client.ct === "esp" && client.de) { // Если клиент — ESP и имеет deviceId
            clients.forEach(targetClient => {
                if (targetClient.ct === "browser" && // Если целевой клиент — браузер
                    targetClient.de === client.de) { // И имеет тот же deviceId
                    targetClient.ws.send(JSON.stringify({
                        ty: "est", // Тип сообщения: esp_status (статус ESP)
                        st: "dis", // Статус: отключен
                        de: client.de, // Идентификатор устройства
                        // ts: new Date().toISOString(), // Закомментировано: временная метка в формате ISO
                        re: "соединение закрыто" // Причина: соединение закрыто
                    }));
                }
            });
        }
        clients.delete(clientId); // Удаляем клиента из карты
    });

    // Обработка ошибок WebSocket
    ws.on('error', (err: Error) => {
        console.error(`[${clientId}] Ошибка WebSocket:`, err); // Логируем ошибку WebSocket
    });
});

// Функция для отправки сообщения в Telegram
async function sendTelegramMessage(message: string) {
    const currentTime = Date.now(); // Текущее время
    if (currentTime - lastTelegramMessageTime < TELEGRAM_MESSAGE_INTERVAL) { // Проверяем, не слишком ли часто отправляются сообщения
        console.log('Отправка сообщения в Telegram ограничена по времени'); // Логируем ограничение
        return;
    }
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) { // Проверяем наличие токена и ID чата
        console.log('Невозможно отправить сообщение в Telegram: отсутствует токен или ID чата'); // Логируем ошибку
        return;
    }
    try {
        // Отправляем сообщение в Telegram через API
        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID, // ID чата
            text: message // Текст сообщения
        });
        console.log(`Сообщение в Telegram отправлено: ${message}`, response.data); // Логируем успешную отправку
        lastTelegramMessageTime = currentTime; // Обновляем время последней отправки
    } catch (error: any) {
        console.error('Ошибка отправки сообщения в Telegram:', error.response?.data || error.message); // Логируем ошибку
    }
}

// Запускаем сервер
server.listen(PORT, () => {
    console.log(`WebSocket-сервер запущен на ws://0.0.0.0:${PORT}${WS_PATH}`); // Логируем запуск сервера
});