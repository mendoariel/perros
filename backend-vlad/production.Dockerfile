# build
FROM node:18.12.0 AS development

WORKDIR /alberto/backend/src/app

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client

COPY package*.json ./
COPY tsconfig.build.json ./
COPY tsconfig.json ./
COPY . .

RUN npm ci
RUN npx prisma generate
RUN npm run build

EXPOSE 3335

FROM node:18.12.0 AS production

WORKDIR /alberto/backend/src/app

# Install PostgreSQL client and build dependencies for sharp
RUN apt-get update && apt-get install -y postgresql-client build-essential python3

COPY package*.json ./
RUN npm ci --only=production
RUN npx prisma generate

COPY --from=development /alberto/backend/src/app/dist ./dist
COPY --from=development /alberto/backend/src/app/prisma ./prisma
COPY ./scripts/wait-for-db.sh ./scripts/
RUN chmod +x ./scripts/wait-for-db.sh

EXPOSE 3335