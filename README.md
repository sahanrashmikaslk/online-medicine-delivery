# Online Medicine Delivery System

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/Rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)

_A cloud-native microservices architecture demonstrating modern e-commerce patterns for pharmaceutical delivery_

</div>

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Microservices Details](#microservices-details)
- [Database Schema](#database-schema)
- [Event-Driven Architecture](#event-driven-architecture)
- [Security Features](#security-features)
- [Deployment Options](#deployment-options)
- [Monitoring & Observability](#monitoring--observability)
- [Development Guide](#development-guide)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

This is a **production-ready microservices demonstration** built for the **EC7205 Cloud Computing** assignment. It showcases modern cloud-native patterns including:

- **Microservices Architecture** with clear service boundaries
- **Event-Driven Communication** using RabbitMQ
- **API Gateway Pattern** with authentication and routing
- **Database per Service** pattern with PostgreSQL
- **Caching Layer** with Redis for performance
- **Containerization** with Docker and Docker Compose
- **Kubernetes Deployment** with horizontal scaling
- **Security-First Design** with JWT, bcrypt, and input validation

### Business Context

Online medicine delivery platform enabling:

- **Customers**: Browse medicines, place orders, track deliveries
- **Administrators**: Manage inventory, process orders, update delivery status
- **System**: Real-time notifications, stock management, delivery tracking

## Architecture

### High-Level Architecture

```
┌─────────────────┐                            ┌─────────────────┐
│   React Web     │                            │   Admin Panel   │
│     Client      │                            │     (Web)       │
└─────────┬───────┘                            └────────┬────────┘
          │                                             │
          └─────────────────────────────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      API Gateway          │
                    │   (Auth + Routing)        │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
   ┌────▼────┐  ┌────▼────┐  ┌───▼───┐  ┌────▼────┐  ┌────▼───────┐
   │  Auth   │  │Catalog  │  │ Order │  │Delivery │  │Notification│
   │Service  │  │Service  │  │Service│  │Service  │  │  Service   │
   └─────────┘  └─────────┘  └───────┘  └─────────┘  └────────────┘
        │            │           │           │             │
        └────────────┼───────────┼───────────┼─────────────┘
                     │           │           │
              ┌──────▼───┐   ┌───▼────┐  ┌──▼──────┐
              │PostgreSQL│   │ Redis  │  │RabbitMQ │
              │ Database │   │ Cache  │  │ Events  │
              └──────────┘   └────────┘  └─────────┘
```

### Request Flow

1. **User Authentication**: Client → Gateway → Auth Service
2. **Catalog Browsing**: Client → Gateway → Catalog Service → Redis Cache → PostgreSQL
3. **Order Placement**: Client → Gateway → Order Service → PostgreSQL → RabbitMQ Event
4. **Delivery Creation**: RabbitMQ → Delivery Service → PostgreSQL → RabbitMQ Event
5. **Notifications**: RabbitMQ → Notification Service (Email/SMS/Push)

## Features

### Customer Features

- **User Registration & Authentication** with JWT tokens
- **Medicine Search & Filtering** with real-time results
- **Shopping Cart Management** with session persistence
- **Order Placement & Tracking** with real-time updates
- **Responsive Design** for mobile and desktop
- **Real-time Notifications** for order status changes

### Admin Features

- **Admin Dashboard** with comprehensive analytics
- **Medicine Inventory Management** (CRUD operations)
- **Order Management** with status updates
- **Delivery Status Tracking** with real-time updates
- **Stock Management** with low-stock alerts
- **Role-based Access Control** (RBAC)

### System Features

- **High Performance** with Redis caching
- **Event-Driven Architecture** for loose coupling
- **Security Hardening** with multiple layers
- **Horizontal Scalability** with Kubernetes
- **Containerized Deployment** with Docker
- **Health Checks** and monitoring endpoints

## Technology Stack

### Frontend

- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript ES6+** - Modern JavaScript features

### Backend Services

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JSON Web Tokens (JWT)** - Authentication
- **bcrypt** - Password hashing
- **Zod** - Schema validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Databases & Storage

- **PostgreSQL 15** - Primary database
- **Redis 7** - Caching and session storage
- **RabbitMQ 3** - Message broker for events

### DevOps & Deployment

- **Docker** - Containerization
- **Docker Compose** - Local orchestration
- **Kubernetes** - Production orchestration
- **GitHub Actions** - CI/CD pipeline
- **Nginx** - Reverse proxy (in K8s)

## Quick Start

### Prerequisites

- **Docker Desktop** 4.0+ (with Docker Compose)
- **Git** for cloning
- **8GB RAM** recommended
- **Ports Available**: 5173, 8080, 5432, 6379, 5672, 15672

### Step 1: Clone Repository

```bash
git clone https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery
```

### Step 2: Environment Setup

```bash
# Copy all environment files
cp .env.example .env
cp gateway/.env.example gateway/.env
cp services/auth/.env.example services/auth/.env
cp services/catalog/.env.example services/catalog/.env
cp services/order/.env.example services/order/.env
cp services/delivery/.env.example services/delivery/.env
cp services/notification/.env.example services/notification/.env
cp web/.env.example web/.env
```

### Step 3: Start Application

```bash
# Start all services (first run takes 2-3 minutes)
docker compose up --build

# Or run in background
docker compose up --build -d
```

### Step 4: Access Application

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **PostgreSQL**: localhost:5432 (postgres/postgres/medsdb)
- **Redis**: localhost:6379

### Step 5: Login

**Admin Credentials**:

- **Email**: `admin@meds.com`
- **Password**: `Admin@123`

## Project Structure

```
online-medicine-delivery/
├── docs/                          # Documentation
│   └── assignment-doc.md              # Assignment details
├── scripts/                       # Database scripts
│   └── db/init.sql                    # Database schema & seed data
├── gateway/                       # API Gateway service
│   ├── Dockerfile                     # Container definition
│   ├── package.json                   # Dependencies
│   ├── .env.example                   # Environment template
│   └── src/index.js                   # Gateway implementation
├── services/                      # Microservices
│   ├── auth/                      # Authentication service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── src/index.js              # Auth API (login, register, JWT)
│   ├── catalog/                   # Medicine catalog service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── src/index.js              # Catalog API + Redis cache
│   ├── order/                     # Order management service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── src/index.js              # Order API + RabbitMQ publisher
│   ├── delivery/                  # Delivery tracking service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── src/index.js              # Delivery API + event consumer
│   └── notification/              # Notification service
│       ├── Dockerfile
│       ├── package.json
│       ├── .env.example
│       └── src/index.js              # Event consumer for notifications
├── web/                          # React frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx                  # App entry point
│       ├── App.jsx                   # Main app component
│       ├── api.js                    # API client with error handling
│       ├── components/
│       │   └── Navbar.jsx            # Navigation component
│       └── pages/
│           ├── Login.jsx             # Login page
│           ├── Register.jsx          # Registration page
│           ├── Catalog.jsx           # Medicine browser
│           ├── Cart.jsx              # Shopping cart
│           ├── Orders.jsx            # Order history
│           └── AdminDashboard.jsx    # Admin panel
├── k8s/                          # Kubernetes manifests
│   ├── gateway-deploy.yaml           # Gateway deployment
│   ├── services-deploy.yaml          # Services deployments
│   └── ingress.yaml                  # Ingress configuration
├── .github/workflows/            # CI/CD pipeline
│   └── ci.yml                        # GitHub Actions workflow
├── docker-compose.yml               # Local development setup
├── .env.example                     # Root environment template
└── README.md                        # This file
```

## API Documentation

### Authentication Endpoints

```
POST /auth/register         # User registration
POST /auth/login           # User login (returns JWT)
GET  /auth/me              # Get current user info
```

### Catalog Endpoints

```
GET    /catalog/medicines           # List all medicines (with search)
GET    /catalog/medicines/:id       # Get specific medicine
POST   /catalog/medicines           # Create medicine (Admin only)
PUT    /catalog/medicines/:id       # Update medicine (Admin only)
DELETE /catalog/medicines/:id       # Delete medicine (Admin only)
```

### Order Endpoints

```
GET  /orders              # Get user's orders
GET  /orders/all          # Get all orders (Admin only)
POST /orders              # Create new order
```

### Delivery Endpoints

```
GET   /delivery/:orderId   # Get delivery status
PATCH /delivery/:orderId   # Update delivery status (Admin only)
```

### Example API Calls

#### User Registration

```bash
curl -X POST http://localhost:8080/auth/register
  -H "Content-Type: application/json"
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "role": "CUSTOMER"
  }'
```

#### Login

```bash
curl -X POST http://localhost:8080/auth/login
  -H "Content-Type: application/json"
  -d '{
    "email": "admin@meds.com",
    "password": "Admin@123"
  }'
```

#### Create Medicine (Admin)

```bash
curl -X POST http://localhost:8080/catalog/medicines
  -H "Content-Type: application/json"
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
  -d '{
    "name": "Aspirin 100mg",
    "description": "Pain relief medication",
    "price": 12.99,
    "stock": 500
  }'
```

## Microservices Details

### Auth Service (Port 3001)

**Responsibilities**:

- User registration and authentication
- JWT token generation and validation
- Password hashing with bcrypt
- Role-based access control

**Key Features**:

- Secure password hashing (bcrypt rounds: 10)
- JWT expiration (12 hours)
- Input validation with Zod
- Role differentiation (ADMIN/CUSTOMER)

### Catalog Service (Port 3002)

**Responsibilities**:

- Medicine inventory management
- Search and filtering capabilities
- Redis caching for performance
- CRUD operations for medicines

**Key Features**:

- Redis caching with 30-second TTL
- Search by name/description
- Admin-only write operations
- Cache invalidation on updates

### Order Service (Port 3003)

**Responsibilities**:

- Order creation and management
- Stock validation and deduction
- Event publishing to RabbitMQ
- Transaction management

**Key Features**:

- Atomic stock deduction
- Order validation with Zod
- Event publishing on order creation
- User-specific order filtering

### Delivery Service (Port 3004)

**Responsibilities**:

- Delivery record management
- Status tracking and updates
- Event consumption from RabbitMQ
- Delivery status notifications

**Key Features**:

- Automatic delivery creation on new orders
- Status progression tracking
- Event-driven architecture
- Admin delivery management

### Notification Service (Port 3005)

**Responsibilities**:

- Event consumption for notifications
- Email/SMS sending (simulated)
- Push notification handling
- Multi-channel communication

**Key Features**:

- Event-driven notifications
- Multiple notification channels
- Extensible for different providers
- Error handling and retries

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Medicines Table

```sql
CREATE TABLE medicines (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0
);
```

### Orders Table

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PLACED',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Order Items Table

```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  medicine_id INT NOT NULL REFERENCES medicines(id),
  quantity INT NOT NULL,
  price NUMERIC(10,2) NOT NULL
);
```

### Deliveries Table

```sql
CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id),
  status TEXT NOT NULL DEFAULT 'PENDING',
  address TEXT NOT NULL,
  courier TEXT DEFAULT 'N/A',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Event-Driven Architecture

### Events

1. **order.created** - Published when new order is placed
2. **delivery.updated** - Published when delivery status changes

### Event Flow

```
Order Placement → order.created → Delivery Service → delivery.updated → Notification Service
                             ↘                                      ↗
                               Notification Service ←──────────────┘
```

### RabbitMQ Configuration

- **Exchange**: `meds_events` (topic)
- **Queues**: `delivery_queue`, `notification_queue`
- **Routing Keys**: `order.created`, `delivery.updated`

## Security Features

### Authentication & Authorization

- **JWT Tokens** with 12-hour expiration
- **bcrypt Password Hashing** with salt rounds: 10
- **Role-Based Access Control** (ADMIN/CUSTOMER)
- **Bearer Token Authentication** for API access

### Input Validation

- **Zod Schema Validation** for all endpoints
- **SQL Injection Prevention** with parameterized queries
- **XSS Protection** with Helmet middleware
- **CORS Configuration** for cross-origin requests

### Security Headers

```javascript
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
```

### Rate Limiting

- **API Gateway**: 100 requests per 15 minutes per IP
- **Service Level**: 1000 requests per hour per service

## Deployment Options

### Local Development (Docker Compose)

```bash
# Standard deployment
docker compose up --build

# Background deployment
docker compose up --build -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Clean reset
docker compose down -v && docker compose up --build
```

### Production (Kubernetes)

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods

# View service endpoints
kubectl get services

# Check logs
kubectl logs -f deployment/gateway
```

### Kubernetes Features

- **Horizontal Pod Autoscaling** (HPA)
- **Rolling Updates** with zero downtime
- **Health Checks** (readiness/liveness probes)
- **Service Discovery** with built-in DNS
- **Load Balancing** across pod replicas

## Monitoring & Observability

### Health Check Endpoints

All services expose `/health` endpoints:

```bash
curl http://localhost:8080/auth/health
curl http://localhost:8080/catalog/health
curl http://localhost:8080/order/health
curl http://localhost:8080/delivery/health
curl http://localhost:8080/notification/health
```

### Logging

- **Structured Logging** with JSON format
- **Request/Response Logging** in gateway
- **Error Tracking** with stack traces
- **Service Correlation** with request IDs

### Metrics (Future Enhancement)

- **Prometheus** integration ready
- **Custom Metrics** for business KPIs
- **Grafana Dashboards** for visualization
- **Alert Manager** for incident response

## Development Guide

### Adding a New Service

1. Create service directory under `services/`
2. Add Dockerfile and package.json
3. Implement Express.js server with health endpoint
4. Add service to docker-compose.yml
5. Update gateway routing if needed
6. Add Kubernetes manifests

### Database Migrations

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d medsdb

# Run custom SQL
\i /path/to/migration.sql
```

### Environment Variables

Each service uses these common variables:

- `PORT` - Service port number
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `REDIS_URL` - Redis connection string
- `RABBITMQ_URL` - RabbitMQ connection string

### Code Style

- **ESLint** configuration included
- **Prettier** for code formatting
- **Conventional Commits** for git messages
- **Function-based** React components

## Testing

### Manual Testing

```bash
# Test user registration
curl -X POST http://localhost:8080/auth/register
  -H "Content-Type: application/json"
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test medicine search
curl "http://localhost:8080/catalog/medicines?search=pain"

# Test order creation (requires auth token)
curl -X POST http://localhost:8080/orders
  -H "Content-Type: application/json"
  -H "Authorization: Bearer YOUR_TOKEN"
  -d '{"items":[{"medicineId":1,"quantity":2}],"total":25.98}'
```

### Load Testing

```bash
# Install Artillery.js
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 http://localhost:8080/catalog/medicines
```

### Integration Tests

Basic integration tests are included in each service's package.json:

```bash
# Run tests for a specific service
docker compose exec auth npm test
```

## Troubleshooting

### Common Issues

#### Port Conflicts

```bash
# Check what's using a port
netstat -tulpn | grep :8080

# Kill process using port
sudo kill -9 $(lsof -t -i:8080)
```

#### Database Connection Issues

```bash
# Check PostgreSQL logs
docker compose logs postgres

# Verify database exists
docker compose exec postgres psql -U postgres -c "\l"

# Recreate database
docker compose down -v && docker compose up postgres
```

#### Service Communication Issues

```bash
# Check service logs
docker compose logs gateway
docker compose logs auth

# Verify network connectivity
docker compose exec gateway ping auth
```

#### RabbitMQ Issues

```bash
# Check RabbitMQ management UI
open http://localhost:15672

# View queue status
docker compose exec rabbitmq rabbitmqctl list_queues
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Scale specific service
docker compose up --scale catalog=3

# Clear Redis cache
docker compose exec redis redis-cli FLUSHALL
```

### Debug Mode

Enable debug logging by setting environment variables:

```bash
DEBUG=* docker compose up
```

## Contributing

### Development Setup

1. Fork the repository
2. Clone your fork
3. Create feature branch: `git checkout -b feature/amazing-feature`
4. Make changes and test
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open Pull Request

### Coding Standards

- Use meaningful variable names
- Add comments for complex logic
- Follow REST API conventions
- Include error handling
- Write unit tests for new features

### Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update the README if adding features
4. Get code review approval
5. Merge to main branch

## Acknowledgments

- Built for **EC7205 Cloud Computing** course
- Inspired by modern e-commerce architectures
- Uses industry-standard technologies and patterns
- Special thanks to the open-source community

---

<div align="center">
<strong>Online Medicine Delivery - Demonstrating Cloud-Native Excellence</strong><br>
<!-- <em>Built with ❤️ for learning and demonstration purposes</em> -->
</div>
