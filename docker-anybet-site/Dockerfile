# Этап 1: Сборка приложения
FROM node:22 AS builder

# Установите рабочую директорию
WORKDIR /app2

# Скопируйте package.json и yarn.lock в контейнер
COPY package.json yarn.lock ./

# Скопируйте директорию prisma в контейнер
# COPY prisma ./prisma

# Установите только production-зависимости
RUN yarn install --production

# Скопируйте остальной код вашего приложения
COPY . .

# Выполните сборку приложения
RUN yarn build

# Этап 2: Финальный образ
FROM node:22

# Установите рабочую директорию
WORKDIR /app2

# Скопируйте только необходимые файлы из этапа сборки
COPY --from=builder /app2/.next ./.next
COPY --from=builder /app2/node_modules ./node_modules
COPY --from=builder /app2/package.json ./package.json
COPY --from=builder /app2/public ./public

# Убедитесь, что директория prisma копируется
# COPY --from=builder /app2/prisma ./prisma

# Установите переменные окружения, если необходимо
ENV NODE_ENV=production

# Запустите приложение
CMD ["yarn", "start"]


## Используйте официальный образ Node.js в качестве базового
#FROM node:22
#WORKDIR /app2
#COPY package.json yarn.lock ./
#COPY prisma ./prisma
#RUN yarn install
#COPY . .
#RUN yarn build
#CMD ["yarn", "start"]