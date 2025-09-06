# Online Medicine Delivery System

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/Rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

**Modern Microservices Architecture with Kubernetes and CI/CD**

[ Live Demo](https://34.128.184.43.nip.io) | [Architecture](#architecture)

</div>

## Overview

A comprehensive online medicine delivery platform built with modern microservices architecture, featuring automated CI/CD pipeline, Google Cloud deployment, and real-time order tracking. The system demonstrates enterprise-grade patterns including event-driven communication, caching strategies, and secure authentication.

## Live Application

- **Frontend**: https://34.128.184.43.nip.io
- **API Base**: https://34.128.184.43.nip.io/api
- **Admin Dashboard**: Login with admin credentials below

### Test Credentials

**Admin Access:**

- Email: `admin@meds.com`
- Password: `Admin@123`

**Google OAuth:** Sign in with any Google account (automatic role assignment)

## Technology Stack

### Frontend

- **React 18** with Vite build system for fast development
- **Tailwind CSS** for responsive, utility-first styling
- **Google OAuth 2.0** integration for secure authentication
- **JavaScript ES6+** with modern React patterns
- **Nginx** for production static file serving

### Backend Services

- **Node.js 18+** with Express.js framework
- **JSON Web Tokens (JWT)** for stateless authentication
- **bcrypt** for secure password hashing
- **Nodemailer** with Gmail SMTP for email notifications
- **Helmet** for security headers and CORS protection
- **PostgreSQL** with connection pooling
- **Redis** for session management and caching
- **RabbitMQ** for asynchronous event processing

### Infrastructure

- **Google Kubernetes Engine (GKE)** for container orchestration
- **Google Cloud Load Balancer** with SSL termination
- **Google Container Registry** for image management
- **Docker** for consistent containerization
- **GitHub Actions** for automated CI/CD pipeline
- **Persistent Volumes** for database storage

## Architecture

### Microservices Overview

| Service                  | Port | Technology           | Responsibility      | Features                                         |
| ------------------------ | ---- | -------------------- | ------------------- | ------------------------------------------------ |
| **Frontend**             | 3000 | React + Vite         | User Interface      | Google OAuth, Responsive Design, Admin Dashboard |
| **API Gateway**          | 8080 | Express.js           | Request Routing     | Authentication, CORS, Rate Limiting              |
| **Auth Service**         | 3001 | Node.js + JWT        | Authentication      | Google OAuth, User Management, Email Service     |
| **Catalog Service**      | 3002 | Node.js + Redis      | Medicine Management | Inventory, Search, Caching                       |
| **Order Service**        | 3003 | Node.js + RabbitMQ   | Order Processing    | Cart, Checkout, Event Publishing                 |
| **Delivery Service**     | 3004 | Node.js + RabbitMQ   | Delivery Tracking   | Status Updates, Route Management                 |
| **Notification Service** | 3005 | Node.js + Nodemailer | Communications      | Email Alerts, Order Confirmations                |

### Data Layer

| Component      | Version | Purpose          | Configuration                                |
| -------------- | ------- | ---------------- | -------------------------------------------- |
| **PostgreSQL** | 15      | Primary Database | Connection pooling, Persistent volumes       |
| **Redis**      | 7       | Cache & Sessions | In-memory caching, Session store             |
| **RabbitMQ**   | 3       | Message Broker   | Event-driven communication, Queue management |

## Key Features

### Customer Features

**Secure Authentication** - Email/password and Google OAuth 2.0  
**Medicine Catalog** - Search, filter, and browse medications  
**Shopping Cart** - Add items, manage quantities, persistent sessions  
**Order Management** - Place orders, track status, view history  
**Email Notifications** - Welcome emails, order confirmations  
**Responsive Design** - Mobile-first, works on all devices  
**Real-time Updates** - Order status changes via WebSocket events

### Admin Features

**Admin Dashboard** - Analytics, order overview, system monitoring  
**Medicine Management** - CRUD operations, inventory control  
**Order Management** - View all orders, update delivery status  
**Customer Management** - User roles, account management  
**Delivery Tracking** - Real-time delivery status updates  
**Email Management** - Notification templates, bulk messaging

### Technical Features

**Microservices Architecture** - Scalable, maintainable service design  
**Event-Driven Communication** - RabbitMQ for async processing  
**High Performance Caching** - Redis for fast data retrieval  
**Secure API Design** - JWT tokens, input validation, rate limiting  
**Container Orchestration** - Kubernetes for high availability  
**Automated CI/CD** - GitHub Actions for continuous deployment  
**Health Monitoring** - Service health checks and metrics  
**Horizontal Scaling** - Auto-scaling based on demand

## Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery

# Quick setup with Docker Compose
cp .env.example .env
docker-compose up -d

# Access application
open http://localhost:5173
```

### Production Deployment

The application is automatically deployed to Google Cloud Platform using GitHub Actions CI/CD pipeline.

```bash
# Deploy to GKE (automated via GitHub Actions)
git push origin main

# Manual deployment
kubectl apply -f gcp/
kubectl rollout status deployment/frontend -n medicine-delivery
```

## CI/CD Pipeline

### GitHub Actions Workflow

Automated pipeline triggered on push to main branch:

### Pipeline Stages

1. **Code Quality** - ESLint, Prettier, Security scanning
2. **Build** - Multi-stage Docker builds for all services
3. **Test** - Unit tests, integration tests, API tests
4. **Push** - Images pushed to Google Container Registry
5. **Deploy** - Rolling updates to GKE cluster
6. **Verify** - Health checks and smoke tests

### Deployment Strategy

- **Rolling Updates** - Zero-downtime deployments
- **Health Checks** - Kubernetes liveness and readiness probes
- **Rollback Support** - Automatic rollback on failed deployments
- **Environment Management** - Separate configs for dev/staging/production

## API Documentation

### Authentication Endpoints

```bash
# Register new user
POST /api/auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "CUSTOMER"
}

# Login with credentials
POST /api/auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

# Google OAuth login
POST /api/auth/google
Content-Type: application/json
{
  "credential": "GOOGLE_ID_TOKEN",
  "role": "CUSTOMER"
}
```

### Medicine Catalog

```bash
# Get all medicines
GET /api/catalog/medicines

# Search medicines
GET /api/catalog/medicines?search=aspirin&category=pain-relief

# Get specific medicine
GET /api/catalog/medicines/1
```

### Order Management

```bash
# Create order
POST /api/orders
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
{
  "items": [
    {"medicine_id": 1, "quantity": 2},
    {"medicine_id": 3, "quantity": 1}
  ],
  "address": "123 Main St, City, State 12345"
}

# Get user orders
GET /api/orders
Authorization: Bearer JWT_TOKEN

# Admin: Get all orders
GET /api/orders/all
Authorization: Bearer ADMIN_JWT_TOKEN
```

### Delivery Tracking

```bash
# Update delivery status (Admin only)
PATCH /api/delivery/123
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
{
  "status": "IN_TRANSIT"
}

# Track delivery
GET /api/delivery/123
Authorization: Bearer JWT_TOKEN
```

## Development

### Project Structure

```
online-medicine-delivery/
├── web/                     # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   └── api.js         # API client
│   └── Dockerfile
├── services/               # Microservices
│   ├── auth/              # Authentication service
│   ├── catalog/           # Medicine catalog service
│   ├── order/             # Order management service
│   ├── delivery/          # Delivery tracking service
│   └── notification/      # Email notification service
├── gateway/               # API Gateway
├── gcp/                   # Kubernetes manifests
│   ├── postgres.yaml
│   ├── redis.yaml
│   ├── rabbitmq.yaml
│   └── microservices.yaml
├── scripts/               # Database initialization
├── docker-compose.yml     # Local development
└── .github/workflows/     # CI/CD pipeline
```

### Environment Configuration

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/medsdb
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672

# Authentication
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Google Cloud
GCP_PROJECT_ID=your-project-id
GCR_REGISTRY=gcr.io/your-project-id
```

### Adding New Features

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Develop & Test Locally**

   ```bash
   docker-compose up -d
   # Make changes to services
   docker-compose restart service-name
   ```

3. **Run Tests**

   ```bash
   npm test                    # Run unit tests
   npm run test:integration    # Run integration tests
   ```

4. **Deploy to Staging**

   ```bash
   git push origin feature/new-feature
   # GitHub Actions deploys to staging environment
   ```

5. **Production Deployment**
   ```bash
   git checkout main
   git merge feature/new-feature
   git push origin main
   # Automatic deployment to production
   ```

## Monitoring & Operations

### Health Checks

```bash
# Service health endpoints
curl https://34.128.184.43.nip.io/api/auth/health
curl https://34.128.184.43.nip.io/api/catalog/health
curl https://34.128.184.43.nip.io/api/orders/health
curl https://34.128.184.43.nip.io/api/delivery/health
curl https://34.128.184.43.nip.io/api/notification/health

# Kubernetes cluster health
kubectl get pods -n medicine-delivery
kubectl get services -n medicine-delivery
kubectl top pods -n medicine-delivery
```

### Logging

```bash
# View service logs
kubectl logs deployment/auth -n medicine-delivery
kubectl logs deployment/order -n medicine-delivery --tail=100

# Follow logs in real-time
kubectl logs -f deployment/gateway -n medicine-delivery

# View previous container logs
kubectl logs deployment/notification --previous -n medicine-delivery
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment order --replicas=3 -n medicine-delivery

# Auto-scaling (HPA)
kubectl autoscale deployment order --cpu-percent=50 --min=1 --max=10 -n medicine-delivery

# Check scaling status
kubectl get hpa -n medicine-delivery
```

## Security

### Authentication & Authorization

- **JWT Tokens** with configurable expiration
- **Google OAuth 2.0** integration
- **Role-based access control** (ADMIN, CUSTOMER)
- **Password hashing** with bcrypt
- **Input validation** and sanitization

### Infrastructure Security

- **HTTPS/TLS** termination at load balancer
- **Kubernetes RBAC** for pod access control
- **Network policies** for service isolation
- **Secrets management** with Kubernetes secrets
- **Container security** scanning

### Data Protection

- **Encrypted passwords** in database
- **Secure session management** with Redis
- **SQL injection prevention** with parameterized queries
- **CORS protection** configured per service
- **Rate limiting** on API endpoints

## Performance

### Optimization Features

- **Redis caching** for frequently accessed data
- **Connection pooling** for database efficiency
- **CDN integration** for static assets
- **Horizontal pod autoscaling** based on CPU/memory
- **Database indexing** for fast queries
- **Lazy loading** in React components

### Monitoring Metrics

- **Response times** for all API endpoints
- **Database query performance**
- **Memory and CPU usage** per service
- **Error rates** and exception tracking
- **User activity** and conversion metrics

## Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow ESLint configuration for code style
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all CI checks pass

## Support

### Documentation

- **Local Setup**: [LOCAL_SETUP_BRIEF.md](LOCAL_SETUP_BRIEF.md)
- **API Reference**: `/api/docs` endpoint
- **Architecture**: See diagrams above

### Troubleshooting

**Common Issues:**

1. **Service Connection Errors**

   ```bash
   kubectl get pods -n medicine-delivery
   kubectl logs deployment/SERVICE_NAME -n medicine-delivery
   ```

2. **Database Connection Issues**

   ```bash
   kubectl exec deployment/postgres -n medicine-delivery -- pg_isready
   ```

3. **Authentication Problems**
   - Check Google OAuth client ID configuration
   - Verify JWT secret is set correctly
   - Ensure CORS origins include your domain

---

<div align="center">

**[Try Live Demo](https://34.128.184.43.nip.io)**

</div>
