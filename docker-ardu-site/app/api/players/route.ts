import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/components/lib/redisClient';

export async function GET() {
    // const cacheKey = 'players';
    // const redisClient = await getRedisClient();

    // Попробуйте получить данные из кэша
    // const cachedPlayers = await redisClient.get(cacheKey);
    //
    // if (cachedPlayers) {
    //     return NextResponse.json(JSON.parse(cachedPlayers));
    // }

    // Получаем всех игроков и сортируем по id
    // const players = await prisma.player.findMany({
    //     orderBy: {
    //         id: 'asc',
    //     },
    // });

    // Обновляем номер телефона для каждого игрока
    // for (const player of players) {
    //     const newPhone = Math.floor(1000000 + Math.random() * 9000000);
    //     await prisma.player.update({
    //         where: { id: player.id },
    //         data: { phone: newPhone },
    //     });
    // }

    // Возвращаем обновленные данные, отсортированные по id
    const updatedPlayers = await prisma.player.findMany({
        orderBy: {
            id: 'asc',
        },
    });

    // Сохраняем данные в кэше на 60 секунд
    // await redisClient.set(cacheKey, JSON.stringify(updatedPlayers), {
    //     EX: 100, // Время жизни кэша в секундах
    // });

    return NextResponse.json(updatedPlayers);
}

