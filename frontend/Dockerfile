# build
FROM node:20-alpine AS development

WORKDIR /alberto/frontend

COPY package*.json ./

RUN npm install
RUN npm install -g @angular/cli@17
RUN npm install -g cross-env

COPY . .

EXPOSE 4100

CMD ["npm", "run", "serve:ssr:frontend:development"]

FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html
COPY dist/frontend/browser .

EXPOSE 80

