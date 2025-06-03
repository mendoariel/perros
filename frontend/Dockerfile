# build
FROM node:20-alpine AS development

WORKDIR /alberto/frontend/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps
RUN npm install -g @angular/cli@17

COPY . .

EXPOSE 4200 
EXPOSE 4000

CMD ["npm", "run", "dev:ssr"]

FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html
COPY dist/frontend/browser .

EXPOSE 80

