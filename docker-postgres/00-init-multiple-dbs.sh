#!/bin/bash
set -e

echo "🚀 Запуск инициализации баз данных..."

# Создание необходимых ролей
psql -U "$POSTGRES_USER" -tc "SELECT 1 FROM pg_roles WHERE rolname='neondb_owner'" | grep -q 1 || \
psql -U "$POSTGRES_USER" --command "CREATE ROLE neondb_owner;"

psql -U "$POSTGRES_USER" -tc "SELECT 1 FROM pg_roles WHERE rolname='neon_superuser'" | grep -q 1 || \
psql -U "$POSTGRES_USER" --command "CREATE ROLE neon_superuser;"

psql -U "$POSTGRES_USER" -tc "SELECT 1 FROM pg_roles WHERE rolname='cloud_admin'" | grep -q 1 || \
psql -U "$POSTGRES_USER" --command "CREATE ROLE cloud_admin;"

IFS=',' read -ra DBS <<< "$POSTGRES_MULTIPLE_DATABASES"

for db in "${DBS[@]}"; do
  echo "🛠 Создаю базу данных: $db"
  psql -U "$POSTGRES_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$db'" | grep -q 1 || \
  psql -U "$POSTGRES_USER" --command "CREATE DATABASE $db;"
done

echo "✅ Все базы данных созданы!"

for db in "${DBS[@]}"; do
 DUMP_FILE="/docker-entrypoint-initdb.d/${db}.sql"
 if [ -f "$DUMP_FILE" ]; then
   if file "$DUMP_FILE" | grep -q "PostgreSQL custom database dump"; then
     echo "📂 Загружаю бинарный дамп $DUMP_FILE в базу $db..."
     pg_restore -U "$POSTGRES_USER" -d "$db" "$DUMP_FILE" || true
   else
     echo "📂 Загружаю обычный SQL-дамп $DUMP_FILE в базу $db..."
     psql -U "$POSTGRES_USER" -d "$db" < "$DUMP_FILE" || true
   fi
 else
   echo "⚠️ Файл $DUMP_FILE не найден, пропускаю загрузку в $db"
 fi
done

echo "✅ Инициализация завершена!"