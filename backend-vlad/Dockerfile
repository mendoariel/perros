# build
FROM node:20 AS development

WORKDIR /alberto/backend/src/app

# Install OpenSSL and build dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install sharp for the correct platform
RUN npm install --include=optional --platform=linux --arch=arm64 sharp

RUN npm install

COPY prisma ./prisma/

RUN npx prisma generate

COPY . .

# Generate Prisma client again after all files are copied
RUN npx prisma generate

# RUN npm run build