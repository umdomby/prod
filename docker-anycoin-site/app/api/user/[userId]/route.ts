// app/api/user/[userId]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function GET(
    request: Request,
    { params } : { params: Promise<{ userId: string }> }
) {
    try {
        // Асинхронно получаем userId из params
        const { userId } = await params;

        // Проверяем, что userId существует
        if (!userId) {
            return new NextResponse('ID пользователя не указан', { status: 400 });
        }

        // Ищем пользователя в базе данных
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: {
                points: true, // Выбираем только поле points
            },
        });

        // Если пользователь не найден, возвращаем ошибку
        if (!user) {
            return new NextResponse('Пользователь не найден', { status: 404 });
        }

        // Возвращаем данные пользователя
        return NextResponse.json(user);
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        return new NextResponse('Ошибка сервера', { status: 500 });
    }
}