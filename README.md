# Online Medicine Delivery System - Azure Deployment

**Production-ready microservices application deployed on Azure Virtual Machine**

## Overview

This is the Azure deployment branch for the Online Medicine Delivery System, specifically configured for production deployment on Azure VM (20.106.187.119). The application demonstrates modern microservices architecture with Docker containerization, API gateway pattern, and event-driven communication.

## Live Application

- **Frontend**: http://20.106.187.119:3000
- **API Gateway**: http://20.106.187.119:8080  
- **RabbitMQ Management**: http://20.106.187.119:15672

### Admin Credentials

- **Email**: admin@meds.com
- **Password**: Admin@123

## Technology Stack

### Frontend
- React 18 with Vite build system
- Tailwind CSS for styling
- Modern ES6+ JavaScript

### Backend Services
- Node.js with Express.js framework
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- Helmet for security headers
- CORS for cross-origin resource sharing

### Infrastructure
- PostgreSQL 15 - Primary database
- Redis 7 - Caching layer
- RabbitMQ 3 - Message broker
- Docker - Containerization
- Docker Compose - Service orchestration

## Architecture

```
Internet → Azure VM (20.106.187.119)
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

## Service Configuration

### External Ports (Azure VM)
| Service | Internal Port | External Port | Description |
|---------|---------------|---------------|-------------|
| Web Frontend | 5173 | 3000 | React Application |
| API Gateway | 8080 | 8080 | API Gateway & Auth |
| PostgreSQL | 5432 | 5432 | Primary Database |
| Redis | 6379 | 6379 | Cache Layer |
| RabbitMQ | 5672 | 5672 | Message Broker |
| RabbitMQ Management | 15672 | 15672 | Management UI |

### Internal Services (Docker Network)
| Service | Port | Description | Dependencies |
|---------|------|-------------|--------------|
| Auth Service | 3001 | User Authentication | PostgreSQL |
| Catalog Service | 3002 | Medicine Catalog | PostgreSQL, Redis |
| Order Service | 3003 | Order Management | PostgreSQL, RabbitMQ |
| Delivery Service | 3004 | Delivery Tracking | PostgreSQL, RabbitMQ |
| Notification Service | 3005 | Notifications | RabbitMQ |

## Quick Deployment

### Prerequisites
- Azure VM with Ubuntu 20.04+
- Docker & Docker Compose installed
- Git for repository management
- 4GB+ RAM and 20GB+ Storage
- Open ports: 3000, 8080, 5432, 6379, 5672, 15672

### One-Click Deployment
```bash
# Clone and deploy
git clone -b azure-deployment https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery
chmod +x deploy-azure.sh
./deploy-azure.sh
```

### Manual Deployment
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up --build -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Environment Configuration

### Main Environment (.env)
```bash
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

### Frontend Configuration (web/.env)
```bash
VITE_API_BASE=http://20.106.187.119:8080
```

### Gateway Configuration (gateway/.env)
```bash
PORT=8080
JWT_SECRET=supersecretjwt
ALLOWED_ORIGINS=http://20.106.187.119:3000,http://20.106.187.119:8080
```

## API Testing

### Authentication
```bash
# Register new user
curl -X POST http://20.106.187.119:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123", "role": "CUSTOMER"}'

# Login user
curl -X POST http://20.106.187.119:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@meds.com", "password": "Admin@123"}'
```

### Medicine Catalog
```bash
# Get all medicines
curl http://20.106.187.119:8080/catalog/medicines

# Search medicines
curl "http://20.106.187.119:8080/catalog/medicines?search=aspirin"
```

### Order Management
```bash
# Create order (requires auth token)
curl -X POST http://20.106.187.119:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"items": [{"medicineId": 1, "quantity": 2}], "total": 25.98}'
```

## Database Management

### PostgreSQL Access
```bash
# Connect via Docker
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d medsdb

# Connect externally
psql -h 20.106.187.119 -p 5432 -U postgres -d medsdb
```

### Sample Queries
```sql
-- View all users
SELECT id, email, role, created_at FROM users;

-- View medicines with stock
SELECT name, price, stock_quantity, category FROM medicines WHERE stock_quantity > 0;

-- View recent orders
SELECT o.id, u.email, o.total, o.status, o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC LIMIT 10;
```

### Backup and Restore
```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres medsdb > backup.sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres medsdb < backup.sql
```

## Monitoring and Logs

### Health Checks
```bash
# Check service health
curl http://20.106.187.119:8080/auth/health
curl http://20.106.187.119:8080/catalog/health

# Check database
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# Check Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

### Log Management
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs --tail=100

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f gateway
docker-compose -f docker-compose.prod.yml logs -f auth
docker-compose -f docker-compose.prod.yml logs -f catalog

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f --tail=20
```

## Troubleshooting

### Common Issues

#### 1. "Failed to fetch" Errors
```bash
# Check CORS configuration
docker-compose -f docker-compose.prod.yml logs gateway | grep -i cors

# Verify environment variables
docker-compose -f docker-compose.prod.yml exec gateway env | grep ALLOWED

# Test API connectivity
curl -I http://20.106.187.119:8080/catalog/medicines
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose -f docker-compose.prod.yml ps postgres

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test connection
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres
```

#### 3. Service Startup Problems
```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Restart in dependency order
docker-compose -f docker-compose.prod.yml restart postgres redis rabbitmq
sleep 10
docker-compose -f docker-compose.prod.yml restart auth catalog order delivery notification
sleep 10
docker-compose -f docker-compose.prod.yml restart gateway web
```

### Quick Fixes
```bash
# Restart specific service
docker-compose -f docker-compose.prod.yml restart gateway

# Complete system restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Clean restart (CAUTION: Deletes data)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up --build -d
```

## Security Features

- JWT Authentication with secure secret keys
- CORS Protection configured for Azure VM
- Rate limiting (120 requests per minute)
- Helmet.js security headers
- Environment variable security
- Docker network isolation
- bcrypt password hashing

## Performance Optimization

### Scaling Options
```bash
# Horizontal scaling
docker-compose -f docker-compose.prod.yml up --scale catalog=2 --scale order=2 -d

# Monitor resources
docker stats

# Check performance
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

## Maintenance

### Regular Tasks
- **Daily**: Check service health and logs
- **Weekly**: Database backup and cleanup
- **Monthly**: Security updates and performance review
- **Quarterly**: Full system backup and disaster recovery testing

### Emergency Procedures
```bash
# Emergency stop
docker-compose -f docker-compose.prod.yml down

# Emergency restart
docker-compose -f docker-compose.prod.yml restart

# Emergency backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres medsdb > emergency_backup_$(date +%Y%m%d_%H%M%S).sql
```

## Project Structure

```
online-medicine-delivery/
├── deploy-azure.sh                   # Azure deployment script
├── docker-compose.prod.yml           # Production Docker Compose
├── docker-compose.yml                # Development Docker Compose
├── .env                              # Main environment configuration
├── .env.production                   # Production environment template
├── gateway/                          # API Gateway service
│   ├── Dockerfile
│   ├── package.json
│   ├── .env                          # Gateway configuration
│   └── src/index.js                  # Gateway implementation
├── services/                         # Microservices
│   ├── auth/                         # Authentication service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── .env                      # Auth service config
│   │   └── src/index.js              # Auth API implementation
│   ├── catalog/                      # Medicine catalog service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── .env                      # Catalog service config
│   │   └── src/index.js              # Catalog API + Redis cache
│   ├── order/                        # Order management service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── .env                      # Order service config
│   │   └── src/index.js              # Order API + RabbitMQ
│   ├── delivery/                     # Delivery tracking service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── .env                      # Delivery service config
│   │   └── src/index.js              # Delivery API + RabbitMQ
│   └── notification/                 # Notification service
│       ├── Dockerfile
│       ├── package.json
│       ├── .env                      # Notification service config
│       └── src/index.js              # Notification consumer
├── web/                              # React frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── .env                          # Frontend API configuration
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── api.js                    # API client
│       ├── components/               # React components
│       └── pages/                    # Application pages
├── scripts/                          # Database scripts
│   └── db/init.sql                   # Database schema and seed data
└── k8s/                              # Kubernetes deployment files
    ├── gateway-deploy.yaml
    ├── services-deploy.yaml
    └── ingress.yaml
```

## Features

### Customer Features
- User registration and authentication
- Medicine search and filtering
- Shopping cart management
- Order placement and tracking
- Responsive design for mobile and desktop
- Real-time order status updates

### Admin Features
- Admin dashboard with analytics
- Medicine inventory management (CRUD operations)
- Order management with status updates
- Delivery status tracking
- Stock management with alerts
- User management

### System Features
- High performance with Redis caching
- Event-driven architecture for loose coupling
- Horizontal scalability
- Health checks and monitoring
- Security hardening
- Containerized deployment

## Contributing

1. Make changes in the azure-deployment branch
2. Test locally if possible
3. Deploy and test on Azure VM
4. Commit and push changes
5. Document any configuration changes

## Support

For deployment issues:
1. Check service logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify service status: `docker-compose -f docker-compose.prod.yml ps`
3. Test health endpoints: `curl http://20.106.187.119:8080/auth/health`
4. Check environment configurations

---

**Production Ready Azure Deployment**

Access your application at: http://20.106.187.119:3000
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

| Service                 | Internal Port | External Port | Description                  |
| ----------------------- | ------------- | ------------- | ---------------------------- |
| **Web Frontend**        | 5173          | 3000          | React Application            |
| **API Gateway**         | 8080          | 8080          | API Gateway & Authentication |
| **PostgreSQL**          | 5432          | 5432          | Primary Database             |
| **Redis**               | 6379          | 6379          | Caching Layer                |
| **RabbitMQ**            | 5672          | 5672          | Message Broker               |
| **RabbitMQ Management** | 15672         | 15672         | Management UI                |

### 🔐 Internal Services (Docker Network)

| Service                  | Port | Description             | Dependencies         |
| ------------------------ | ---- | ----------------------- | -------------------- |
| **Auth Service**         | 3001 | User Authentication     | PostgreSQL           |
| **Catalog Service**      | 3002 | Medicine Catalog        | PostgreSQL, Redis    |
| **Order Service**        | 3003 | Order Management        | PostgreSQL, RabbitMQ |
| **Delivery Service**     | 3004 | Delivery Tracking       | PostgreSQL, RabbitMQ |
| **Notification Service** | 3005 | Email/SMS Notifications | RabbitMQ             |

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
