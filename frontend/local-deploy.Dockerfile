### STAGE 1: Build ###

FROM node:18.13.0 AS build
# Create images of node, tha main that know you count with a machine

# Specify the work folder 
WORKDIR /alberto/frontend/src/app

COPY package*.json ./
# Copy all json pakage file file to work folder that mean that into the /alberto/frontend/src/app there is package.json

RUN npm install
# Create the node_module folder intalls liabriries that are into package.json

RUN npm install -g @angular/cli@17
# install into images of node tha include ubuntu machine, becoause node include ubuntu

COPY . .

# Build the app for SSR
RUN npm run build:ssr

### STAGE 2: Run ###
FROM node:18.13.0-slim AS production

WORKDIR /alberto/frontend/src/app

COPY --from=build /alberto/frontend/src/app/dist ./dist
COPY --from=build /alberto/frontend/src/app/package*.json ./

RUN npm install --production

EXPOSE 4000

CMD ["npm", "run", "serve:ssr"]