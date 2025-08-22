FROM node:18.13.0 AS development
WORKDIR /app

# Install Chromium for testing (works on ARM64)
RUN apt-get update && apt-get install -y \
    chromium \
    && rm -rf /var/lib/apt/lists/* \
    && chromium --version

COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli@17
COPY . .
EXPOSE 4100
EXPOSE 9876
ENV NODE_ENV=development
ENV PORT=4100
ENV HOST=0.0.0.0
ENV BACKEND_URL=http://localhost:3333
ENV CHROME_BIN=/usr/bin/chromium
RUN npm run build-local
CMD ["npm", "run", "start-ssr"]

FROM nginx:alpine AS production
COPY --from=development /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4100
CMD ["nginx", "-g", "daemon off;"]

