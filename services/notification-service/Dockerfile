# syntax=docker/dockerfile:1
FROM node:18-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY . .

ENV NODE_ENV=development
ENV PORT=3008
EXPOSE 3008

CMD ["node", "services/notification-service/index.js"]