# syntax=docker/dockerfile:1
FROM node:18-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY . .

ENV NODE_ENV=development
ENV PORT=3007
EXPOSE 3007

CMD ["node", "services/rule-engine-service/index.js"]