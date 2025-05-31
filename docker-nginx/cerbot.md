# Войти в контейнер и исследовать файлы:
# cerbot
docker exec -it docker-nginx-certbot-1 /bin/sh
ls -la /etc/letsencrypt
ls -la /etc/letsencrypt/archive/ardua.site

ls -la /  # посмотреть корневую папку
ls -la /etc/nginx  # посмотреть конфиги Nginx


# Проверьте содержимое archive:
# На хосте (в WSL или через проводник) выполните:
sudo ls -la /home/pi/docker/docker-nginx/letsencrypt/archive/ardua.site/
drwxr-xr-x 2 root root 4096 May 18 17:47 .
drwx------ 3 root root 4096 May 18 17:47 ..
-rw-r--r-- 1 root root 1277 May 18 17:47 cert1.pem
-rw-r--r-- 1 root root 1566 May 18 17:47 chain1.pem
-rw-r--r-- 1 root root 2843 May 18 17:47 fullchain1.pem
-rw------- 1 root root  241 May 18 17:47 privkey1.pem


# Зайдите в контейнер Coturn и проверьте наличие сертификатов:
docker exec -it coturn ls -la /etc/coturn/certs/


# Проверка текущих сертификатов Посмотреть дату истечения:
docker exec -it docker-nginx-certbot-1 certbot certificates --cert-name ardua.site

# Как обновить сертификаты Вручную:
docker exec -it docker-nginx-certbot-1 certbot renew --force-renewal

# Если обновление не работает Проверьте логи Certbot:
docker logs docker-nginx-certbot-1


# Проверить актуальные сертификаты в Certbot:
docker exec -it docker-nginx-certbot-1 ls -la /etc/letsencrypt/live/ardua.site/

# Обновите конфигурацию:
docker-compose down && docker-compose up -d

# Проверьте, что Coturn видит актуальные сертификаты:
docker exec coturn ls -la /etc/coturn/certs/

# Убедитесь, что Certbot может обновлять сертификаты:

docker exec docker-nginx-certbot-1 certbot renew --dry-run

# Добавьте хук для автоматического перезапуска Coturn:
mkdir -p ./letsencrypt/renewal-hooks/deploy
echo -e '#!/bin/sh\ndocker restart coturn' > ./letsencrypt/renewal-hooks/deploy/restart-coturn.sh
chmod +x ./letsencrypt/renewal-hooks/deploy/restart-coturn.sh

