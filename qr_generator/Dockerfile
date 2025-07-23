# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY dashboard/package*.json ./dashboard/

# Install dependencies
RUN npm install
RUN cd dashboard && npm install

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files for production
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy source code and server files
COPY --from=build /app/dashboard ./dashboard
COPY server.js ./
COPY get-client.js ./
COPY connect.js ./
COPY config.js ./

# Expose ports
EXPOSE 3700 3334

# Start both services in development mode
CMD ["sh", "-c", "node server.js & cd dashboard && npm start"] 