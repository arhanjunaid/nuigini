# syntax=docker/dockerfile:1
FROM node:18-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY . .

ENV NODE_ENV=development
ENV PORT=3004
EXPOSE 3004

CMD ["node", "services/payment-service/index.js"]