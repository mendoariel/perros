# build
FROM node:18.12.0 AS development

WORKDIR /alberto/backend/src/app

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client

COPY package*.json ./
COPY tsconfig.build.json ./
COPY tsconfig.json ./
COPY . .

RUN npm install
RUN npx prisma generate
RUN npm run build

EXPOSE 3335

FROM node:18.12.0 AS production

WORKDIR /alberto/backend/src/app

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client

COPY --from=development /alberto/backend/src/app .
COPY ./scripts/wait-for-db.sh ./scripts/
RUN chmod +x ./scripts/wait-for-db.sh

EXPOSE 3335