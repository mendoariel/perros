# build
FROM node:18.12.0 AS development

WORKDIR /alberto/backend/src/app

COPY package*.json ./
COPY tsconfig.build.json ./
COPY tsconfig.json ./

RUN npm ci
RUN npm run build

EXPOSE 3335

FROM node:18.12.0 AS production

WORKDIR /alberto/backend/src/app

COPY --from=development /alberto/backend/src/app .

EXPOSE 3335