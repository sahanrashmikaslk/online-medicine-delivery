#!/bin/bash

# Azure Deployment Script for Online Medicine Delivery
echo "🚀 Starting Azure deployment..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo "❌ Please don't run this script as root"
  exit 1
fi

# Create production environment file
echo "📝 Setting up production environment..."
cp .env.production .env

# Set secure passwords (you should change these)
echo "🔐 Generating secure passwords..."
export JWT_SECRET=$(openssl rand -base64 32)
export POSTGRES_PASSWORD=$(openssl rand -base64 16)
export RABBITMQ_DEFAULT_PASS=$(openssl rand -base64 16)
export REDIS_PASSWORD=$(openssl rand -base64 16)

# Update .env file with generated passwords
sed -i "s/your-super-secure-jwt-secret-change-this-in-production/$JWT_SECRET/" .env
sed -i "s/your-secure-db-password-change-this/$POSTGRES_PASSWORD/" .env
sed -i "s/your-secure-rabbitmq-password/$RABBITMQ_DEFAULT_PASS/" .env
sed -i "s/your-secure-redis-password/$REDIS_PASSWORD/" .env

echo "🔑 Passwords generated and saved to .env file"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start production containers
echo "🏗️ Building and starting production containers..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check container status
echo "📊 Checking container status..."
docker-compose -f docker-compose.prod.yml ps

# Show logs
echo "📋 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=10

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Your application is now running at:"
echo "   Frontend: http://20.106.187.119:3000"
echo "   API: http://20.106.187.119:8080"
echo "   RabbitMQ Management: http://20.106.187.119:15672"
echo ""
echo "🔐 Admin credentials:"
echo "   Email: admin@meds.com"
echo "   Password: Admin@123"
echo ""
echo "📝 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down"
echo "🔄 To restart: docker-compose -f docker-compose.prod.yml restart"
