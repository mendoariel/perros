FROM node:18.13.0 AS development
WORKDIR /alberto/frontend/src/app
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli@17
COPY . .
EXPOSE 4100

# FROM node:18.13.0-slim AS production
# WORKDIR /alberto/frontend/src/app
# COPY --from=build /alberto/frontend/src/app/dist ./dist
# COPY --from=build /alberto/frontend/src/app/package*.json ./
# RUN npm install --production
# EXPOSE 4100
# CMD ["npm", "run", "serve:ssr"]

# FROM node:18.13.0 AS development
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# RUN npm install -g @angular/cli@17
# EXPOSE 4100
# CMD ["npm", "run", "serve:ssr"]

