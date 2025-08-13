# syntax=docker/dockerfile:1
FROM node:18-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY . .

ENV NODE_ENV=development
ENV PORT=3006
EXPOSE 3006

CMD ["node", "services/reinsurance-service/index.js"]