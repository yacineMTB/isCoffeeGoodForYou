FROM node:15
WORKDIR /app
COPY package*.json ./
RUN npm ci 
COPY . .
EXPOSE 8080
CMD ["npm", "run", "start"]