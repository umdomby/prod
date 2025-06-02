# Используем многоступенчатую сборку для уменьшения размера итогового образа
# Этап сборки
FROM golang:1.24-alpine AS builder

# Устанавливаем зависимости для сборки
RUN apk add --no-cache git

# Создаем рабочую директорию
WORKDIR /app

# Копируем файлы модулей для кэширования
COPY go.mod go.sum ./
RUN go mod download

# Копируем исходный код
COPY . .

# Собираем приложение
RUN CGO_ENABLED=0 GOOS=linux go build -o /server

# Этап запуска
FROM alpine:latest

# Устанавливаем tzdata для работы с временными зонами
RUN apk add --no-cache tzdata

# Копируем бинарник из этапа сборки
COPY --from=builder /server /server

# Открываем порт, который слушает приложение
EXPOSE 8085

# Запускаем сервер
CMD ["/server"]