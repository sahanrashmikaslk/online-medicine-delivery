# Online Medicine Delivery System - Local Development Setup

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/Rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

_Complete Local Development Environment Guide_

</div>

## Overview

This guide will help you set up the complete Online Medicine Delivery System on your local machine for development purposes. The system consists of microservices architecture with React frontend, Node.js backends, and supporting infrastructure services.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker Compose](#quick-start-with-docker-compose)
- [Manual Development Setup](#manual-development-setup)
- [Project Structure](#project-structure)
- [Microservices Architecture](#microservices-architecture)
- [Local Development URLs](#local-development-urls)
- [API Testing](#api-testing)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)

## Prerequisites

Before starting, ensure you have the following installed on your machine:

### Required Software

```bash
# Check if you have these installed:
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 8.0.0
docker --version  # Should be >= 20.0.0
docker-compose --version  # Should be >= 2.0.0
git --version     # Any recent version
```

### Installation Links

- **Node.js**: [https://nodejs.org/](https://nodejs.org/) (Download LTS version)
- **Docker Desktop**: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Git**: [https://git-scm.com/downloads](https://git-scm.com/downloads)

### System Requirements

- **RAM**: Minimum 8GB (recommended 16GB)
- **Storage**: At least 5GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **Ports**: Make sure ports 3000-3005, 5173, 5432, 6379, 5672, 8080, 15672 are available

## Quick Start with Docker Compose

The fastest way to get the entire system running locally is using Docker Compose.

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery

# Switch to the main development branch (or stay on google-cloud-deployment)
git checkout main  # or git checkout google-cloud-deployment
```

### Step 2: Environment Configuration

Create the main environment file:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your settings
```

Create `.env` file in the root directory:

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=medsdb
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/medsdb

# Redis Configuration
REDIS_URL=redis://redis:6379

# RabbitMQ Configuration
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-development

# Email Configuration (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Port Configuration
GATEWAY_PORT=8080
WEB_PORT=5173

# Development Environment
NODE_ENV=development
```

### Step 3: Configure Frontend Environment

```bash
# Navigate to web directory
cd web

# Copy the frontend environment file
cp .env.example .env

# Edit web/.env file
```

Create `web/.env` file:

```bash
# Frontend Environment Variables
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Step 4: Start the Complete System

```bash
# Return to root directory
cd ..

# Start all services with Docker Compose
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

### Step 5: Verify Installation

Wait for all services to start (usually 2-3 minutes), then verify:

```bash
# Check if all services are running
docker-compose ps

# Test the frontend
curl http://localhost:5173

# Test the API gateway
curl http://localhost:8080/auth/health

# Test individual services
curl http://localhost:8080/catalog/medicines
```

### Step 6: Access the Application

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API Gateway**: [http://localhost:8080](http://localhost:8080)
- **RabbitMQ Management**: [http://localhost:15672](http://localhost:15672) (guest/guest)

### Default Admin Credentials

```
Email: admin@meds.com
Password: Admin@123
```

## Manual Development Setup

For active development, you might want to run services individually for better debugging and hot reloading.

### Step 1: Start Infrastructure Services

```bash
# Start only the infrastructure services
docker-compose up -d postgres redis rabbitmq

# Wait for services to be healthy
docker-compose ps
```

### Step 2: Install Dependencies

```bash
# Install gateway dependencies
cd gateway
npm install
cd ..

# Install service dependencies
cd services/auth
npm install
cd ../catalog
npm install
cd ../order
npm install
cd ../delivery
npm install
cd ../notification
npm install
cd ../..

# Install frontend dependencies
cd web
npm install
cd ..
```

### Step 3: Environment Files for Each Service

Create environment files for each service:

**`services/auth/.env`:**

```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medsdb
JWT_SECRET=your-super-secret-jwt-key-for-development
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

**`services/catalog/.env`:**

```bash
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medsdb
REDIS_URL=redis://localhost:6379
```

**`services/order/.env`:**

```bash
NODE_ENV=development
PORT=3003
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medsdb
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

**`services/delivery/.env`:**

```bash
NODE_ENV=development
PORT=3004
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medsdb
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

**`services/notification/.env`:**

```bash
NODE_ENV=development
PORT=3005
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medsdb
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

**`gateway/.env`:**

```bash
NODE_ENV=development
PORT=8080
AUTH_SERVICE_URL=http://localhost:3001
CATALOG_SERVICE_URL=http://localhost:3002
ORDER_SERVICE_URL=http://localhost:3003
DELIVERY_SERVICE_URL=http://localhost:3004
NOTIFICATION_SERVICE_URL=http://localhost:3005
CORS_ORIGIN=http://localhost:5173
```

### Step 4: Initialize Database

```bash
# Connect to PostgreSQL and run initialization script
docker exec -i $(docker-compose ps -q postgres) psql -U postgres -d medsdb < scripts/db/init.sql

# Or run the script manually
psql -h localhost -p 5432 -U postgres -d medsdb -f scripts/db/init.sql
```

### Step 5: Start Services Individually

Open separate terminal windows/tabs for each service:

```bash
# Terminal 1: Auth Service
cd services/auth
npm run dev  # or npm start

# Terminal 2: Catalog Service
cd services/catalog
npm run dev

# Terminal 3: Order Service
cd services/order
npm run dev

# Terminal 4: Delivery Service
cd services/delivery
npm run dev

# Terminal 5: Notification Service
cd services/notification
npm run dev

# Terminal 6: API Gateway
cd gateway
npm run dev

# Terminal 7: Frontend
cd web
npm run dev
```

### Step 6: Verify Individual Services

Test each service health endpoint:

```bash
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Catalog Service
curl http://localhost:3003/health  # Order Service
curl http://localhost:3004/health  # Delivery Service
curl http://localhost:3005/health  # Notification Service
curl http://localhost:8080/auth/health  # Gateway routing
curl http://localhost:5173  # Frontend
```

## Project Structure

```
online-medicine-delivery/
├── 📁 services/                      # Microservices backend
│   ├── 📁 auth/                      # Authentication service
│   │   ├── 📄 Dockerfile
│   │   ├── 📄 package.json
│   │   ├── 📄 .env                   # Auth service environment
│   │   └── 📁 src/
│   │       └── 📄 index.js           # JWT auth + Google OAuth + Email
│   ├── 📁 catalog/                   # Medicine catalog service
│   │   ├── 📄 Dockerfile
│   │   ├── 📄 package.json
│   │   ├── 📄 .env                   # Catalog service environment
│   │   └── 📁 src/
│   │       └── 📄 index.js           # CRUD medicines + Redis cache
│   ├── 📁 order/                     # Order management service
│   │   ├── 📄 Dockerfile
│   │   ├── 📄 package.json
│   │   ├── 📄 .env                   # Order service environment
│   │   └── 📁 src/
│   │       └── 📄 index.js           # Order processing + RabbitMQ events
│   ├── 📁 delivery/                  # Delivery tracking service
│   │   ├── 📄 Dockerfile
│   │   ├── 📄 package.json
│   │   ├── 📄 .env                   # Delivery service environment
│   │   └── 📁 src/
│   │       └── 📄 index.js           # Delivery status + RabbitMQ
│   └── 📁 notification/              # Email notification service
│       ├── 📄 Dockerfile
│       ├── 📄 package.json
│       ├── 📄 .env                   # Notification service environment
│       └── 📁 src/
│           └── 📄 index.js           # Event-driven email notifications
├── 📁 gateway/                       # API Gateway
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   ├── 📄 .env                       # Gateway environment
│   └── 📁 src/
│       └── 📄 index.js               # Routes all API calls to services
├── 📁 web/                           # React frontend
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   ├── 📄 .env                       # Frontend environment
│   ├── 📄 index.html
│   ├── 📄 vite.config.js
│   ├── 📄 tailwind.config.js
│   └── 📁 src/
│       ├── 📄 App.jsx                # Main React app
│       ├── 📄 main.jsx               # Entry point
│       ├── 📄 api.js                 # API client
│       ├── 📁 components/
│       │   ├── 📄 Navbar.jsx         # Navigation
│       │   └── 📄 GoogleSignIn.jsx   # Google OAuth component
│       └── 📁 pages/
│           ├── 📄 Home.jsx           # Landing page
│           ├── 📄 Login.jsx          # User login
│           ├── 📄 Register.jsx       # User registration
│           ├── 📄 Catalog.jsx        # Medicine browse/search
│           ├── 📄 Cart.jsx           # Shopping cart
│           ├── 📄 Orders.jsx         # Order history/tracking
│           └── 📄 AdminDashboard.jsx # Admin panel
├── 📁 scripts/
│   └── 📁 db/
│       └── 📄 init.sql               # Database schema + seed data
├── 📁 gcp/                           # Kubernetes deployment files
├── 📄 docker-compose.yml             # Local development setup
├── 📄 .env                           # Main environment file
├── 📄 .env.example                   # Environment template
├── 📄 README.md                      # Production deployment guide
└── 📄 LOCAL_SETUP.md                 # This file
```

## Microservices Architecture

### System Architecture Diagram

```
                    ┌─────────────────┐
                    │   React Web     │
                    │   Frontend      │
                    │ localhost:5173  │
                    └─────────┬───────┘
                              │ HTTP Requests
                              ▼
                    ┌─────────────────┐
                    │  API Gateway    │
                    │ localhost:8080  │
                    │                 │
                    │ • Route Proxy   │
                    │ • CORS Handling │
                    │ • Load Balancing│
                    └─────────┬───────┘
                              │ Internal Routing
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Auth Service │    │Cat. Service │    │Order Service│
│:3001        │    │:3002        │    │:3003        │
│             │    │             │    │             │
│• JWT Auth   │    │• Medicine   │    │• Cart Logic │
│• Google     │    │• Inventory  │    │• Checkout   │
│• Email      │    │• Search     │    │• RabbitMQ   │
│• User Mgmt  │    │• Redis      │    │• Events     │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │
      │                  │                  │
      ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Delivery Srv │    │Notification │    │   Database  │
│:3004        │    │Service:3005 │    │ PostgreSQL  │
│             │    │             │    │ :5432       │
│• Status     │    │• Email Queue│    │             │
│• Tracking   │    │• RabbitMQ   │    │• Users      │
│• Updates    │    │• Templates  │    │• Medicines  │
│• RabbitMQ   │    │• Async Send │    │• Orders     │
└─────────────┘    └─────────────┘    │• Delivery   │
                                      └─────────────┘
         ┌─────────────┐    ┌─────────────┐
         │   Redis     │    │  RabbitMQ   │
         │ Cache:6379  │    │ Queue:5672  │
         │             │    │             │
         │• Session    │    │• Events     │
         │• Medicine   │    │• Email      │
         │• Fast Read  │    │• Async Comm │
         └─────────────┘    └─────────────┘
```

### Service Details

| Service          | Port | Purpose           | Dependencies         | Key Features                                                                       |
| ---------------- | ---- | ----------------- | -------------------- | ---------------------------------------------------------------------------------- |
| **Frontend**     | 5173 | React UI          | Gateway              | • User Interface<br>• Google OAuth<br>• Shopping Cart<br>• Responsive Design       |
| **Gateway**      | 8080 | API Router        | All Services         | • Request Routing<br>• CORS Handling<br>• Load Balancing<br>• Authentication Proxy |
| **Auth**         | 3001 | Authentication    | PostgreSQL           | • JWT Tokens<br>• Google OAuth<br>• Email Service<br>• User Management             |
| **Catalog**      | 3002 | Medicine Catalog  | PostgreSQL, Redis    | • Medicine CRUD<br>• Search & Filter<br>• Redis Caching<br>• Inventory Management  |
| **Order**        | 3003 | Order Management  | PostgreSQL, RabbitMQ | • Cart Logic<br>• Order Processing<br>• Payment Handling<br>• Event Publishing     |
| **Delivery**     | 3004 | Delivery Tracking | PostgreSQL, RabbitMQ | • Status Updates<br>• Tracking Info<br>• Event Handling<br>• Logistics             |
| **Notification** | 3005 | Email Service     | RabbitMQ             | • Email Templates<br>• Event-driven<br>• Queue Processing<br>• Async Sending       |

### Data Flow Examples

#### User Registration Flow:

```
1. User submits form → Frontend
2. Frontend → Gateway → Auth Service
3. Auth Service → PostgreSQL (create user)
4. Auth Service → RabbitMQ (welcome event)
5. Notification Service → Email sent
6. JWT token returned to Frontend
```

#### Order Placement Flow:

```
1. User places order → Frontend
2. Frontend → Gateway → Order Service
3. Order Service → PostgreSQL (create order)
4. Order Service → RabbitMQ (order.created event)
5. Notification Service → Order confirmation email
6. Delivery Service → Create delivery record
```

## Local Development URLs

### Application Access

| Service                 | URL                                              | Description       | Credentials           |
| ----------------------- | ------------------------------------------------ | ----------------- | --------------------- |
| **Main Application**    | [http://localhost:5173](http://localhost:5173)   | React frontend    | Register or use admin |
| **API Gateway**         | [http://localhost:8080](http://localhost:8080)   | All API endpoints | Bearer token required |
| **RabbitMQ Management** | [http://localhost:15672](http://localhost:15672) | Message queue UI  | guest / guest         |

### Direct Service Access (Development)

| Service              | URL                   | Health Check | Purpose                          |
| -------------------- | --------------------- | ------------ | -------------------------------- |
| Auth Service         | http://localhost:3001 | `/health`    | Authentication & user management |
| Catalog Service      | http://localhost:3002 | `/health`    | Medicine catalog & inventory     |
| Order Service        | http://localhost:3003 | `/health`    | Order processing & cart          |
| Delivery Service     | http://localhost:3004 | `/health`    | Delivery tracking & status       |
| Notification Service | http://localhost:3005 | `/health`    | Email notifications              |

### Database Connections

| Database       | Connection String                                      | GUI Tools               |
| -------------- | ------------------------------------------------------ | ----------------------- |
| **PostgreSQL** | `postgresql://postgres:postgres@localhost:5432/medsdb` | pgAdmin, DBeaver, psql  |
| **Redis**      | `redis://localhost:6379`                               | RedisInsight, redis-cli |

### Default Accounts

```bash
# Admin Account
Email: admin@meds.com
Password: Admin@123
Role: ADMIN

# Test Customer Account (create via registration)
Email: user@example.com
Password: SecurePass123
Role: CUSTOMER
```

## API Testing

### Authentication APIs

```bash
# Health check
curl http://localhost:8080/auth/health

# Register new user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123",
    "name": "Test User",
    "role": "CUSTOMER"
  }'

# Login user
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@meds.com",
    "password": "Admin@123"
  }'

# Google OAuth (requires valid Google token)
curl -X POST http://localhost:8080/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "credential": "GOOGLE_ID_TOKEN",
    "role": "CUSTOMER"
  }'
```

### Medicine Catalog APIs

```bash
# Get all medicines
curl http://localhost:8080/catalog/medicines

# Search medicines
curl "http://localhost:8080/catalog/medicines?search=aspirin"

# Get specific medicine
curl http://localhost:8080/catalog/medicines/1

# Add medicine (Admin only - requires auth token)
curl -X POST http://localhost:8080/catalog/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Medicine",
    "price": 15.99,
    "stock": 100,
    "description": "Test description",
    "category": "Pain Relief"
  }'
```

### Order Management APIs

```bash
# Create order (requires auth token)
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {"medicine_id": 1, "quantity": 2},
      {"medicine_id": 2, "quantity": 1}
    ],
    "address": "123 Main St, City, Country"
  }'

# Get user orders
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/orders

# Get all orders (Admin only)
curl -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  http://localhost:8080/orders/all

# Get specific order
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/orders/1
```

### Delivery APIs

```bash
# Update delivery status (Admin only)
curl -X PATCH http://localhost:8080/delivery/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "status": "DISPATCHED"
  }'

# Get delivery status
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/delivery/1
```

### Getting JWT Token for Testing

```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@meds.com", "password": "Admin@123"}' | \
  jq -r '.token')

# 2. Use token in subsequent requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/orders/all
```

## Database Management

### PostgreSQL Access

```bash
# Connect via Docker
docker exec -it $(docker-compose ps -q postgres) psql -U postgres -d medsdb

# Connect directly (if running locally)
psql -h localhost -p 5432 -U postgres -d medsdb

# Connect with password
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d medsdb
```

### Useful Database Queries

```sql
-- View all users
SELECT id, email, name, role, created_at FROM users;

-- View all medicines with stock
SELECT id, name, price, stock_quantity, category, description
FROM medicines
WHERE stock_quantity > 0;

-- View recent orders with customer info
SELECT o.id, u.email as customer_email, u.name as customer_name,
       o.total_amount, o.status, o.delivery_address, o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 10;

-- View order items with medicine details
SELECT oi.order_id, m.name as medicine_name, oi.quantity,
       oi.price, (oi.quantity * oi.price) as total
FROM order_items oi
JOIN medicines m ON oi.medicine_id = m.id
WHERE oi.order_id = 1;

-- View delivery status
SELECT d.id, d.order_id, d.status, d.estimated_delivery,
       d.actual_delivery, d.created_at, d.updated_at
FROM deliveries d
ORDER BY d.created_at DESC;

-- Check stock levels
SELECT name, stock_quantity,
       CASE
         WHEN stock_quantity < 10 THEN 'Low Stock'
         WHEN stock_quantity < 50 THEN 'Medium Stock'
         ELSE 'Good Stock'
       END as stock_status
FROM medicines
ORDER BY stock_quantity ASC;
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'CUSTOMER',
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medicines table
CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    category VARCHAR(255),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PLACED',
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    medicine_id INTEGER REFERENCES medicines(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Deliveries table
CREATE TABLE deliveries (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) UNIQUE,
    status VARCHAR(50) DEFAULT 'PENDING',
    estimated_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Redis Cache Management

```bash
# Connect to Redis
docker exec -it $(docker-compose ps -q redis) redis-cli

# Or connect directly
redis-cli -h localhost -p 6379

# Common Redis commands
KEYS *                    # List all keys
GET medicines:all         # Get cached medicines
DEL medicines:all         # Clear medicine cache
FLUSHALL                  # Clear all cache
INFO memory              # Check memory usage
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use

```bash
# Check what's using the port
netstat -an | grep :5173
lsof -i :5173

# Kill the process (replace PID)
kill -9 PID

# Or use different ports in .env files
WEB_PORT=5174
GATEWAY_PORT=8081
```

#### 2. Docker Issues

```bash
# Restart Docker services
docker-compose down
docker-compose up -d

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check service logs
docker-compose logs postgres
docker-compose logs auth
docker-compose logs gateway

# Check container status
docker-compose ps
docker-compose top
```

#### 3. Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test database connection
docker exec $(docker-compose ps -q postgres) pg_isready -U postgres

# Reset database
docker-compose down
docker volume rm online-medicine-delivery_pgdata
docker-compose up -d postgres
# Wait for startup, then re-run init.sql
```

#### 4. Environment Variable Issues

```bash
# Check if .env files exist
ls -la .env
ls -la web/.env
ls -la services/auth/.env

# Validate environment variables
docker-compose config

# Restart services after .env changes
docker-compose restart
```

#### 5. Frontend Build Issues

```bash
# Clear node_modules and reinstall
cd web
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run build -- --force

# Check frontend logs
docker-compose logs web
```

#### 6. API Gateway Issues

```bash
# Check gateway logs
docker-compose logs gateway

# Test service connectivity from gateway
docker exec $(docker-compose ps -q gateway) curl http://auth:3001/health

# Restart gateway
docker-compose restart gateway
```

#### 7. RabbitMQ Issues

```bash
# Check RabbitMQ status
docker-compose logs rabbitmq

# Access RabbitMQ management UI
# http://localhost:15672 (guest/guest)

# Reset RabbitMQ
docker-compose restart rabbitmq
```

### Health Check Commands

```bash
# Complete system health check script
#!/bin/bash

echo "=== System Health Check ==="

# Check Docker containers
echo "1. Docker Containers:"
docker-compose ps

# Check database
echo -e "\n2. Database Connection:"
docker exec $(docker-compose ps -q postgres) pg_isready -U postgres

# Check Redis
echo -e "\n3. Redis Connection:"
docker exec $(docker-compose ps -q redis) redis-cli ping

# Check RabbitMQ
echo -e "\n4. RabbitMQ Connection:"
docker exec $(docker-compose ps -q rabbitmq) rabbitmq-diagnostics -q ping

# Check service health endpoints
echo -e "\n5. Service Health Endpoints:"
curl -s http://localhost:8080/auth/health || echo "Auth service down"
curl -s http://localhost:8080/catalog/health || echo "Catalog service down"
curl -s http://localhost:8080/orders/health || echo "Order service down"
curl -s http://localhost:8080/delivery/health || echo "Delivery service down"

# Check frontend
echo -e "\n6. Frontend:"
curl -s -I http://localhost:5173 | head -1 || echo "Frontend down"

echo -e "\n=== Health Check Complete ==="
```

### Debug Mode

To run services in debug mode for development:

```bash
# Add to service .env files
NODE_ENV=development
DEBUG=*

# Or run with debug logging
DEBUG=* npm start

# For specific modules
DEBUG=express:* npm start
DEBUG=rabbitmq:* npm start
```

## Development Workflow

### Making Changes

#### Frontend Development

```bash
# Start frontend in development mode
cd web
npm run dev

# The frontend will automatically reload on changes
# Edit files in web/src/
```

#### Backend Service Development

```bash
# For hot reloading, install nodemon
npm install -g nodemon

# Start service with auto-restart
cd services/auth
nodemon src/index.js

# Or modify package.json to include dev script:
# "scripts": {
#   "dev": "nodemon src/index.js"
# }
```

#### Database Changes

```bash
# Make changes to scripts/db/init.sql
# Then restart database container
docker-compose restart postgres

# Or apply changes manually
psql -h localhost -p 5432 -U postgres -d medsdb -f scripts/db/new_changes.sql
```

### Testing Workflow

```bash
# 1. Start infrastructure
docker-compose up -d postgres redis rabbitmq

# 2. Start services individually for testing
# Use separate terminals for each service

# 3. Test API endpoints
curl http://localhost:8080/auth/health

# 4. Run frontend
cd web
npm run dev

# 5. Test complete workflow:
#    - Register user
#    - Login
#    - Browse medicines
#    - Add to cart
#    - Place order
#    - Check email notifications
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request for review
```

### Deployment Preparation

```bash
# Test production build
docker-compose -f docker-compose.prod.yml up -d

# Run tests
npm test

# Build for production
cd web
npm run build

# Verify all services
./health-check.sh
```

---

## Additional Resources

### Documentation Links

- **Node.js**: [https://nodejs.org/docs/](https://nodejs.org/docs/)
- **React**: [https://react.dev/](https://react.dev/)
- **PostgreSQL**: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- **Redis**: [https://redis.io/docs/](https://redis.io/docs/)
- **RabbitMQ**: [https://www.rabbitmq.com/docs](https://www.rabbitmq.com/docs)
- **Docker Compose**: [https://docs.docker.com/compose/](https://docs.docker.com/compose/)

### Useful Tools

- **API Testing**: [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/)
- **Database GUI**: [pgAdmin](https://www.pgadmin.org/), [DBeaver](https://dbeaver.io/)
- **Redis GUI**: [RedisInsight](https://redis.com/redis-enterprise/redis-insight/)
- **Code Editor**: [VS Code](https://code.visualstudio.com/)

### Support

For local development issues:

1. **Check Docker**: `docker-compose ps` and `docker-compose logs SERVICE_NAME`
2. **Check Ports**: Ensure no conflicts with other applications
3. **Check Environment**: Verify all `.env` files are configured correctly
4. **Check Dependencies**: Run `npm install` in each service directory
5. **Reset Everything**: `docker-compose down && docker-compose up -d --build`

---

<div align="center">

**🚀 Happy Coding! 🚀**

_Your local Online Medicine Delivery System is ready for development!_

**Quick Access URLs:**

- Frontend: [http://localhost:5173](http://localhost:5173)
- API Gateway: [http://localhost:8080](http://localhost:8080)
- RabbitMQ: [http://localhost:15672](http://localhost:15672)

</div>
