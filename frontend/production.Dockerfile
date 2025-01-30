### STAGE 1: Build ###

FROM node:18.12.0 AS build
# Create images of node, tha main that know you count with a machine

# Specify the work folder 
WORKDIR /alberto/frontend/src/app

COPY package*.json ./
# Copy all json pakage file file to work folder that mean that into the /alberto/frontend/src/app there is package.json

RUN npm install
# Create the node_module folder intalls liabriries that are into package.json

RUN npm install -g @angular/cli@16.1.0
# install into images of node tha include ubuntu machine, becoause node include ubuntu

COPY . .

RUN npm run build-prod --production


### STAGE 2: Run ###
FROM nginx:1.23.2 AS production

EXPOSE 80

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /alberto/frontend/src/app/dist/frontend /usr/share/nginx/html