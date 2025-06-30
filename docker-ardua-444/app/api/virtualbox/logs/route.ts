import { NextResponse } from 'next/server';

// Хранилище логов в памяти
const logs: { message: string; type: string; timestamp: string }[] = [];
const subscribers: ((log: { message: string; type: string; timestamp: string }) => void)[] = [];

// Функция для добавления лога и уведомления подписчиков (не экспортируется)
function addLog(message: string, type: string) {
    const log = { message, type, timestamp: new Date().toISOString() };
    logs.push(log);
    // Ограничиваем размер хранилища (последние 100 логов)
    if (logs.length > 100) logs.shift();
    // Уведомляем всех подписчиков о новом логе
    subscribers.forEach((subscriber) => subscriber(log));
}

export async function POST(request: Request) {
    try {
        const { message, type } = await request.json();
        if (!message || !['info', 'error', 'success'].includes(type)) {
            return NextResponse.json({ error: 'Invalid message or type' }, { status: 400 });
        }
        addLog(message, type);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API VirtualBox Log] ERROR:', error);
        return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
    }
}

export async function GET() {
    return new Response(
        new ReadableStream({
            start(controller) {
                // Отправляем существующие логи
                logs.forEach((log) => {
                    controller.enqueue(
                        new TextEncoder().encode(`data: ${JSON.stringify(log)}\n\n`)
                    );
                });

                // Добавляем подписчика для новых логов
                const subscriber = (log: { message: string; type: string; timestamp: string }) => {
                    controller.enqueue(
                        new TextEncoder().encode(`data: ${JSON.stringify(log)}\n\n`)
                    );
                };
                subscribers.push(subscriber);

                // Удаляем подписчика при закрытии соединения
                return () => {
                    const index = subscribers.indexOf(subscriber);
                    if (index !== -1) subscribers.splice(index, 1);
                };
            },
            cancel() {
                // Очищаем подписчиков при закрытии соединения
                subscribers.length = 0;
            },
        }),
        {
            headers: {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        }
    );
}