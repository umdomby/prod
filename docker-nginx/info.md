-- быстрая команда
docker-compose up --build

# Соберите образ: docker build -t docker-start .
# Запустите контейнер:
# ``` docker run --name my-nginx -d -p 8080:80 docker-start ```
# ``` docker stop my-nginx ```
# ``` docker rm my-nginx ```
# ``` docker ps -a ```
# ``` docker-compose up --build ``` - Соберите и запустите контейнер:
# http://localhost:8080

# В /etc/hosts (Linux/WSL2) или C:\Windows\System32\drivers\etc\hosts (Windows) добавьте:
127.0.0.1 site1.local
127.0.0.1 site2.local

✅ Решение 2: Обращение через site1.local и site2.local
В файле /etc/hosts (Linux/WSL2) или C:\Windows\System32\drivers\etc\hosts (Windows) добавьте:

http://site1.local:8080
http://site2.local:8080



C:\Windows\System32\drivers\etc
127.0.0.1 gamerecords.site
127.0.0.1 anybet.site
127.0.0.1 anycoin.site
127.0.0.1 ardu.site
127.0.0.1 it-startup.site
127.0.0.1 site1.local
127.0.0.1 site2.local

sudo nano /etc/hosts
127.0.0.1 gamerecords.site
127.0.0.1 anybet.site
127.0.0.1 anycoin.site
127.0.0.1 ardu.site
127.0.0.1 it-startup.site
127.0.0.1 site1.local
127.0.0.1 site2.local