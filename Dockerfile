FROM node:lts
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build
RUN npm install -g pm2
EXPOSE 4000
CMD ["pm2-runtime", "dist/server.js"]
