# Этап 1: Сборка приложения
FROM node:22 AS builder

# Установите рабочую директорию
WORKDIR /app2

# Скопируйте package.json и yarn.lock в контейнер
COPY package.json yarn.lock ./

# Скопируйте директорию prisma в контейнер
COPY prisma ./prisma

# Установите зависимости
RUN yarn install --frozen-lockfile

# Скопируйте остальной код вашего приложения
COPY . .

# Выполните сборку приложения
RUN yarn build

# Этап 2: Финальный образ
FROM node:22

# Установите рабочую директорию
WORKDIR /app2

COPY --from=builder /app2 /app2

RUN yarn install --production --frozen-lockfile
RUN yarn global add ts-node typescript @types/node @types/ws concurrently path
RUN yarn prisma generate

# Установите переменные окружения
ENV NODE_ENV=production

# Порты
EXPOSE 3000
#EXPOSE 1444

# Запустите приложение
#CMD ["yarn", "start"]
#CMD ["sh", "-c", "concurrently \"yarn next start\" \"ts-node server.ts\""]
CMD ["sh", "-c", "concurrently \"yarn next start\""]
