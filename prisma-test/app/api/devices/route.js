import prisma from '@/lib/prisma'; // Используем наш единый экземпляр Prisma
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const devices = await prisma.devices.findMany({
            select: {
                idDevice: true,
            },
        });
        const deviceIds = devices.map((device) => device.idDevice);
        return NextResponse.json(deviceIds);
    } catch (error) {
        console.error('Ошибка при получении idDevice из базы данных:', error);
        // Не отключаем prisma.$disconnect(), так как соединение теперь управляется централизованно
        return new NextResponse(
            JSON.stringify({ error: 'Ошибка при получении данных' }),
            { status: 500 }
        );
    }
}