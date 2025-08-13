#!/bin/bash

echo "🚀 Starting Nuigini Insurance Microservices Backend (Local Mode)..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    echo "Press Enter to continue or Ctrl+C to exit..."
    read
fi

# Create logs directory
mkdir -p logs

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start services in background
echo "🔧 Starting services..."

# Start API Gateway
echo "Starting API Gateway on port 3000..."
node services/api-gateway/index.js &
API_GATEWAY_PID=$!

# Start Lead Service
echo "Starting Lead Service on port 3001..."
node services/lead-service/index.js &
LEAD_SERVICE_PID=$!

# Start Quote Service
echo "Starting Quote Service on port 3002..."
node services/quote-service/index.js &
QUOTE_SERVICE_PID=$!

# Start Policy Service
echo "Starting Policy Service on port 3003..."
node services/policy-service/index.js &
POLICY_SERVICE_PID=$!

# Start Payment Service
echo "Starting Payment Service on port 3004..."
node services/payment-service/index.js &
PAYMENT_SERVICE_PID=$!

# Start Claims Service
echo "Starting Claims Service on port 3005..."
node services/claims-service/index.js &
CLAIMS_SERVICE_PID=$!

# Start Reinsurance Service
echo "Starting Reinsurance Service on port 3006..."
node services/reinsurance-service/index.js &
REINSURANCE_SERVICE_PID=$!

# Start Rule Engine Service
echo "Starting Rule Engine Service on port 3007..."
node services/rule-engine-service/index.js &
RULE_ENGINE_PID=$!

# Start Notification Service
echo "Starting Notification Service on port 3008..."
node services/notification-service/index.js &
NOTIFICATION_SERVICE_PID=$!

# Wait a moment for services to start
sleep 5

echo "✅ Nuigini Insurance Backend is starting!"
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
echo "🛑 To stop services: Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $API_GATEWAY_PID $LEAD_SERVICE_PID $QUOTE_SERVICE_PID $POLICY_SERVICE_PID $PAYMENT_SERVICE_PID $CLAIMS_SERVICE_PID $REINSURANCE_SERVICE_PID $RULE_ENGINE_PID $NOTIFICATION_SERVICE_PID 2>/dev/null
    echo "✅ Services stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for all background processes
wait 