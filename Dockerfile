FROM node:20-alpine

# Install openssl per generare le chiavi nell'entrypoint
RUN apk add --no-cache openssl

WORKDIR /app

# Copia i file delle dipendenze e installa
COPY package*.json ./
RUN npm install

# Copia il resto del codice e compila TypeScript
COPY . .
RUN npm run build

# Copia lo script di entrypoint e rendilo eseguibile
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Esponi la porta
EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]