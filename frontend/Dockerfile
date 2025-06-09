FROM node:18.13.0 AS development
WORKDIR /alberto/frontend/src/app
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli@17
COPY . .
EXPOSE 4100
ENV NODE_ENV=development
ENV PORT=4100
ENV HOST=0.0.0.0
ENV BACKEND_URL=http://localhost:3333
RUN npm run build-local
CMD ["npm", "run", "start"]

FROM nginx:alpine AS production
COPY --from=development /alberto/frontend/src/app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4100
CMD ["nginx", "-g", "daemon off;"]

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

