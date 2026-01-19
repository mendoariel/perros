# build
FROM node:18.20.0 AS development

WORKDIR /alberto/backend/src/app

# Instalar dependencias del sistema necesarias para sharp
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

# Asegurar que sharp se instala con los binarios correctos para Linux
RUN npm rebuild sharp || npm install sharp

COPY prisma ./prisma/

RUN npx prisma generate

COPY . .

# Generate Prisma client again after all files are copied
RUN npx prisma generate

# RUN npm run build