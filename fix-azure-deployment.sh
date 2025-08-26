#!/bin/bash

echo "🔧 Fixing Azure deployment issues..."

# Stop all services
docker-compose down

# Create correct main .env file
cat > .env << 'ENVEOF'
COMPOSE_PROJECT_NAME=meds-prod
JWT_SECRET=supersecretjwt
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=medsdb
RABBITMQ_DEFAULT_USER=guest
RABBITMQ_DEFAULT_PASS=guest
REDIS_PASSWORD=
GATEWAY_PORT=8080
WEB_PORT=3000
ENVEOF

# Fix web .env to point to Azure VM
cat > web/.env << 'WEBEOF'
VITE_API_BASE=http://20.106.187.119:8080
WEBEOF

# Fix delivery service .env
cat > services/delivery/.env << 'DELEOF'
PORT=3004
DATABASE_URL=postgres://postgres:postgres@postgres:5432/medsdb
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
JWT_SECRET=supersecretjwt
DELEOF

# Fix notification service .env
cat > services/notification/.env << 'NOTEOF'
PORT=3005
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
NOTEOF

# Fix other service .env files
cat > services/auth/.env << 'AUTHEOF'
PORT=3001
DATABASE_URL=postgres://postgres:postgres@postgres:5432/medsdb
JWT_SECRET=supersecretjwt
AUTHEOF

cat > services/catalog/.env << 'CATEOF'
PORT=3002
DATABASE_URL=postgres://postgres:postgres@postgres:5432/medsdb
JWT_SECRET=supersecretjwt
REDIS_URL=redis://redis:6379
CATEOF

cat > services/order/.env << 'ORDEOF'
PORT=3003
DATABASE_URL=postgres://postgres:postgres@postgres:5432/medsdb
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
JWT_SECRET=supersecretjwt
ORDEOF

cat > gateway/.env << 'GATEOF'
PORT=8080
JWT_SECRET=supersecretjwt
GATEOF

echo "✅ Environment files fixed!"

# Start services
echo "🚀 Starting services..."
docker-compose up -d

echo "⏱️ Waiting for services to start..."
sleep 45

echo "📊 Checking service status..."
docker-compose ps

echo "🧪 Testing health endpoint..."
curl -s http://localhost:8080/auth/health

echo ""
echo "🎉 Deployment fix completed!"
echo "🌐 Access your app at: http://20.106.187.119:3000"
echo "🔗 API Gateway at: http://20.106.187.119:8080"
