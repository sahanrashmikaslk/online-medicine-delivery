# Online Medicine Delivery System - Local Development

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/Rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

_Local Development Setup for Online Medicine Delivery Platform_

</div>

## Overview

This is the **local development branch** for the Online Medicine Delivery System. This branch is specifically configured to run the entire microservices application locally using Docker Compose with optimized settings for development.

## Quick Start

### Prerequisites

- **Docker Desktop** 4.0+ (with Docker Compose)
- **Git** for cloning
- **8GB RAM** recommended
- **Ports Available**: 5173, 8080, 5432, 6379, 5672, 15672

### Step 1: Clone & Switch to Local Development Branch

```bash
git clone https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery
git checkout local-development
```

### Step 2: Start Application

```bash
# Start all services (first run takes 2-3 minutes)
docker compose up --build

# Or run in background
docker compose up --build -d
```

### Step 3: Access Application

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **PostgreSQL**: localhost:5432 (postgres/postgres/medsdb)
- **Redis**: localhost:6379

### Step 4: Login Credentials

**Admin Credentials**:
- **Email**: `admin@meds.com`
- **Password**: `Admin@123`

## Local Development Configuration

### Service Ports

- **Web Frontend**: 5173 (Vite dev server)
- **API Gateway**: 8080
- **Auth Service**: 3001
- **Catalog Service**: 3002
- **Order Service**: 3003
- **Delivery Service**: 3004
- **Notification Service**: 3005
- **PostgreSQL**: 5432
- **Redis**: 6379
- **RabbitMQ**: 5672, 15672 (management UI)

### Environment Configuration

All environment files are pre-configured for local development:

- **API Base URL**: `http://localhost:8080`
- **Database**: Local PostgreSQL container
- **Redis**: Local Redis container
- **RabbitMQ**: Local RabbitMQ container
- **Project Name**: `meds-local` (to avoid conflicts)

## Development Commands

### Basic Operations

```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f gateway

# Stop all services
docker compose down

# Remove volumes and start fresh
docker compose down -v && docker compose up --build
```

### Development Workflow

```bash
# Rebuild specific service after code changes
docker compose up --build gateway

# Scale a service for testing
docker compose up --scale catalog=2

# Execute commands in containers
docker compose exec postgres psql -U postgres -d medsdb
docker compose exec redis redis-cli
```

## Architecture

```
┌─────────────────┐
│   React Web     │  ← Frontend on localhost:5173
│   (Vite Dev)    │
└─────────┬───────┘
          │
   ┌──────▼──────┐
   │ API Gateway │  ← Gateway on localhost:8080
   │ (Port 8080) │
   └──────┬──────┘
          │
    ┌─────┼─────┐─────┐─────┐─────┐
    │     │     │     │     │     │
┌───▼┐ ┌─▼──┐ ┌▼───┐ ┌▼────┐ ┌▼──────┐
│Auth│ │Cat.│ │Ord.│ │Del. │ │Notif. │  ← Microservices
└─┬──┘ └─┬──┘ └┬───┘ └┬────┘ └┬──────┘
  │      │     │      │       │
  └──────┼─────┼──────┼───────┘
         │     │      │
  ┌──────▼┐ ┌──▼───┐ ┌▼────────┐
  │PostgreSQL Redis│ │RabbitMQ │  ← Infrastructure
  └─────────┘ └────┘ └─────────┘
```

## Testing the Application

### 1. User Registration

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "role": "CUSTOMER"
  }'
```

### 2. User Login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@meds.com",
    "password": "Admin@123"
  }'
```

### 3. Browse Medicines

```bash
curl http://localhost:8080/catalog/medicines
```

### 4. Create Order (requires auth token)

```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {"medicineId": 1, "quantity": 2}
    ],
    "total": 25.98
  }'
```

## Database Access

### Connect to PostgreSQL

```bash
# Using Docker Compose
docker compose exec postgres psql -U postgres -d medsdb

# Using external client
psql -h localhost -p 5432 -U postgres -d medsdb
```

### Sample Queries

```sql
-- View all users
SELECT * FROM users;

-- View all medicines
SELECT * FROM medicines;

-- View orders with user details
SELECT o.id, u.email, o.total, o.status, o.created_at 
FROM orders o 
JOIN users u ON o.user_id = u.id;
```

## Redis Access

```bash
# Connect to Redis CLI
docker compose exec redis redis-cli

# View cached medicine data
redis-cli KEYS "medicine:*"

# Clear all cache
redis-cli FLUSHALL
```

## RabbitMQ Management

- **URL**: http://localhost:15672
- **Username**: guest
- **Password**: guest

### Viewing Queues and Messages

1. Open RabbitMQ Management UI
2. Go to "Queues" tab
3. View message flow in `delivery_queue` and `notification_queue`

## Troubleshooting

### Port Conflicts

```bash
# Check if ports are in use
netstat -tulpn | grep :8080
netstat -tulpn | grep :5173

# Kill process using a port (if needed)
sudo kill -9 $(lsof -t -i:8080)
```

### Service Issues

```bash
# Check service health
curl http://localhost:8080/auth/health
curl http://localhost:8080/catalog/health

# View service logs
docker compose logs auth
docker compose logs catalog
docker compose logs postgres
```

### Database Issues

```bash
# Reset database completely
docker compose down -v
docker volume prune -f
docker compose up postgres
```

### Clear Everything and Start Fresh

```bash
# Complete reset
docker compose down -v
docker system prune -f
docker compose up --build
```

## Development Features

### Hot Reload

- **Frontend**: Vite provides hot reload for React components
- **Backend**: Restart containers after code changes with `docker compose up --build <service>`

### Debugging

- All services log to stdout/stderr
- Use `docker compose logs -f <service>` to follow logs
- Enable debug mode: `DEBUG=* docker compose up`

### Code Changes

When you make changes to code:

1. **Frontend changes**: Auto-reload with Vite
2. **Backend changes**: Rebuild container with `docker compose up --build <service>`
3. **Database changes**: Update `scripts/db/init.sql` and restart postgres

## Environment Variables

### Main .env file
```
COMPOSE_PROJECT_NAME=meds-local
JWT_SECRET=supersecretjwt
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=medsdb
GATEWAY_PORT=8080
WEB_PORT=5173
```

### Web .env file
```
VITE_API_BASE=http://localhost:8080
```

## Available Scripts

### Package.json scripts in each service

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run linting
npm run lint
```

## Contributing

1. Make changes in the `local-development` branch
2. Test locally with `docker compose up`
3. Commit and push changes
4. Create pull request to merge back to main

## Support

For issues specific to local development:

1. Check Docker Desktop is running
2. Ensure ports 5173, 8080, 5432, 6379, 5672, 15672 are available
3. Try `docker compose down -v && docker compose up --build`
4. Check logs with `docker compose logs`

---

<div align="center">
<strong>Local Development Setup Complete! 🚀</strong><br>
<em>Happy coding!</em>
</div>
