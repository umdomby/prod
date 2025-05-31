import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function GET(request: Request) {
    try {
        const headers = new Headers({
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Transfer-Encoding': 'chunked',
        });

        const stream = new ReadableStream({
            async start(controller) {
                // Интервал для отправки keep-alive сообщений
                const intervalId = setInterval(() => {
                    try {
                        const data = `data: ${JSON.stringify({ type: 'keep-alive' })}\n\n`;
                        controller.enqueue(new TextEncoder().encode(data));
                        // console.log('Sent keep-alive message');
                    } catch (error) {
                        console.error('Ошибка при записи данных:', error);
                        clearInterval(intervalId);
                        controller.close();
                    }
                }, 15000); // Отправляем keep-alive каждые 15 секунд

                // Переменная для хранения последнего времени обновления
                let lastUpdatedAt = new Date();

                // Интервал для проверки изменений в таблице Bet3
                const checkIntervalId = setInterval(async () => {
                    try {
                        // Ищем изменения в таблице Bet3
                        const changes = await prisma.bet3.findMany({
                            where: {
                                updatedAt: {
                                    gt: lastUpdatedAt,
                                },
                            },
                        });

                        // Если есть изменения, отправляем их клиенту
                        if (changes.length > 0) {
                            //console.log('Changes detected:', changes);
                            changes.forEach(change => {
                                const data = `data: ${JSON.stringify({ type: 'update', data: change })}\n\n`;
                                controller.enqueue(new TextEncoder().encode(data));
                            });

                            // Обновляем время последнего изменения
                            lastUpdatedAt = new Date();
                        }
                    } catch (error) {
                        console.error('Ошибка при проверке изменений:', error);
                        clearInterval(checkIntervalId);
                        controller.close();
                    }
                }, 5000); // Проверяем изменения каждые 1 секунду

                // Обработка закрытия соединения
                request.signal.onabort = () => {
                    console.log('Connection closed by client');
                    clearInterval(intervalId);
                    clearInterval(checkIntervalId);
                    controller.close();
                };
            },
        });

        return new NextResponse(stream, { headers });
    } catch (error) {
        console.error('Ошибка при получении ставок:', error);
        return new NextResponse('Ошибка сервера', { status: 500 });
    }
}
