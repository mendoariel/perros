# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the pre-built dist folder
COPY dist ./dist

# Set environment variables
ENV PORT=9002
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 9002

# Start the application
CMD ["node", "dist/peludosclick-app/server/main.js"]