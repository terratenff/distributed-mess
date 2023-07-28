# docker build . -t space
# docker run -p 8080:3000 --name space -d space
FROM node:18 AS build
WORKDIR /usr/space
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
