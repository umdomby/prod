# Этап сборки
FROM node:22 AS builder
WORKDIR /app2
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build

# Этап запуска
FROM node:22
WORKDIR /app2
COPY --from=builder /app2/.next ./.next
COPY --from=builder /app2/public ./public
COPY --from=builder /app2/package.json .
COPY --from=builder /app2/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3001
CMD ["yarn", "start"]