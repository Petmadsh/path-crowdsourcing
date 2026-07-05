FROM node:20-slim

# Installa tutti i tool di build e le librerie necessarie
RUN apt-get update && apt-get install -y \
    openssl \
    python3 \
    make \
    g++ \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Installa le dipendenze e ricompila sqlite3 da sorgente
RUN npm install --build-from-source

COPY . .
RUN npm run build

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]