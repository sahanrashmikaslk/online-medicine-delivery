# Online Medicine Delivery System - Google Cloud Platform Deployment

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/Rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)

_Production Deployment on Google Kubernetes Engine (GKE)_

</div>

## Overview

This is the Google Cloud Platform deployment branch for the Online Medicine Delivery System, specifically configured for production deployment on Google Kubernetes Engine. The application demonstrates modern microservices architecture with Kubernetes orchestration, integrated Google OAuth authentication, email notifications, and event-driven communication.

## Live Application

- **Application URL**: https://34.128.184.43.nip.io
- **API Base URL**: https://34.128.184.43.nip.io/api

### Admin Credentials

- **Email**: admin@meds.com
- **Password**: Admin@123

## Technology Stack

### Frontend

- React 18 with Vite build system
- Tailwind CSS for styling
- Google Sign-In integration
- Modern ES6+ JavaScript

### Backend Services

- Node.js with Express.js framework
- Google OAuth 2.0 authentication
- JSON Web Tokens (JWT) for session management
- bcrypt for password hashing
- Nodemailer for email notifications
- Helmet for security headers
- CORS for cross-origin resource sharing

### Infrastructure

- PostgreSQL 15 - Primary database
- Redis 7 - Caching layer
- RabbitMQ 3 - Message broker for event-driven communication
- Docker - Containerization
- Google Kubernetes Engine (GKE) - Container orchestration
- Google Container Registry (GCR) - Container image storage
- Google Cloud Load Balancer - Ingress controller

## Architecture

```
Internet → Google Cloud Load Balancer (34.128.184.43)
    ↓
┌───────────────────────────────────────────────────────────────────────────────┐
│                          GOOGLE KUBERNETES ENGINE                             │
│                        Namespace: medicine-delivery                           │
│                           Ingress Domain: 34.128.184.43.nip.io              │
│                                                                               │
│  ┌─────────────────┐                      ┌─────────────────┐                 │
│  │   React Web     │◄──── Ingress ───────►│  API Gateway    │                 │
│  │   Frontend      │      (nip.io)        │  (Express.js)   │                 │
│  │                 │                      │                 │                 │
│  │ • User Interface│                      │ • Authentication│                 │
│  │ • Google OAuth  │                      │ • Route Proxy   │                 │
│  │ • Nginx Server  │                      │ • CORS Handling │                 │
│  │ • Static Assets │                      │ • API Routing   │                 │
│  └─────────────────┘                      └─────────┬───────┘                 │
│                                                     │                         │
│                               ┌─────────────────────┼─────────────────────┐   │
│                               │                     │                     │   │
│                               ▼                     ▼                     ▼   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │Auth Service │    │Cat. Service │    │Order Service│    │Delivery Srv │     │
│  │ClusterIP    │    │ClusterIP    │    │ClusterIP    │    │ClusterIP    │     │
│  │:3001        │    │:3002        │    │:3003        │    │:3004        │     │
│  │             │    │             │    │             │    │             │     │
│  │• JWT Auth   │    │• Medicine   │    │• Order Mgmt │    │• Track Deliv│     │
│  │• Google Auth│    │• Inventory  │    │• Cart Logic │    │• Status Upd │     │
│  │• Email Svc  │    │• Search API │    │• Payment    │    │• Logistics  │     │
│  │• User Mgmt  │    │• Redis Cache│    │• RabbitMQ   │    │• RabbitMQ   │     │
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
││ClusterIP     │     │ClusterIP     │  │ClusterIP     │  │ClusterIP    │       │
││:5432         │     │:6379         │  │:5672,:15672  │  │:3005        │       │
││              │     │              │  │              │  │             │       │
││• User Data   │     │• Session Mgmt│  │• Event Bus   │  │• Email Notif│       │
││• Medicine Cat│     │• Fast Lookup │  │• Async Comm  │  │• Order Conf │       │
││• Orders      │     │• Performance │  │• Order Events│  │• Welcome Msg│       │
││• Delivery    │     │• Cache Layer │  │• Delivery Evt│  │• Real-time  │       │
││• OAuth Data  │     │              │  │              │  │  Updates    │       │
│└──────────────┘     └──────────────┘  └──────────────┘  └─────────────┘       │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
GOOGLE OAUTH FLOW:
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  User   │───►│   React     │───►│Google OAuth │───►│Auth Service │
│Browser  │    │  Frontend   │    │Service      │    │(Verify &    │
│         │    │(Google SDK) │    │(External)   │    │ Create JWT) │
└─────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                      │                                     │
                      │            ┌─────────────┐          │
                      └───────►───►│ PostgreSQL  │◄─────────┘
                                   │(User Data & │
                                   │ OAuth Info) │
                                   └─────────────┘

EVENT-DRIVEN NOTIFICATIONS:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Order Service│───►│  RabbitMQ   │───►│Auth Service │───►│ Email Sent  │
│  (Place)    │    │ Message Bus │    │(Send Email) │    │ (Welcome/   │
│             │    │             │    │             │    │  Confirm)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Kubernetes Service Configuration

### Current Service Architecture

All services now operate through the unified ingress domain with ClusterIP services for internal communication.

```
| Service              | Type      | Internal Port | External Access | Description         |
| -------------------- | --------- | ------------- | --------------- | ------------------- |
| Ingress Controller   | Ingress   | 80/443        | 34.128.184.43   | Main entry point    |
| frontend-cluster-ip  | ClusterIP | 3000          | via ingress     | React Application   |
| gateway-cluster-ip   | ClusterIP | 8080          | via ingress     | API Gateway         |
| auth-cluster-ip      | ClusterIP | 3001          | internal        | Authentication      |
| catalog-cluster-ip   | ClusterIP | 3002          | internal        | Medicine Catalog    |
| order-cluster-ip     | ClusterIP | 3003          | internal        | Order Management    |
| delivery-cluster-ip  | ClusterIP | 3004          | internal        | Delivery Tracking   |
| notification-cluster-ip | ClusterIP | 3005       | internal        | Email Notifications |
| postgres-cluster-ip  | ClusterIP | 5432          | internal        | Primary Database    |
| redis-cluster-ip     | ClusterIP | 6379          | internal        | Cache Layer         |
| rabbitmq-cluster-ip  | ClusterIP | 5672,15672    | internal        | Message Broker      |
```

### Ingress Configuration

```yaml
# Current ingress setup
spec:
  rules:
    - host: 34.128.184.43.nip.io
      http:
        paths:
          - path: /api/*
            backend:
              service:
                name: gateway-cluster-ip
                port: 8080
          - path: /*
            backend:
              service:
                name: frontend-cluster-ip
                port: 3000
```

### Pod Deployments

```
| Deployment    | Replicas | Image Registry                          | Status  | Features               |
| ------------- | -------- | --------------------------------------- | ------- | ---------------------- |
| auth          | 1        | gcr.io/.../auth-service                | Running | JWT + Google OAuth     |
| catalog       | 1        | gcr.io/.../catalog-service             | Running | Medicine inventory     |
| order         | 2        | gcr.io/.../order-service               | Running | Order processing       |
| delivery      | 2        | gcr.io/.../delivery-service            | Running | Delivery tracking      |
| notification  | 1        | gcr.io/.../notification-service        | Running | Email notifications    |
| frontend      | 2        | gcr.io/.../frontend                    | Running | React + Google Sign-In |
| gateway       | 1        | gcr.io/.../gateway-service             | Running | API routing            |
| postgres      | 1        | postgres:15                            | Running | Primary database       |
| redis         | 1        | redis:7-alpine                         | Running | Caching layer          |
| rabbitmq      | 1        | rabbitmq:3-management-alpine           | Running | Message broker         |
```

## Quick Deployment

### Prerequisites

- Google Cloud Platform account with billing enabled
- Google Cloud SDK (gcloud) installed and configured
- kubectl configured for GKE cluster
- Docker installed for local development
- 4GB+ RAM cluster nodes and sufficient storage
- Google Cloud Build API enabled
- Google Artifact Registry API enabled

### GKE Cluster Setup

```bash
# Set up environment
export PROJECT_ID=your-project-id
export CLUSTER_NAME=medicine-delivery-cluster
export ZONE=us-central1-a

# Create GKE cluster
gcloud container clusters create $CLUSTER_NAME \
  --zone=$ZONE \
  --num-nodes=3 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=5 \
  --machine-type=e2-standard-2

# Get cluster credentials
gcloud container clusters get-credentials $CLUSTER_NAME --zone=$ZONE
```

### Container Registry Setup

```bash
# Create Artifact Registry repository
gcloud artifacts repositories create online-medicine \
  --repository-format=docker \
  --location=us-central1 \
  --description="Online Medicine Delivery"

# Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### Application Deployment

```bash
# Clone repository
git clone -b google-cloud-deployment https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery

# Build and push all service images
gcloud builds submit services/auth/ --tag us-central1-docker.pkg.dev/$PROJECT_ID/online-medicine/auth-service
gcloud builds submit services/catalog/ --tag us-central1-docker.pkg.dev/$PROJECT_ID/online-medicine/catalog-service
gcloud builds submit services/order/ --tag us-central1-docker.pkg.dev/$PROJECT_ID/online-medicine/order-service
gcloud builds submit services/delivery/ --tag us-central1-docker.pkg.dev/$PROJECT_ID/online-medicine/delivery-service
gcloud builds submit services/notification/ --tag us-central1-docker.pkg.dev/$PROJECT_ID/online-medicine/notification-service
gcloud builds submit gateway/ --tag us-central1-docker.pkg.dev/$PROJECT_ID/online-medicine/gateway-service
gcloud builds submit web/ --tag us-central1-docker.pkg.dev/$PROJECT_ID/online-medicine/frontend

# Deploy to Kubernetes
kubectl apply -f gcp/namespace.yaml
kubectl apply -f gcp/postgres.yaml
kubectl apply -f gcp/redis.yaml
kubectl apply -f gcp/rabbitmq.yaml
kubectl apply -f gcp/init-db-job.yaml
kubectl apply -f gcp/microservices.yaml
kubectl apply -f gcp/gateway.yaml
kubectl apply -f gcp/frontend.yaml
```

## Environment Configuration

### Kubernetes ConfigMaps and Secrets

```bash
# Database configuration
kubectl create secret generic postgres-secret \
  --from-literal=username=postgres \
  --from-literal=password=postgres \
  --from-literal=database=medsdb \
  -n medicine-delivery

# RabbitMQ configuration
kubectl create secret generic rabbitmq-secret \
  --from-literal=username=guest \
  --from-literal=password=guest \
  -n medicine-delivery

# JWT configuration
kubectl create secret generic jwt-secret \
  --from-literal=secret=supersecretjwt \
  -n medicine-delivery
```

### Service Environment Variables

```yaml
# Example from microservices.yaml
env:
  - name: DATABASE_URL
    value: "postgresql://postgres:postgres@postgres-cluster-ip:5432/medsdb"
  - name: REDIS_URL
    value: "redis://redis-cluster-ip:6379"
  - name: RABBITMQ_URL
    value: "amqp://guest:guest@rabbitmq-cluster-ip:5672"
  - name: JWT_SECRET
    value: "supersecretjwt"
```

## API Testing

### Authentication

```bash
# Health check
curl https://34.128.184.43.nip.io/api/auth/health

# Register new user
curl -X POST http://34.128.184.43.nip.io/api/auth/register \
curl -X POST https://34.128.184.43.nip.io/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123", "role": "CUSTOMER"}'

# Login user
curl -X POST http://34.128.184.43.nip.io/api/auth/login \
curl -X POST https://34.128.184.43.nip.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@meds.com", "password": "Admin@123"}'

# Google OAuth endpoint (requires Google credential token)
curl -X POST http://34.128.184.43.nip.io/api/auth/google \
curl -X POST https://34.128.184.43.nip.io/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"credential": "GOOGLE_ID_TOKEN", "role": "CUSTOMER"}'
```

### Medicine Catalog

```bash
# Get all medicines
curl http://34.128.184.43.nip.io/api/catalog/medicines
curl https://34.128.184.43.nip.io/api/catalog/medicines

# Search medicines
curl "http://34.128.184.43.nip.io/api/catalog/medicines?search=aspirin"
curl "https://34.128.184.43.nip.io/api/catalog/medicines?search=aspirin"

# Get specific medicine
curl http://34.128.184.43.nip.io/api/catalog/medicines/1
curl https://34.128.184.43.nip.io/api/catalog/medicines/1
```

### Order Management

```bash
# Create order (requires auth token)
curl -X POST http://34.128.184.43.nip.io/api/orders \
curl -X POST https://34.128.184.43.nip.io/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"items": [{"medicine_id": 1, "quantity": 2}], "address": "123 Main St"}'

# Get user orders
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://34.128.184.43.nip.io/api/orders
```

### Email Services

```bash
# Send custom email (internal service call)
curl -X POST http://34.128.184.43.nip.io/api/auth/send-email \
curl -X POST https://34.128.184.43.nip.io/api/auth/send-email \
  -H "Content-Type: application/json" \
  -d '{"to": "user@example.com", "subject": "Test", "html": "<h1>Hello</h1>"}'

# Send order confirmation
curl -X POST http://34.128.184.43.nip.io/api/auth/send-order-confirmation \
curl -X POST https://34.128.184.43.nip.io/api/auth/send-order-confirmation \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "customerName": "John", "orderDetails": {"orderId": "123", "items": [], "total": "100", "deliveryAddress": "123 Main St"}}'
```

## Database Management

### PostgreSQL Access

```bash
# Connect via kubectl
kubectl exec -it deployment/postgres -n medicine-delivery -- psql -U postgres -d medsdb

# Port forward for external access
kubectl port-forward service/postgres-cluster-ip 5432:5432 -n medicine-delivery
psql -h localhost -p 5432 -U postgres -d medsdb
```

### Sample Queries

```sql
-- View all users
SELECT id, email, role, created_at FROM users;

-- View medicines with stock
SELECT name, price, stock_quantity, category FROM medicines WHERE stock_quantity > 0;

-- View recent orders with items
SELECT o.id, u.email, o.total_amount, o.status, o.created_at,
       COUNT(oi.id) as item_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.email, o.total_amount, o.status, o.created_at
ORDER BY o.created_at DESC LIMIT 10;
```

### Backup and Restore

```bash
# Backup database
kubectl exec deployment/postgres -n medicine-delivery -- pg_dump -U postgres medsdb > backup.sql

# Restore database
kubectl exec -i deployment/postgres -n medicine-delivery -- psql -U postgres medsdb < backup.sql
```

## Monitoring and Logs

### Health Checks

```bash
# Check all service health endpoints
curl https://34.128.184.43.nip.io/api/auth/health
curl https://34.128.184.43.nip.io/api/catalog/health
curl https://34.128.184.43.nip.io/api/orders/health
curl https://34.128.184.43.nip.io/api/delivery/health
curl https://34.128.184.43.nip.io/api/notification/health

# Check frontend access
curl -I http://34.128.184.43.nip.io
curl -I https://34.128.184.43.nip.io

# Check pod status
kubectl get pods -n medicine-delivery

# Check service endpoints
kubectl get services -n medicine-delivery

# Check ingress status
kubectl get ingress -n medicine-delivery

# Check database connectivity
kubectl exec deployment/postgres -n medicine-delivery -- pg_isready -U postgres

# Check Redis connectivity
kubectl exec deployment/redis -n medicine-delivery -- redis-cli ping
```

### Log Management

```bash
# View all pod logs
kubectl logs -l app=auth -n medicine-delivery
kubectl logs -l app=catalog -n medicine-delivery
kubectl logs -l app=order -n medicine-delivery

# Follow logs in real-time
kubectl logs -f deployment/gateway -n medicine-delivery
kubectl logs -f deployment/frontend -n medicine-delivery

# View previous container logs
kubectl logs deployment/order --previous -n medicine-delivery
```

### Kubernetes Monitoring

```bash
# Check cluster resource usage
kubectl top nodes
kubectl top pods -n medicine-delivery

# View deployment status
kubectl get deployments -n medicine-delivery
kubectl describe deployment/order -n medicine-delivery

# Check horizontal pod autoscaler
kubectl get hpa -n medicine-delivery
kubectl describe hpa order-hpa -n medicine-delivery
```

## Troubleshooting

### Common Issues

#### 1. "Failed to fetch" Errors

```bash
# Check frontend environment variables
kubectl describe deployment/frontend -n medicine-delivery | grep -A 10 Environment

# Check ingress status
kubectl get ingress -n medicine-delivery

# Test API connectivity through ingress
curl -I http://34.128.184.43.nip.io/api/catalog/medicines
curl -I https://34.128.184.43.nip.io/api/catalog/medicines
curl -I https://34.128.184.43.nip.io/api/catalog/medicines

# Check if services are accessible internally
kubectl exec deployment/frontend -n medicine-delivery -- curl http://gateway-cluster-ip:8080/catalog/medicines
```

#### 2. Database Connection Issues

```bash
# Check PostgreSQL pod status
kubectl get pods -l app=postgres -n medicine-delivery

# Check PostgreSQL logs
kubectl logs deployment/postgres -n medicine-delivery

# Test database connection
kubectl exec deployment/postgres -n medicine-delivery -- pg_isready -U postgres
```

#### 3. Pod Startup Problems

```bash
# Check pod status
kubectl get pods -n medicine-delivery

# Describe problematic pods
kubectl describe pod POD_NAME -n medicine-delivery

# Check resource constraints
kubectl top pods -n medicine-delivery
kubectl describe nodes
```

#### 4. Image Pull Issues

```bash
# Check if images exist in Artifact Registry
gcloud artifacts docker images list us-central1-docker.pkg.dev/PROJECT_ID/online-medicine

# Verify service account permissions
kubectl get serviceaccount -n medicine-delivery

# Check pod events
kubectl get events -n medicine-delivery --sort-by='.metadata.creationTimestamp'
```

### Quick Fixes

```bash
# Restart specific deployment
kubectl rollout restart deployment/gateway -n medicine-delivery

# Scale deployment
kubectl scale deployment/order --replicas=2 -n medicine-delivery

# Force pod recreation
kubectl delete pod POD_NAME -n medicine-delivery

# Update deployment image
kubectl set image deployment/frontend frontend=us-central1-docker.pkg.dev/PROJECT_ID/online-medicine/frontend:latest -n medicine-delivery

# Check rollout status
kubectl rollout status deployment/frontend -n medicine-delivery
```

### Complete System Restart

```bash
# Scale down all deployments
kubectl scale deployment --all --replicas=0 -n medicine-delivery

# Wait for pods to terminate
kubectl wait --for=delete pod --all -n medicine-delivery --timeout=300s

# Scale up infrastructure first
kubectl scale deployment postgres --replicas=1 -n medicine-delivery
kubectl scale deployment redis --replicas=1 -n medicine-delivery
kubectl scale deployment rabbitmq --replicas=1 -n medicine-delivery

# Wait for infrastructure to be ready
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/redis -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/rabbitmq -n medicine-delivery

# Scale up services
kubectl scale deployment auth --replicas=1 -n medicine-delivery
kubectl scale deployment catalog --replicas=1 -n medicine-delivery
kubectl scale deployment order --replicas=2 -n medicine-delivery
kubectl scale deployment delivery --replicas=2 -n medicine-delivery
kubectl scale deployment notification --replicas=1 -n medicine-delivery

# Scale up frontend and gateway
kubectl scale deployment gateway --replicas=1 -n medicine-delivery
kubectl scale deployment frontend --replicas=1 -n medicine-delivery
```

## Security Features

- JWT Authentication with secure secret keys
- Kubernetes RBAC and network policies
- Resource quotas and limits
- Container image scanning via Google Cloud Build
- Environment variable security with Kubernetes secrets
- Pod security contexts and non-root containers
- Network isolation between services
- bcrypt password hashing

## Performance Optimization

### Scaling Options

```bash
# Horizontal Pod Autoscaling
kubectl autoscale deployment order --cpu-percent=50 --min=1 --max=10 -n medicine-delivery
kubectl autoscale deployment catalog --cpu-percent=50 --min=1 --max=5 -n medicine-delivery

# Manual scaling
kubectl scale deployment order --replicas=3 -n medicine-delivery
kubectl scale deployment delivery --replicas=3 -n medicine-delivery

# Check current scaling
kubectl get hpa -n medicine-delivery
kubectl top pods -n medicine-delivery
```

### Resource Management

```yaml
# Example resource configuration
resources:
  requests:
    memory: "64Mi"
    cpu: "50m"
  limits:
    memory: "128Mi"
    cpu: "100m"
```

### Cluster Autoscaling

```bash
# Enable cluster autoscaling (if not already enabled)
gcloud container clusters update $CLUSTER_NAME \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=10 \
  --zone=$ZONE
```

## Maintenance

### Regular Tasks

- **Daily**: Check service health and pod status
- **Weekly**: Database backup and log cleanup
- **Monthly**: Security updates and performance review
- **Quarterly**: Full system backup and disaster recovery testing

### Emergency Procedures

```bash
# Emergency scale down
kubectl scale deployment --all --replicas=0 -n medicine-delivery

# Emergency database backup
kubectl exec deployment/postgres -n medicine-delivery -- pg_dump -U postgres medsdb > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# Emergency cluster access
gcloud container clusters get-credentials $CLUSTER_NAME --zone=$ZONE

# Check cluster health
kubectl get nodes
kubectl get pods --all-namespaces
```

### Updates and Upgrades

```bash
# Update specific service
gcloud builds submit services/order/ --tag us-central1-docker.pkg.dev/$PROJECT_ID/online-medicine/order-service:v2
kubectl set image deployment/order order=us-central1-docker.pkg.dev/$PROJECT_ID/online-medicine/order-service:v2 -n medicine-delivery

# Rolling update strategy
kubectl patch deployment order -p '{"spec":{"strategy":{"type":"RollingUpdate","rollingUpdate":{"maxSurge":1,"maxUnavailable":0}}}}' -n medicine-delivery

# Monitor update progress
kubectl rollout status deployment/order -n medicine-delivery

# Rollback if needed
kubectl rollout undo deployment/order -n medicine-delivery
```

## Project Structure

```
online-medicine-delivery/
├── .git/                             # Git repository
├── .github/                          # GitHub workflows and templates
├── .gitignore                        # Git ignore configuration
├── docker-compose.yml                # Local development setup
├── gcp/                              # Google Cloud Platform deployment files
│   ├── namespace.yaml                # Kubernetes namespace configuration
│   ├── postgres.yaml                 # PostgreSQL deployment and service
│   ├── redis.yaml                    # Redis deployment and service
│   ├── rabbitmq.yaml                 # RabbitMQ deployment and service
│   ├── init-db-job.yaml             # Database initialization job
│   ├── microservices.yaml           # All microservice deployments
│   ├── gateway.yaml                  # API gateway deployment and service
│   ├── frontend.yaml                 # Frontend deployment and service
│   ├── hpa.yaml                      # Horizontal Pod Autoscaler configuration
│   └── ingress.yaml                  # Ingress configuration (optional)
├── services/                         # Microservices
│   ├── auth/                         # Authentication service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/index.js              # JWT authentication implementation
│   ├── catalog/                      # Medicine catalog service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/index.js              # Catalog API + Redis cache
│   ├── order/                        # Order management service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/index.js              # Order API + RabbitMQ events
│   ├── delivery/                     # Delivery tracking service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/index.js              # Delivery API + RabbitMQ
│   └── notification/                 # Notification service
│       ├── Dockerfile
│       ├── package.json
│       └── src/index.js              # Event-driven notifications
├── gateway/                          # API Gateway service
│   ├── Dockerfile
│   ├── package.json
│   └── src/index.js                  # Gateway routing and CORS
├── web/                              # React frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── index.html                    # HTML template
│   ├── nginx.conf                    # Nginx configuration for production
│   ├── vite.config.js               # Vite build configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   └── src/
│       ├── App.jsx                   # Main React application
│       ├── main.jsx                  # Application entry point
│       ├── index.css                 # Global styles
│       ├── api.js                    # API client configuration
│       ├── components/               # React components
│       │   └── Navbar.jsx            # Navigation component
│       └── pages/                    # Application pages
│           ├── Home.jsx              # Landing page
│           ├── Login.jsx             # User login
│           ├── Register.jsx          # User registration
│           ├── Catalog.jsx           # Medicine catalog
│           ├── Cart.jsx              # Shopping cart
│           ├── Orders.jsx            # Order history
│           └── AdminDashboard.jsx    # Admin interface
├── scripts/                          # Database scripts
│   └── db/init.sql                   # Database schema and seed data
└── README.md                         # This documentation
```

## Features

### Customer Features

- User registration with email/password or Google Sign-In
- Secure Google OAuth 2.0 authentication
- Medicine search and filtering with Redis caching
- Shopping cart management with persistent sessions
- Order placement with email confirmations
- Order tracking and status updates
- Welcome emails for new registrations
- Responsive design for mobile and desktop
- Real-time order status updates via RabbitMQ events

### Admin Features

- Admin dashboard with analytics and order overview
- Medicine inventory management (CRUD operations)
- Order management with status updates
- Delivery status tracking and management
- Stock management with low stock alerts
- User management and role assignment
- Email notification management

### System Features

- High performance with Redis caching layer
- Event-driven architecture with RabbitMQ
- Google OAuth 2.0 integration for secure authentication
- Automated email notifications (welcome, order confirmation)
- Horizontal scalability with Kubernetes
- Health checks and comprehensive monitoring
- Security hardening with Helmet and CORS
- Containerized deployment with Docker
- Ingress-based routing for unified domain access

## Contributing

1. Make changes in the google-cloud-deployment branch
2. Test locally using Docker Compose if possible
3. Build and push container images to Artifact Registry
4. Deploy and test on GKE cluster
5. Update Kubernetes manifests as needed
6. Document any configuration changes

## Support

For deployment issues:

1. Check pod logs: `kubectl logs deployment/SERVICE_NAME -n medicine-delivery`
2. Verify pod status: `kubectl get pods -n medicine-delivery`
3. Unified domain health endpoint: `curl https://34.128.184.43.nip.io/api/auth/health`
4. Check service connectivity: `kubectl get services -n medicine-delivery`
5. Verify environment configurations: `kubectl describe deployment/SERVICE_NAME -n medicine-delivery`

---

<div align="center">
Production Ready Google Cloud Deployment

_Access your application at: https://34.128.184.43.nip.io_

**Clone Repository**:

```bash
git clone https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery
git checkout google-cloud-deployment
```

**Quick Setup Google OAuth**: Add `https://34.128.184.43.nip.io` (and optionally keep `http://` variant) to your Google OAuth origins

**For support**: Check pod logs first → `kubectl logs deployment/SERVICE_NAME -n medicine-delivery`

</div>
