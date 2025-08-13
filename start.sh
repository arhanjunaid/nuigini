#!/bin/bash

echo "🚀 Starting Nuigini Insurance Microservices Backend..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    echo "Press Enter to continue or Ctrl+C to exit..."
    read
fi

# Start services with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
docker-compose ps

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec api-gateway npm run migrate

# Seed database with initial data
echo "🌱 Seeding database with initial data..."
docker-compose exec api-gateway npm run seed

echo "✅ Nuigini Insurance Backend is ready!"
echo ""
echo "📊 Service URLs:"
echo "   API Gateway: http://localhost:3000"
echo "   API Docs: http://localhost:3000/api-docs"
echo "   Health Check: http://localhost:3000/health"
echo ""
echo "🔧 Individual Services:"
echo "   Lead Service: http://localhost:3001"
echo "   Quote Service: http://localhost:3002"
echo "   Policy Service: http://localhost:3003"
echo "   Payment Service: http://localhost:3004"
echo "   Claims Service: http://localhost:3005"
echo "   Reinsurance Service: http://localhost:3006"
echo "   Rule Engine Service: http://localhost:3007"
echo "   Notification Service: http://localhost:3008"
echo ""
echo "📚 Postman Collection: postman/collection.json"
echo "📖 Documentation: README.md"
echo ""
echo "🛑 To stop services: docker-compose down" 