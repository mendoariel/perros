# build
FROM --platform=linux/arm64 node:18.12.0 AS development

WORKDIR /alberto/backend/src/app

COPY package*.json ./

RUN npm install

COPY . .

# RUN npm run build