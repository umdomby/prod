import { prisma } from './prisma-client';
import { hashSync } from 'bcrypt';


async function up() {
  await prisma.user.createMany({

    data: [
      {
        fullName: 'Pi',
        email: 'umdom2@gmail.com',
        password: hashSync('123123', 10),
        role: 'ADMIN',
      },
      {
        fullName: '123',
        email: '123@123.com',
        password: hashSync('123123', 10),
        role: 'USER',
      },
    ],
  });

}


async function down() {
  await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
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
