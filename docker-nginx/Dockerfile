# Используем официальный образ NGINX
FROM nginx:latest

# Копируем конфиг NGINX
COPY ./nginx.conf /etc/nginx/nginx.conf

# Создаём папки для SSL-сертификатов
RUN mkdir -p /etc/letsencrypt/live && mkdir -p /etc/letsencrypt/archive

EXPOSE 80 443
#444

CMD ["nginx", "-g", "daemon off;"]