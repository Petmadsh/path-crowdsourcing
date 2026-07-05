#!/bin/sh
set -e

mkdir -p /app/keys /app/data

if [ ! -f /app/keys/private.pem ] || [ ! -f /app/keys/public.pem ]; then
  echo "Generating JWT keys..."
  openssl genrsa -out /app/keys/private.pem 2048
  openssl rsa -in /app/keys/private.pem -outform PEM -pubout -out /app/keys/public.pem
else
  echo "JWT keys already exist."
fi

if [ ! -f /app/data/database.sqlite ] || [ ! -s /app/data/database.sqlite ]; then
  echo "Seeding database..."
  node dist/seed/index.js
else
  echo "Database already populated."
fi

exec node dist/server.js