import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return new NextResponse('User ID is required', { status: 400 });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const sendUpdate = async () => {
        try {
            // Получаем все открытые ордера
            const openOrders = await prisma.orderP2P.findMany({
                where: { orderP2PStatus: 'OPEN' },
                include: {
                    orderP2PUser1: {
                        select: {
                            id: true,
                            cardId: true,
                            telegram: true,
                        }
                    },
                    orderP2PUser2: {
                        select: {
                            id: true,
                            cardId: true,
                            telegram: true,
                        }
                    }
                }
            });

            // Сортируем заказы: сначала свои, потом по дате создания
            openOrders.sort((a, b) => {
                const isAUserOrder = a.orderP2PUser1Id === parseInt(userId) || a.orderP2PUser2Id === parseInt(userId);
                const isBUserOrder = b.orderP2PUser1Id === parseInt(userId) || b.orderP2PUser2Id === parseInt(userId);

                if (isAUserOrder && !isBUserOrder) return -1;
                if (!isAUserOrder && isBUserOrder) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            // Получаем количество pending ордеров для конкретного пользователя
            const pendingOrdersCount = await prisma.orderP2P.count({
                where: {
                    orderP2PStatus: 'PENDING',
                    OR: [
                        { orderP2PUser1Id: parseInt(userId) },
                        { orderP2PUser2Id: parseInt(userId) }
                    ]
                }
            });

            const data = {
                openOrders,
                pendingOrdersCount
            };

            writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
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