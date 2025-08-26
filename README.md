# Online Medicine Delivery System - Azure Deployment

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/Rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Azure](https://img.shields.io/badge/microsoft%20azure-0089D0?style=for-the-badge&logo=microsoft-azure&logoColor=white)

_Production Deployment on Azure VM_

</div>

# Online Medicine Delivery System - Azure Deployment

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/Rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Azure](https://img.shields.io/badge/microsoft%20azure-0089D0?style=for-the-badge&logo=microsoft-azure&logoColor=white)

_Production Deployment on Azure VM_

</div>

## Overview

This is the **Azure deployment branch** for the Online Medicine Delivery System. This branch is specifically configured for production deployment on Azure VM with secure configurations, environment management, and proper scaling.

## 🌐 Live Application

- **🖥️ Frontend**: [http://20.106.187.119:3000](http://20.106.187.119:3000)
- **🔗 API Gateway**: [http://20.106.187.119:8080](http://20.106.187.119:8080)
- **🐰 RabbitMQ Management**: [http://20.106.187.119:15672](http://20.106.187.119:15672)

### 🔑 Login Credentials

**Admin Credentials**:
- **📧 Email**: `admin@meds.com`
- **🔒 Password**: `Admin@123`

## 🚀 Quick Deployment

### Prerequisites

- **Azure VM** with Ubuntu 20.04+ 
- **Docker** & **Docker Compose** installed
- **Git** for repository management
- **4GB+ RAM** and **20GB+ Storage**
- **Open Ports**: 3000, 8080, 5432, 6379, 5672, 15672

### 🎯 One-Click Deployment

```bash
# Clone repository and switch to Azure branch
git clone https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery
git checkout azure-deployment

# Run deployment script
chmod +x deploy-azure.sh
./deploy-azure.sh
```

### 🔧 Manual Deployment

```bash
# 1. Set up environment
cp .env.production .env

# 2. Build and deploy
docker-compose -f docker-compose.prod.yml up --build -d

# 3. Verify deployment
docker-compose -f docker-compose.prod.yml ps
```

## 🏗️ Architecture

```
Internet
    ↓
[Azure VM: 20.106.187.119]
    ↓
┌─────────────────────────────────────────────────────────┐
│                  Docker Network                         │
│                                                         │
│  ┌─────────────┐    ┌──────────────┐                   │
│  │ React Web   │◄──►│ API Gateway  │                   │
│  │ Port: 3000  │    │ Port: 8080   │                   │
│  └─────────────┘    └──────┬───────┘                   │
│                            │                           │
│    ┌───────────────────────┼───────────────────────┐   │
│    │                       │                       │   │
│ ┌──▼──┐ ┌─────┐ ┌──────┐ ┌────────┐ ┌─────────────┐   │
│ │Auth │ │Cat. │ │Order │ │Delivery│ │Notification │   │
│ │3001 │ │3002 │ │3003  │ │3004    │ │3005         │   │
│ └─┬───┘ └─┬───┘ └┬─────┘ └┬───────┘ └┬────────────┘   │
│   │       │      │        │          │                │
│   └───────┼──────┼────────┼──────────┘                │
│           │      │        │                           │
│  ┌────────▼┐ ┌───▼────┐ ┌─▼────────┐                  │
│  │PostgreSQL│ │ Redis  │ │RabbitMQ  │                  │
│  │Port:5432 │ │Port:6379│ │Port:5672 │                  │
│  └─────────┘ └────────┘ └──────────┘                  │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Service Configuration

### 🌐 External Ports (Azure VM)

| Service | Internal Port | External Port | Description |
|---------|---------------|---------------|-------------|
| **Web Frontend** | 5173 | 3000 | React Application |
| **API Gateway** | 8080 | 8080 | API Gateway & Authentication |
| **PostgreSQL** | 5432 | 5432 | Primary Database |
| **Redis** | 6379 | 6379 | Caching Layer |
| **RabbitMQ** | 5672 | 5672 | Message Broker |
| **RabbitMQ Management** | 15672 | 15672 | Management UI |

### 🔐 Internal Services (Docker Network)

| Service | Port | Description | Dependencies |
|---------|------|-------------|--------------|
| **Auth Service** | 3001 | User Authentication | PostgreSQL |
| **Catalog Service** | 3002 | Medicine Catalog | PostgreSQL, Redis |
| **Order Service** | 3003 | Order Management | PostgreSQL, RabbitMQ |
| **Delivery Service** | 3004 | Delivery Tracking | PostgreSQL, RabbitMQ |
| **Notification Service** | 3005 | Email/SMS Notifications | RabbitMQ |

## 🔧 Environment Configuration

### 📁 Main Environment (.env)

```bash
# Production Configuration
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
```

### 🌐 Frontend Configuration (web/.env)

```bash
# API Endpoint Configuration
VITE_API_BASE=http://20.106.187.119:8080
```

### 🚪 Gateway Configuration (gateway/.env)

```bash
# Gateway Security Configuration
PORT=8080
JWT_SECRET=supersecretjwt
ALLOWED_ORIGINS=http://20.106.187.119:3000,http://20.106.187.119:8080
```

## 🐳 Docker Operations

### 🚀 Deployment Commands

```bash
# Deploy all services in production mode
docker-compose -f docker-compose.prod.yml up --build -d

# View service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.prod.yml logs -f gateway

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart specific service
docker-compose -f docker-compose.prod.yml restart auth
```

### 🔄 Updates & Maintenance

```bash
# Update specific service
docker-compose -f docker-compose.prod.yml up --build -d gateway

# Scale services (if needed)
docker-compose -f docker-compose.prod.yml up --scale catalog=2 -d

# Clean up unused resources
docker system prune -f

# Complete reset (DANGER: Deletes all data)
docker-compose -f docker-compose.prod.yml down -v
docker volume prune -f
```

## 🧪 API Testing

### 🔐 Authentication

```bash
# Register new user
curl -X POST http://20.106.187.119:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "role": "CUSTOMER"
  }'

# Login user
curl -X POST http://20.106.187.119:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@meds.com",
    "password": "Admin@123"
  }'
```

### 💊 Medicine Catalog

```bash
# Get all medicines
curl http://20.106.187.119:8080/catalog/medicines

# Get specific medicine
curl http://20.106.187.119:8080/catalog/medicines/1

# Search medicines
curl "http://20.106.187.119:8080/catalog/medicines?search=aspirin"
```

### 🛒 Order Management

```bash
# Create order (requires auth token)
curl -X POST http://20.106.187.119:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {"medicineId": 1, "quantity": 2},
      {"medicineId": 3, "quantity": 1}
    ],
    "total": 45.97
  }'

# Get user orders
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://20.106.187.119:8080/orders
```

## 🗄️ Database Management

### 🐘 PostgreSQL Access

```bash
# Connect to database container
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d medsdb

# Connect from external client
psql -h 20.106.187.119 -p 5432 -U postgres -d medsdb
```

### 📊 Database Queries

```sql
-- View all users
SELECT id, email, role, created_at FROM users;

-- View all medicines with stock
SELECT name, price, stock_quantity, category FROM medicines WHERE stock_quantity > 0;

-- View recent orders
SELECT o.id, u.email, o.total, o.status, o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 10;

-- View order items details
SELECT oi.order_id, m.name, oi.quantity, oi.price
FROM order_items oi
JOIN medicines m ON oi.medicine_id = m.id
WHERE oi.order_id = 1;
```

### 🗂️ Database Backup & Restore

```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres medsdb > backup.sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres medsdb < backup.sql
```

## 📊 Monitoring & Logs

### 🔍 Health Checks

```bash
# Check service health
curl http://20.106.187.119:8080/auth/health
curl http://20.106.187.119:8080/catalog/health

# Check database connection
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# Check Redis connection
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

### 📋 Log Management

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs --tail=100

# View logs by service
docker-compose -f docker-compose.prod.yml logs -f auth
docker-compose -f docker-compose.prod.yml logs -f catalog
docker-compose -f docker-compose.prod.yml logs -f gateway

# View error logs only
docker-compose -f docker-compose.prod.yml logs | grep -i error

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f --tail=20
```

## 🔧 Troubleshooting

### 🚨 Common Issues

#### 1. **"Failed to fetch" Error**

```bash
# Check CORS configuration
docker-compose -f docker-compose.prod.yml logs gateway | grep -i cors

# Verify environment variables
docker-compose -f docker-compose.prod.yml exec gateway env | grep ALLOWED

# Test API connectivity
curl -I http://20.106.187.119:8080/catalog/medicines
```

#### 2. **Database Connection Issues**

```bash
# Check PostgreSQL status
docker-compose -f docker-compose.prod.yml ps postgres

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test database connection
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres
```

#### 3. **Service Startup Issues**

```bash
# Check service dependencies
docker-compose -f docker-compose.prod.yml ps

# Restart services in order
docker-compose -f docker-compose.prod.yml restart postgres
sleep 10
docker-compose -f docker-compose.prod.yml restart redis rabbitmq
sleep 10
docker-compose -f docker-compose.prod.yml restart auth catalog order delivery notification
sleep 10
docker-compose -f docker-compose.prod.yml restart gateway web
```

### 🛠️ Quick Fixes

```bash
# Fix deployment with automated script
chmod +x fix-azure-deployment.sh
./fix-azure-deployment.sh

# Reset specific service
docker-compose -f docker-compose.prod.yml rm -f gateway
docker-compose -f docker-compose.prod.yml up -d gateway

# Complete system reset (CAUTION: Deletes all data)
docker-compose -f docker-compose.prod.yml down -v
docker system prune -f
./deploy-azure.sh
```

## 🔐 Security Configuration

### 🛡️ Security Features

- **JWT Authentication** with secure secret keys
- **CORS Protection** configured for Azure VM
- **Helmet.js** security headers (CSP disabled for deployment)
- **Rate Limiting** (120 requests per minute)
- **Environment Variable** security
- **Docker Network** isolation

### 🔑 Password Management

```bash
# Generate secure passwords (for production)
openssl rand -base64 32  # JWT Secret
openssl rand -base64 16  # Database Password
openssl rand -base64 16  # RabbitMQ Password
openssl rand -base64 16  # Redis Password
```

## 🚀 Performance Optimization

### 📈 Scaling Options

```bash
# Scale horizontally
docker-compose -f docker-compose.prod.yml up --scale catalog=2 --scale order=2 -d

# View resource usage
docker stats

# Optimize memory usage
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "SHOW shared_buffers;"
```

### 🎯 Performance Monitoring

```bash
# Monitor container performance
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Check disk usage
docker system df

# Monitor logs for performance issues
docker-compose -f docker-compose.prod.yml logs | grep -i "slow\|timeout\|error"
```

## 🔄 CI/CD Integration

### 📦 Deployment Workflow

1. **Code Changes** → Push to `azure-deployment` branch
2. **Pull Latest** → `git pull origin azure-deployment`
3. **Deploy** → `./deploy-azure.sh`
4. **Verify** → Check health endpoints and logs
5. **Monitor** → Watch logs and performance metrics

### 🔧 Automated Updates

```bash
# Update and deploy script
#!/bin/bash
git pull origin azure-deployment
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
docker-compose -f docker-compose.prod.yml ps
```

## 📞 Support & Maintenance

### 🆘 Emergency Procedures

```bash
# Emergency stop
docker-compose -f docker-compose.prod.yml down

# Emergency restart
docker-compose -f docker-compose.prod.yml restart

# Emergency backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres medsdb > emergency_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 📋 Maintenance Schedule

- **Daily**: Check service health and logs
- **Weekly**: Database backup and cleanup
- **Monthly**: Security updates and performance review
- **Quarterly**: Full system backup and disaster recovery testing

---

<div align="center">

**🌟 Production Ready Azure Deployment! 🚀**

_Access your application at: [http://20.106.187.119:3000](http://20.106.187.119:3000)_

**For support**: Check logs first → `docker-compose -f docker-compose.prod.yml logs`

