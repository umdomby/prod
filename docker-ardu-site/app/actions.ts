import { prisma } from '@/prisma/prisma-client';

// export async function playerA() {
//     // Получаем всех игроков
//     const players = await prisma.player.findMany();
//
//     // Обновляем номер телефона для каждого игрока
//     for (const player of players) {
//         const newPhone = Math.floor(1000000 + Math.random() * 9000000); // Генерация 7-значного номера
//         await prisma.player.update({
//             where: { id: player.id },
//             data: { phone: newPhone },
//         });
//     }
//
//     // Возвращаем обновленные данные
//     return await prisma.player.findMany();
// }