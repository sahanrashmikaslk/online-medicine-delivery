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

````
Internet → Azure VM (20.106.187.119)
    ↓
┌───────────────────────────────────────────────────────────────────────────────┐
│                              DOCKER NETWORK                                   │
│                                                                               │
│  ┌─────────────────┐                      ┌─────────────────┐                 │
│  │   React Web     │◄──── HTTP/HTTPS ────►│  API Gateway    │                 │
│  │   Frontend      │                      │  (Express.js)   │                 │
│  │   Port: 3000    │                      │   Port: 8080    │                 │
│  │                 │                      │                 │                 │
│  │ • User Interface│                      │ • Authentication│                 │
│  │ • Vite Dev      │                      │ • Route Proxy   │                 │
│  │ • Tailwind CSS  │                      │ • CORS Handling │                 │
│  └─────────────────┘                      └─────────┬───────┘                 │
│                                                     │                         │
│                               ┌─────────────────────┼─────────────────────┐   │
│                               │                     │                     │   │
│                               ▼                     ▼                     ▼   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │Auth Service │    │Cat. Service │    │Order Service│    │Delivery Srv │     │
│  │Port: 3001   │    │Port: 3002   │    │Port: 3003   │    │Port: 3004   │     │
│  │             │    │             │    │             │    │             │     │
│  │• JWT Auth   │    │• Medicine   │    │• Order Mgmt │    │• Track Deliv│     │
│  │• User Mgmt  │    │• Inventory  │    │• Cart Logic │    │• Status Upd │     │
│  │• Login/Reg  │    │• Search API │    │• Payment    │    │• Logistics  │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
│         │                  │                  │                  │            │
│         │                  │                  │                  │            │
│         ▼                  ▼                  ▼                  ▼            │
│  ┌─────────────────────────┬──────────────────┬──────────────────┐            │
│  │                         │                  │                  │            │
│  ▼                         ▼                  ▼                  ▼            │
│┌──────────────┐     ┌──────────────┐  ┌──────────────┐  ┌─────────────┐       │
││ PostgreSQL   │     │   Redis      │  │  RabbitMQ    │  │Notification │       │
││ Database     │     │   Cache      │  │ Message Que  │  │Service      │       │
││Port: 5432    │     │Port: 6379    │  │Port: 5672    │  │Port: 3005   │       │
││              │     │              │  │              │  │             │       │
││• User Data   │     │• Session Mgmt│  │• Event Bus   │  │• Email/SMS  │       │
││• Medicine Cat│     │• Fast Lookup │  │• Async Comm  │  │• Push Notif │       │
││• Orders      │     │• Performance │  │• Order Events│  │• Real-time  │       │
││• Delivery    │     │• Cache Layer │  │• Delivery Evt│  │  Updates    │       │
│└──────────────┘     └──────────────┘  └──────────────┘  └─────────────┘       │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
````

### Data Flow Overview
```
USER REQUEST FLOW:
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  User   │───►│   React     │───►│ API Gateway │───►│  Services   │
│Browser  │    │  Frontend   │    │   (8080)    │    │(Auth/Cat/   │
│         │    │   (3000)    │    │             │    │ Ord/Del)    │
└─────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                      │                                     │
                      │            ┌─────────────┐          │
                      └───────►───►│ PostgreSQL  │◄─────────┘
                                   │  Database   │
                                   │   (5432)    │
                                   └─────────────┘

EVENT-DRIVEN COMMUNICATION:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Order Service│───►│  RabbitMQ   │───►│Delivery Srv │───►│Notification │
│  (Place)    │    │ Message Bus │    │ (Process)   │    │Service      │
│             │    │   (5672)    │    │             │    │(Notify User)│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```
## Service Configuration

### External Ports (Azure VM)
```
| Service             | Internal Port | External Port | Description        |
| ------------------- | ------------- | ------------- | ------------------ |
| Web Frontend        | 5173          | 3000          | React Application  |
| API Gateway         | 8080          | 8080          | API Gateway & Auth |
| PostgreSQL          | 5432          | 5432          | Primary Database   |
| Redis               | 6379          | 6379          | Cache Layer        |
| RabbitMQ            | 5672          | 5672          | Message Broker     |
| RabbitMQ Management | 15672         | 15672         | Management UI      |
```
### Internal Services (Docker Network)
````
| Service              | Port | Description         | Dependencies         |
| -------------------- | ---- | ------------------- | -------------------- |
| Auth Service         | 3001 | User Authentication | PostgreSQL           |
| Catalog Service      | 3002 | Medicine Catalog    | PostgreSQL, Redis    |
| Order Service        | 3003 | Order Management    | PostgreSQL, RabbitMQ |
| Delivery Service     | 3004 | Delivery Tracking   | PostgreSQL, RabbitMQ |
| Notification Service | 3005 | Notifications       | RabbitMQ             |
````
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
````

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

````

### 🔧 Manual Deployment

```bash
# 1. Set up environment
cp .env.production .env

# 2. Build and deploy
docker-compose -f docker-compose.prod.yml up --build -d

# 3. Verify deployment
docker-compose -f docker-compose.prod.yml ps
````



<div align="center">



_Access your application at: [http://20.106.187.119:3000](http://20.106.187.119:3000)_

**For support**: Check logs first → `docker-compose -f docker-compose.prod.yml logs`
