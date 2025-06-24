import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface Device {
    idDevice: string;
    telegramToken?: string | null;
    telegramId?: bigint | null;
}

export async function getAllowedDeviceIds(): Promise<string[]> {
    try {
        const devices = await prisma.devices.findMany({
            select: {
                idDevice: true,
            },
        });
        return devices.map((device) => device.idDevice);
    } catch (error) {
        console.error('Ошибка при получении idDevice из базы данных:', error);
        return [];
    } finally {
        await prisma.$disconnect();
    }
}

export async function getDeviceTelegramInfo(deviceId: string): Promise<{ telegramToken?: string | null; telegramId?: string | null } | null> {
    try {
        const device: Device | null = await prisma.devices.findUnique({
            where: { idDevice: deviceId },
            select: {
                idDevice: true, // Добавлено
                telegramToken: true,
                telegramId: true,
            },
        });
        if (!device) {
            console.log(`Устройство с idDevice ${deviceId} не найдено`);
            return null;
        }
        return {
            telegramToken: device.telegramToken,
            telegramId: device.telegramId ? device.telegramId.toString() : null,
        };
    } catch (error) {
        console.error('Ошибка при получении Telegram данных:', error);
        return null;
    } finally {
        await prisma.$disconnect();
    }
}