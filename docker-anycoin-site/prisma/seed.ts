import { categories, products, productsItem, players, playerStatistics } from './constants';
import { prisma } from './prisma-client';
import { hashSync } from 'bcrypt';

function generateCardId() {
  const length = 16; // Длина идентификатора, например, 16 цифр
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10); // Добавляем случайную цифру
  }
  return result;
}

async function up() {
  await prisma.user.createMany({

    data: [
      {
        fullName: 'Pi',
        email: 'umdom2@gmail.com',
        password: hashSync('123123', 10),
        role: 'ADMIN',
        points: 9996000,
        cardId: generateCardId(),
        bankDetails: [
          {
            "name": "USTD",
            "details": "0x51470b98c8737f14958231cb27491b28c5702c13",
            "description": "BSC (BEP20)",
            "price": "0,01"
          },
          {
            "name": "BTC",
            "details": "19hCv645WrUthCNUWb4ncBdHVu6iLhZVow",
            "description": "Биткойн",
            "price": "0,0000001"
          },
          {
            "name": "USD Технобанк VISA",
            "details": "4704693052762369 10/27",
            "description": "IBAN BY95TECN3014000000GRN0029573",
            "price": "0,01"
          },
          {
            "name": "BEL Технобанк ЕРИП",
            "details": "(№ Договора - GRN29573) ",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – Технобанк – Пополнение карты - (№ Договора - GRN29573)",
            "price": "0,03"
          },
          {
            "name": "RUS Альфа-Банк MasterCard",
            "details": "5208130010810772 02/29",
            "description": "IBAN BY17ALFA3014309V9P0050270000",
            "price": "0,87"
          },
          {
            "name": "USD Альфа-Банк ЕРИП",
            "details": "(№ Телефона - 375333814578)",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – Альфа-Банк – Пополнение счета - № Телефона - 375333814578",
            "price": "0,01"
          },
          {
            "name": "USD MTB MasterCard",
            "details": "MasterCard: 5351041664841598 04/27",
            "description": "IBAN BY13MTBK30140008999901709902",
            "price": "0,01"
          },
          {
            "name": "USD MTB ЕРИП",
            "details": "(№ Договора - 33623213)",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № Договора - 33623213",
            "price": "0,01"
          },
          {
            "name": "BEL Беларусбанк MIR",
            "details": "9112380168621532  02/29 ",
            "description": "IBAN BY77ALFA3014309V9P0010270000",
            "price": "0,03"
          },
          {
            "name": "BEL Банк Дабрабыт БЕЛКАРТ",
            "details": "9112397016744373 02/29",
            "description": "IBAN BY29MMBN30140116007150001246",
            "price": "0,03"
          },
          {
            "name": " BEL Банк Дабрабыт EРИП БЕЛКАРТ",
            "details": "IBAN - BY29MMBN30140116007150001246",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № IBAN - BY29MMBN30140116007150001246",
            "price": "0,03"
          }
        ],
        telegram: "@navatar85",
      },
      {
        fullName: 'Pi33',
        email: 'umdom33@gmail.com',
        password: hashSync('123123', 10),
        role: 'USER',
        points: 1000,
        cardId: generateCardId(),
        telegram: "@Pi33",
        bankDetails: [
          {
            "name": "USTD",
            "details": "0x51470b98c8737f14958231cb27491b28c5702c13",
            "description": "BSC (BEP20)",
            "price": "0,01"
          },
          {
            "name": "BTC",
            "details": "19hCv645WrUthCNUWb4ncBdHVu6iLhZVow",
            "description": "Биткойн",
            "price": "0,0000001"
          },
          {
            "name": "USD Технобанк ЕРИП",
            "details": "4704693052762369 10/27",
            "description": "IBAN BY95TECN3014000000GRN0029573",
            "price": "0,01"
          },
          {
            "name": "BEL Технобанк ЕРИП",
            "details": "(№ Договора - GRN29573) ",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – Технобанк – Пополнение карты - (№ Договора - GRN29573)",
            "price": "0,03"
          },
          {
            "name": "RUS Альфа-Банк MasterCard",
            "details": "5208130010810772 02/29",
            "description": "IBAN BY17ALFA3014309V9P0050270000",
            "price": "0,87"
          },
          {
            "name": "USD Альфа-Банк ЕРИП",
            "details": "(№ Телефона - 375333814578)",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – Альфа-Банк – Пополнение счета - № Телефона - 375333814578",
            "price": "0,01"
          },
          {
            "name": "USD MTB MasterCard",
            "details": "MasterCard: 5351041664841598 04/27",
            "description": "IBAN BY13MTBK30140008999901709902",
            "price": "0,01"
          },
          {
            "name": "USD MTB ЕРИП",
            "details": "(№ Договора - 33623213)",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № Договора - 33623213",
            "price": "0,01"
          },
          {
            "name": "BEL Беларусбанк MIR",
            "details": "9112380168621532  02/29 ",
            "description": "IBAN BY77ALFA3014309V9P0010270000",
            "price": "0,03"
          },
          {
            "name": "BEL Банк Дабрабыт БЕЛКАРТ",
            "details": "9112397016744373 02/29",
            "description": "IBAN BY29MMBN30140116007150001246",
            "price": "0,03"
          },
          {
            "name": " BEL Банк Дабрабыт EРИП БЕЛКАРТ",
            "details": "IBAN - BY29MMBN30140116007150001246",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № IBAN - BY29MMBN30140116007150001246",
            "price": "0,03"
          }
        ],
      },
      {
        fullName: 'Pi555',
        email: 'umdom555@gmail.com',
        password: hashSync('123123', 10),
        role: 'USER',
        points: 1000,
        cardId: generateCardId(),
        telegram: "@Pi555",
        bankDetails: [
          {
            "name": "USTD",
            "details": "0x51470b98c8737f14958231cb27491b28c5702c13",
            "description": "BSC (BEP20)",
            "price": "0,01"
          },
          {
            "name": "BTC",
            "details": "19hCv645WrUthCNUWb4ncBdHVu6iLhZVow",
            "description": "Биткойн",
            "price": "0,0000001"
          },
          {
            "name": "USD Технобанк VISA",
            "details": "4704693052762369 10/27",
            "description": "IBAN BY95TECN3014000000GRN0029573",
            "price": "0,01"
          },
          {
            "name": "BEL Технобанк VISA",
            "details": "(№ Договора - GRN29573) ",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – Технобанк – Пополнение карты - (№ Договора - GRN29573)",
            "price": "0,03"
          },
          {
            "name": "RUS Альфа-Банк MasterCard",
            "details": "5208130010810772 02/29",
            "description": "IBAN BY17ALFA3014309V9P0050270000",
            "price": "0,87"
          },
          {
            "name": "USD Альфа-Банк ",
            "details": "(№ Телефона - 375333814578)",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – Альфа-Банк – Пополнение счета - № Телефона - 375333814578",
            "price": "0,01"
          },
          {
            "name": "USD MTB MasterCard",
            "details": "MasterCard: 5351041664841598 04/27",
            "description": "IBAN BY13MTBK30140008999901709902",
            "price": "0,01"
          },
          {
            "name": "USD MTB ЕРИП",
            "details": "(№ Договора - 33623213)",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № Договора - 33623213",
            "price": "0,01"
          },
          {
            "name": "BEL Беларусбанк MIR",
            "details": "9112380168621532  02/29 ",
            "description": "IBAN BY77ALFA3014309V9P0010270000",
            "price": "0,03"
          },
          {
            "name": "BEL Банк Дабрабыт БЕЛКАРТ",
            "details": "9112397016744373 02/29",
            "description": "IBAN BY29MMBN30140116007150001246",
            "price": "0,03"
          },
          {
            "name": " BEL Банк Дабрабыт EРИП БЕЛКАРТ",
            "details": "IBAN - BY29MMBN30140116007150001246",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № IBAN - BY29MMBN30140116007150001246",
            "price": "0,03"
          }
        ],
      },
      {
        fullName: 'Yatsyk',
        email: 'yatsyk@gmail.com',
        password: hashSync('123123', 10),
        role: 'USER',
        points: 1000,
        cardId: generateCardId(),
        telegram: "@Yatsyk",
        bankDetails: [
          {
            "name": "USTD",
            "details": "0x51470b98c8737f14958231cb27491b28c5702c13",
            "description": "BSC (BEP20)",
            "price": "0,01"
          },
          {
            "name": "BTC",
            "details": "19hCv645WrUthCNUWb4ncBdHVu6iLhZVow",
            "description": "Биткойн",
            "price": "0,0000001"
          },
          {
            "name": "USD Технобанк VISA",
            "details": "4704693052762369 10/27",
            "description": "IBAN BY95TECN3014000000GRN0029573",
            "price": "0,01"
          },
          {
            "name": "BEL Технобанк VISA",
            "details": "(№ Договора - GRN29573) ",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – Технобанк – Пополнение карты - (№ Договора - GRN29573)",
            "price": "0,03"
          },
          {
            "name": "RUS Альфа-Банк MasterCard",
            "details": "5208130010810772 02/29",
            "description": "IBAN BY17ALFA3014309V9P0050270000",
            "price": "0,87"
          },
          {
            "name": "USD Альфа-Банк ",
            "details": "(№ Телефона - 375333814578)",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – Альфа-Банк – Пополнение счета - № Телефона - 375333814578",
            "price": "0,01"
          },
          {
            "name": "USD MTB MasterCard",
            "details": "MasterCard: 5351041664841598 04/27",
            "description": "IBAN BY13MTBK30140008999901709902",
            "price": "0,01"
          },
          {
            "name": "USD MTB ЕРИП",
            "details": "(№ Договора - 33623213)",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № Договора - 33623213",
            "price": "0,01"
          },
          {
            "name": "BEL Беларусбанк MIR",
            "details": "9112380168621532  02/29 ",
            "description": "IBAN BY77ALFA3014309V9P0010270000",
            "price": "0,03"
          },
          {
            "name": "BEL Банк Дабрабыт БЕЛКАРТ",
            "details": "9112397016744373 02/29",
            "description": "IBAN BY29MMBN30140116007150001246",
            "price": "0,03"
          },
          {
            "name": " BEL Банк Дабрабыт EРИП БЕЛКАРТ",
            "details": "IBAN - BY29MMBN30140116007150001246",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № IBAN - BY29MMBN30140116007150001246",
            "price": "0,03"
          }
        ],
      },
      {
        fullName: '123',
        email: '123@123.com',
        password: hashSync('123123', 10),
        role: 'USER',
        points: 1000,
        cardId: generateCardId(),
        telegram: "@123",
        bankDetails: [
          {
            "name": "USTD",
            "details": "0x51470b98c8737f14958231cb27491b28c5702c13",
            "description": "BSC (BEP20)",
            "price": "0,01"
          },
          {
            "name": "BTC",
            "details": "19hCv645WrUthCNUWb4ncBdHVu6iLhZVow",
            "description": "Биткойн",
            "price": "0,0000001"
          },
          {
            "name": "USD Технобанк VISA",
            "details": "4704693052762369 10/27",
            "description": "IBAN BY95TECN3014000000GRN0029573",
            "price": "0,01"
          },
          {
            "name": "BEL Технобанк VISA",
            "details": "(№ Договора - GRN29573) ",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – Технобанк – Пополнение карты - (№ Договора - GRN29573)",
            "price": "0,03"
          },
          {
            "name": "RUS Альфа-Банк MasterCard",
            "details": "5208130010810772 02/29",
            "description": "IBAN BY17ALFA3014309V9P0050270000",
            "price": "0,87"
          },
          {
            "name": "USD Альфа-Банк ",
            "details": "(№ Телефона - 375333814578)",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – Альфа-Банк – Пополнение счета - № Телефона - 375333814578",
            "price": "0,01"
          },
          {
            "name": "USD MTB MasterCard",
            "details": "MasterCard: 5351041664841598 04/27",
            "description": "IBAN BY13MTBK30140008999901709902",
            "price": "0,01"
          },
          {
            "name": "USD MTB ЕРИП",
            "details": "(№ Договора - 33623213)",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № Договора - 33623213",
            "price": "0,01"
          },
          {
            "name": "BEL Беларусбанк MIR",
            "details": "9112380168621532  02/29 ",
            "description": "IBAN BY77ALFA3014309V9P0010270000",
            "price": "0,03"
          },
          {
            "name": "BEL Банк Дабрабыт БЕЛКАРТ",
            "details": "9112397016744373 02/29",
            "description": "IBAN BY29MMBN30140116007150001246",
            "price": "0,03"
          },
          {
            "name": " BEL Банк Дабрабыт EРИП БЕЛКАРТ",
            "details": "IBAN - BY29MMBN30140116007150001246",
            "description": "Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № IBAN - BY29MMBN30140116007150001246",
            "price": "0,03"
          }
        ],
      },
    ],
  });

  await prisma.turnirBet.createMany({
    data: [
          {
            id: 1,
        name: "HeroesCup1deaL"
        },
        {
          id: 2,
          name: "Heroes Cup"
        },
        {
          id: 3,
          name: "Heroes Cup 2"
        },
        {
          id: 4,
          name: "Heroes Cup 3"
        },
        {
          id: 5,
          name: "HC 3 PO"
        },
      {
        id: 6,
        name: "HC 2 PO"
      },
      ]
  });

  await prisma.category.createMany({
    data: categories,
  });

  await prisma.product.createMany({
    data: products,
  });

  await prisma.productItem.createMany({
    data: productsItem,
  });

  await prisma.player.createMany({
    data: players,
  });


  for (const stat of playerStatistics) {
    try {
      await prisma.playerStatistic.create({ data: stat });
    } catch (error) {
      console.error('Ошибка при вставке записи:', stat, error);
    }
  }

  await prisma.globalData.create({
    data: {
      users: 0,
      betFund: 1000000,
      reg: 0,
      ref: 0,
      usersPoints: 10000000,
      margin: 0,
      openBetsPoints: 0,
      gameUserBetOpen: 0,
    },
  });

  await prisma.updateDateTime.create({
    data: {
      UDTvaluta: new Date(),
      UDTOrderP2P: new Date(),
    },
  });


  await prisma.courseValuta.create({
    // к доллару
    data: {
      USD: 3.17, // USD к USD всегда 1
      EUR: 1.04,
      BEL: 0.31,
      RUS: 1.13,
      BTC: 86554,
      USTD: 3.17,
      updatedAt: new Date(), // Обновляем дату
    },
  });


  await prisma.heroesControl.create({
    data: {
      id: 1, // Указываем id = 1 для создания новой записи
      globalStop: false,
      stopP2P: false,
      stopTransferPoints: false,
      stopGameUserCreate: false,
    },
  });
}


async function down() {
  // await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "Category" RESTART IDENTITY CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "ProductItem" RESTART IDENTITY CASCADE`;
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
