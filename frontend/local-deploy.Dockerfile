### STAGE 1: Build ###
FROM node:18.13.0 AS build

WORKDIR /alberto/frontend

COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli@17

COPY . .

# Build the app for SSR con la config local-deploy
RUN npm run build:ssr-local-deploy

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

### STAGE 2: Run ###
FROM node:18.13.0-slim AS production

WORKDIR /alberto/frontend

COPY --from=build /alberto/frontend/dist ./dist
COPY --from=build /alberto/frontend/package*.json ./

RUN npm install --production

EXPOSE 4000

CMD ["/entrypoint.sh"]