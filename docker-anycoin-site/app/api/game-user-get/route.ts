import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client'; // Ensure the path to prisma-client is correct

export async function GET() {
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

        return NextResponse.json(gameUserBetsData);
    } catch (error) {
        console.error('Failed to fetch data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}