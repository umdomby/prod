import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';
import { prisma } from '@/prisma/prisma-client';
import { compare, hashSync } from 'bcrypt';
import { checkVPN } from '@/components/constants/checkVPN';
// Функция для генерации уникального идентификатора карты
async function generateUniqueCardId(): Promise<string> {
  const length = 16; // Длина идентификатора карты
  let cardId = '';
  let isUnique = false;

  while (!isUnique) {
    // Генерируем новый идентификатор карты
    cardId = '';
    for (let i = 0; i < length; i++) {
      cardId += Math.floor(Math.random() * 10); // Добавляем случайную цифру
    }

    // Проверяем, уникален ли идентификатор карты
    const existingUser = await prisma.user.findFirst({
      where: { cardId },
    });

    if (!existingUser) {
      isUnique = true; // Если пользователя с таким cardId нет, то он уникален
    }
  }

  return cardId;
}

// Функция для обновления истории входов
async function updateLoginHistory(userId: number, ip: string, isVPN: boolean) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // Используем any для упрощения
    let loginHistory: any[] = [];

    if (Array.isArray(user.loginHistory)) {
      // Если loginHistory уже массив, используем его
      loginHistory = user.loginHistory;
    } else if (typeof user.loginHistory === 'string') {
      // Если loginHistory — строка, пытаемся распарсить её как JSON
      try {
        const parsedHistory = JSON.parse(user.loginHistory);
        if (Array.isArray(parsedHistory)) {
          loginHistory = parsedHistory;
        }
      } catch (error) {
        console.error('Ошибка при парсинге loginHistory:', error);
      }
    }

    // Ищем существующую запись
    const existingEntry = loginHistory.find((entry: any) => entry.ip === ip);

    if (existingEntry) {
      // Обновляем существующую запись
      existingEntry.lastLogin = new Date().toISOString();
      existingEntry.vpn = isVPN;
      existingEntry.loginCount += 1;
    } else {
      // Добавляем новую запись
      loginHistory.push({
        ip,
        lastLogin: new Date().toISOString(),
        vpn: isVPN,
        loginCount: 1,
      });
    }

    // Обновляем запись пользователя в базе данных
    await prisma.user.update({
      where: { id: userId },
      data: {
        loginHistory,
      },
    });

    console.log('Login history updated for user:', userId); // Логируем обновление истории
  } catch (error) {
    console.error('Ошибка при обновлении истории входов:', error);
    throw error;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const values = {
          email: credentials.email,
        };

        const findUser = await prisma.user.findFirst({
          where: values,
        });

        if (!findUser) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, findUser.password);

        if (!isPasswordValid) {
          return null;
        }

        // Получаем IP-адрес пользователя
        let ip = '';
        try {
          const response = await axios.get('https://api.ipify.org?format=json');
          ip = response.data.ip;
          console.error('IP-адрес:', ip);
        } catch (error) {
          console.error('Ошибка при получении IP-адреса:', error);
          ip = 'unknown';
        }
        const isVPN = await checkVPN(ip); // Проверяем VPN
        //
        // // Проверяем, существует ли IP-адрес в модели ReferralUserIpAddress
        // const referralEntry = await prisma.referralUserIpAddress.findFirst({
        //   where: {
        //     referralStatus: false,
        //     referralIpAddress: ip,
        //   },
        // });
        //
        // if (referralEntry) {
        //   // Если IP-адрес существует, увеличиваем баллы для пользователя, связанного с рефералом
        //   await prisma.user.update({
        //     where: { id: referralEntry.referralUserId },
        //     data: {
        //       points: {
        //         increment: 10, // Преобразуем в число и добавляем 10 баллов по умолчанию
        //       },
        //     },
        //   });
        //   // Обновляем статус реферала отдельно
        //   await prisma.referralUserIpAddress.update({
        //     where: { id: referralEntry.id }, // Указываем уникальный идентификатор записи
        //     data: {
        //       referralStatus: true, // Устанавливаем referralStatus в true
        //       referralPoints: 10,
        //     },
        //   });
        // }

        if (findUser) {
          // Обновляем историю входов
          await updateLoginHistory(findUser.id, ip, isVPN);
        }

        return {
          id: findUser.id,
          email: findUser.email,
          name: findUser.fullName,
          role: findUser.role,
          cardId: findUser.cardId,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, req }: any) {
      try {
        if (account?.provider === 'credentials') {
          return true;
        }

        if (!user.email) {
          return false;
        }

        let ip = '';
        try {
          const response = await axios.get('https://api.ipify.org?format=json');
          ip = response.data.ip;
          console.error('IP-адрес:', ip);
        } catch (error) {
          console.error('Ошибка при получении IP-адреса:', error);
          ip = 'unknown';
        }
        console.log('IP-адрес:', ip);

        // Проверяем, существует ли IP-адрес в модели ReferralUserIpAddress
        const referralEntry = await prisma.referralUserIpAddress.findFirst({
          where: {
            referralStatus: false,
            referralIpAddress: ip,
          },
        });

        if (referralEntry) {
          const referralPoints = 100; // Получаем количество баллов из переменной окружения или используем 100 по умолчанию

          await prisma.$transaction(async (prisma) => {
            // Увеличиваем баллы для пользователя, связанного с рефералом
            await prisma.user.update({
              where: { id: referralEntry.referralUserId },
              data: {
                points: {
                  increment: referralPoints,
                },
              },
            });

            // Обновляем статус реферала
            await prisma.referralUserIpAddress.update({
              where: { id: referralEntry.id },
              data: {
                referralStatus: true,
                referralPoints: referralPoints,
              },
            });

            // Отнимаем баллы у пользователя с id = 1
            await prisma.user.update({
              where: { id: 1 },
              data: {
                points: {
                  decrement: referralPoints,
                },
              },
            });
          });
        }

        const isVPN = await checkVPN(ip); // Проверяем VPN
        console.log('Результат проверки VPN:', isVPN); // Логируем результат проверки VPN

        const findUser = await prisma.user.findFirst({
          where: {
            OR: [
              { provider: account?.provider, providerId: account?.providerAccountId },
              { email: user.email },
            ],
          },
        });

        if (findUser) {
          // Обновляем историю входов
          await updateLoginHistory(findUser.id, ip, isVPN);

          return true;
        }

        const cardId = await generateUniqueCardId(); // Генерируем уникальный идентификатор карты
        // Если используется VPN, points = 0
        if (isVPN) {
          console.log('Используется VPN. Устанавливаем points = 0');
          await prisma.user.create({
            data: {
              email: user.email,
              fullName: user.name || 'User #' + user.id,
              password: hashSync(user.id.toString(), 10),
              provider: account?.provider,
              providerId: account?.providerAccountId,
              points: 0, // Устанавливаем points = 0, если используется VPN
              cardId,
              loginHistory: [
                {
                  ip,
                  lastLogin: new Date().toISOString(),
                  vpn: isVPN,
                  loginCount: 1,
                },
              ],
            },
          });

          return true;
        }

        // Если VPN не используется, проверяем IP в истории входов
        const allUsers = await prisma.user.findMany();

        // Проверяем, был ли такой IP в истории входов
        let ipExists = false;
        for (const user of allUsers) {
          if (user.loginHistory && Array.isArray(user.loginHistory)) {
            const hasIP = user.loginHistory.some((entry: any) => entry.ip === ip);
            if (hasIP) {
              ipExists = true;
              break;
            }
          }
        }

        // Если IP уже был в истории входов, points = 0, иначе points = 150
        const points = ipExists ? 0 : 150;
        console.log('IP уже был в истории входов:', ipExists);
        console.log('Устанавливаем points:', points);

        await prisma.$transaction(async (prisma) => {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              fullName: user.name || 'User #' + user.id,
              password: hashSync(user.id.toString(), 10),
              provider: account?.provider,
              providerId: account?.providerAccountId,
              points, // Set points
              cardId,
              loginHistory: [
                {
                  ip,
                  lastLogin: new Date().toISOString(),
                  vpn: isVPN,
                  loginCount: 1,
                },
              ],
            },
          });

          // Create a new entry in the regPoints table
          await prisma.regPoints.create({
            data: {
              regPointsUserId: newUser.id,
              regPointsPoints: points,
            },
          });

          // Deduct points from User with id = 1
          await prisma.user.update({
            where: { id: 1 },
            data: {
              points: {
                decrement: points, // Deduct the same amount of points
              },
            },
          });
        });

        return true;
      } catch (error) {
        console.error('Error [SIGNIN]', error);
        return false;
      }
    },
    async jwt({ token }) {
      if (!token.email) {
        return token;
      }

      const findUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (findUser) {
        token.id = String(findUser.id);
        token.email = findUser.email;
        token.role = findUser.role;
        token.cardId = findUser.cardId; // Добавляем cardId в токен
      }

      return token;
    },
    session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.cardId = token.cardId; // Добавляем cardId в сессию
      }

      return session;
    },
  },
};
