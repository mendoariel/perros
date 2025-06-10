FROM node:18.12.0

WORKDIR /app

# Install PostgreSQL client and other dependencies
RUN apt-get update && apt-get install -y postgresql-client curl

# Copy package files first
COPY package*.json ./
RUN npm install
RUN npm install @prisma/client prisma

# Copy Prisma schema and environment file
COPY prisma ./prisma/
COPY .my-env-local ./.env

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Prepare the wait-for-db script
RUN chmod +x ./scripts/wait-for-db.sh

# Set environment variables
ENV DATABASE_URL="postgres://mendoariel:casadesara@postgres:5432/peludosclick?schema=public"
ENV NODE_ENV=production

EXPOSE 3333

CMD ["npm", "run", "start:prod"] 