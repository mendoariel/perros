# build
FROM node:18.13.0 AS development

WORKDIR /alberto/frontend/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g @angular/cli@17

COPY . .

RUN npm run build

EXPOSE 4200 
EXPOSE 49153
EXPOSE 4000

FROM nginx:1.23.2 AS production

EXPOSE 9002

RUN npm run build

RUN rm -rf /usr/share/nginx/html/*

COPY /dist/frontend /usr/share/nginx/html

