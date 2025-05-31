import { prisma } from '@/prisma/prisma-client';

// Заглушка для получения разрешенных идентификаторов устройств
export async function getAllowedDeviceIds(): Promise<string[]> {
    // Возвращаем массив с разрешенными идентификаторами
    return ['123', '222', '333', '444'];
}
