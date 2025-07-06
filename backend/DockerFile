FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i --production
COPY . .
EXPOSE 3001
CMD ["node","server.js"]