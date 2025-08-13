# syntax=docker/dockerfile:1
FROM node:18-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY . .

ENV NODE_ENV=development
ENV PORT=3001
EXPOSE 3001

CMD ["node", "services/lead-service/index.js"]