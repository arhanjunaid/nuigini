# syntax=docker/dockerfile:1
FROM node:18-slim
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000

CMD ["node", "services/auth-service/index.js"]
