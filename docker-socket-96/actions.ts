// Заглушка для получения разрешенных идентификаторов устройств
// export async function getAllowedDeviceIds(): Promise<string[]> {
//     // Возвращаем массив с разрешенными идентификаторами
//     return ['123', '222', '333', '444', 'YNNGUT123PP5KMNB', 'NTKKKM96JMTPRP90','4444444444444444'];
// }


// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();



// file: docker-socket-96/actions.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface Device {
    idDevice: string;
}

export async function getAllowedDeviceIds(): Promise<string[]> {
    try {
        // Запрашиваем все idDevice из таблицы Devices
        const devices: Device[] = await prisma.devices.findMany({
            select: {
                idDevice: true,
            },
        });

        // console.log(devices);

        // Возвращаем массив idDevice
        // return ['123', '222', '333', '444', 'YNNGUT123PP5KMNB', 'NTKKKM96JMTPRP90','4444444444444444'];
        return devices.map((device) => device.idDevice);
    } catch (error) {
        console.error('Ошибка при получении idDevice из базы данных:', error);
        return []; // Возвращаем пустой массив в случае ошибки
    } finally {
        await prisma.$disconnect(); // Закрываем соединение
    }
}