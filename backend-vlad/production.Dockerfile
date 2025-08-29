# build
FROM node:20-alpine AS development

WORKDIR /alberto/backend/src/app

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

COPY package*.json ./
COPY tsconfig.build.json ./
COPY tsconfig.json ./
COPY . .

RUN npm install
RUN npx prisma generate
RUN npm run build

EXPOSE 3335

FROM node:20-alpine AS production

WORKDIR /alberto/backend/src/app

# Install PostgreSQL client, OpenSSL, and build dependencies for sharp
RUN apk add --no-cache postgresql-client build-base python3 openssl

COPY package*.json ./
RUN npm install --only=production
RUN npx prisma generate

COPY --from=development /alberto/backend/src/app/dist ./dist
COPY --from=development /alberto/backend/src/app/prisma ./prisma
COPY ./scripts/wait-for-db.sh ./scripts/
RUN chmod +x ./scripts/wait-for-db.sh

# Copy environment file
COPY .my-env-production ./.env

EXPOSE 3335

# Start the application
CMD ["node", "dist/src/main.js"]