FROM node:lts
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
RUN npm install -g pm2
CMD ["pm2-runtime", "dist/server.js"]
