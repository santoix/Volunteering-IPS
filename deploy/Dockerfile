FROM node:alpine

WORKDIR /app-deploy

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

#CMD npm run server
CMD ["sh", "-c", "cd backend && node server.js" ]