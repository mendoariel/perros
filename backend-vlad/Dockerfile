# build
FROM node:18.20.0 AS development

WORKDIR /alberto/backend/src/app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/

RUN npx prisma generate

COPY . .

# Generate Prisma client again after all files are copied
RUN npx prisma generate

# RUN npm run build