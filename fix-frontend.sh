#!/bin/bash

echo "🔧 Fixing frontend API connection..."

# Stop web service
docker-compose stop web

# Update web environment
cat > web/.env << 'WEBEOF'
VITE_API_BASE=http://20.106.187.119:8080
WEBEOF

# Remove and rebuild web container
docker-compose rm -f web
docker-compose build --no-cache web
docker-compose up -d web

echo "✅ Frontend fix completed!"

# Wait and test
sleep 15
echo "🧪 Testing frontend..."
curl -s http://localhost:3000 | head -10

echo "🌐 Access your app at: http://20.106.187.119:3000"
