import { PrismaClient } from '@prisma/client';

// Предотвращаем многократное создание экземпляров PrismaClient в среде разработки
const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export default prisma;