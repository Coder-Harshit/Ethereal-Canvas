FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i --production
COPY . .
RUN npm run build
# building is completed

FROM nginx:alpine
COPY /app/dist /usr/share/nginx/html
EXPOSE 80
# CMD ["ngnix"]
CMD ["ngnix","-g","daemon off;"] 
# better