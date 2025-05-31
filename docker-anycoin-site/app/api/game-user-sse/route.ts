import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function GET(request: Request) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const sendUpdate = async () => {
        try {
            const gameUserBetsData = await prisma.gameUserBet.findMany({
                where: {
                    statusUserBet: {
                        in: ['OPEN', 'START'], // Фильтрация по статусу
                    },
                },
                include: {
                    gameUser1Bet: true,
                    gameUser2Bet: true,
                    category: true,
                    product: true,
                    productItem: true,
                },
                orderBy: {
                    createdAt: 'desc', // Сортировка по createdAt в порядке убывания
                },
            });

            writer.write(encoder.encode(`data: ${JSON.stringify(gameUserBetsData)}\n\n`));
        } catch (error) {
            console.error('Failed to fetch data:', error);
            writer.write(encoder.encode('data: {"error": "Failed to fetch data"}\n\n'));
        }
    };

    const interval = setInterval(sendUpdate, 5000);

    request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        writer.close();
    });

    return new NextResponse(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
