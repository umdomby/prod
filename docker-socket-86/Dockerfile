FROM node:18-alpine

WORKDIR /app

# Установка зависимостей
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
# Установка ts-node глобально (или можно добавить его в devDependencies)
RUN yarn global add ts-node typescript

# Копирование исходного кода
COPY . .

EXPOSE 8086

CMD ["yarn", "start"]