import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return new NextResponse('User ID is required', { status: 400 });
    }

    try {
        const openOrders = await prisma.orderP2P.findMany({
            where: {
                OR: [
                    {
                        orderP2PUser1Id: parseInt(userId),
                        orderP2PStatus: { in: ['PENDING'] }
                    },
                    {
                        orderP2PUser2Id: parseInt(userId),
                        orderP2PStatus: { in: ['PENDING'] }
                    }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                orderP2PUser1: {
                    select: {
                        id: true,
                        cardId: true,
                        fullName: true,
                        telegram: true,
                    }
                },
                orderP2PUser2: {
                    select: {
                        id: true,
                        cardId: true,
                        fullName: true,
                        telegram: true,
                    }
                }
            }
        });

        return NextResponse.json(openOrders);
    } catch (error) {
        console.error('Failed to fetch data:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}