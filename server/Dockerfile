FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm audit fix
COPY . .
EXPOSE 8080
CMD ["node", "app.js"]
