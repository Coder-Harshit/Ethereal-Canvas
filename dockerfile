FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i --production
COPY . .
RUN npm run build
# building is completed

FROM nginx:alpine
WORKDIR /app
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
# CMD ["nginx"]
CMD ["nginx","-g","daemon off;"] 
# better