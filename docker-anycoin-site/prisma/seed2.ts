import {playerStatistics } from './constants';
import { prisma } from './prisma-client';




async function up() {

  for (const stat of playerStatistics) {
    try {
      await prisma.playerStatistic.create({ data: stat });
    } catch (error) {
      console.error('Ошибка при вставке записи:', stat, error);
    }
  }
}

async function main() {
  try {
    await up();
  } catch (e) {
    console.error(e);
  }
}

main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
