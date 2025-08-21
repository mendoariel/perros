# Production Dockerfile optimized for dist folder deployment
FROM node:20-alpine AS production

WORKDIR /alberto/backend/src/app

# Install PostgreSQL client and OpenSSL
RUN apk add --no-cache postgresql-client openssl

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the dist folder (will be uploaded via rsync)
COPY dist ./dist

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy environment file
COPY .my-env-production ./.env

# Copy wait-for-db script
COPY scripts/wait-for-db.sh ./scripts/
RUN chmod +x ./scripts/wait-for-db.sh

EXPOSE 3335

# Start the application
CMD ["node", "dist/main.js"]
