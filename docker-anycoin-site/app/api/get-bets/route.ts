import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { BetStatus } from '@prisma/client'; // Импортируйте тип BetStatus

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const statusParam = url.searchParams.get('status'); // Получаем параметр статуса

        // Приводим statusParam к типу BetStatus
        const status = statusParam as BetStatus;

        // Базовый запрос с фильтрацией по статусу (если передан)
        const whereClause = status ? { status } : {};

        const bets = await prisma.bet.findMany({
            where: whereClause, // Применяем фильтр по статусу
            orderBy: { createdAt: 'asc' }, // Сортировка по дате создания
            include: {
                player1: true,
                player2: true,
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

        return NextResponse.json(bets); // Возвращаем список ставок
    } catch (error) {
        console.error('Ошибка при получении ставок:', error);
        return new NextResponse('Ошибка сервера', { status: 500 });
    }
}
