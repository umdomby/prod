import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import {BetStatus} from "@prisma/client";

export async function GET() {
    try {
        const bets = await prisma.bet4.findMany({
            where: { status: 'OPEN' }, // Применяем фильтр по статусу
            orderBy: { createdAt: 'asc' }, // Сортировка по дате создания
            include: {
                player1: true,
                player2: true,
                player3: true,
                player4: true,
                creator: true,
                participants: {
                    include: {
                        user: true, // Включаем данные о пользователе
                    },
                },
                category: true,
                product: true,
                productItem: true,
                turnirBet: true,
            },
        });

        return NextResponse.json(bets);
    } catch (error) {
        console.error('Ошибка при получении ставок на трех игроков:', error);
        return new NextResponse('Ошибка сервера', { status: 500 });
    }
}
