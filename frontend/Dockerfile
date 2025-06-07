FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g @angular/cli@17

COPY . .

ENV NODE_ENV=development
ENV PORT=4100

EXPOSE 4100

# Build the application
RUN npm run build:ssr:dev

# Start the SSR server
CMD ["npm", "run", "serve:ssr:dev"]

