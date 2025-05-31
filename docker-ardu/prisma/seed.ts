import { prisma } from './prisma-client';
import { faker } from '@faker-js/faker';

function generateRandomPhoneNumber() {
  return Math.floor(1000000 + Math.random() * 9000000); // Генерация 7-значного номера
}

async function up() {
  const players = Array.from({ length: 200 }).map(() => ({
    name: faker.name.fullName(),
    email: faker.internet.email(),
    phone: generateRandomPhoneNumber() // Генерация 7-значного номера
  }));

  await prisma.player.createMany({
    data: players,
  });
}

async function down() {
  await prisma.$executeRaw`TRUNCATE TABLE "Player" RESTART IDENTITY CASCADE`;
}

async function main() {
  try {
    await down();
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
