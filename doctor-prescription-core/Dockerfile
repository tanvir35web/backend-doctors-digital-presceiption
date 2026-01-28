FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Use webpack with polling for file watching in Docker
CMD ["npx", "nest", "start", "--watch", "--preserveWatchOutput"]
