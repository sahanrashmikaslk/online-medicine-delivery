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

This is the Google Cloud Platform deployment branch for the Online Medicine Delivery System, specifically configured for production deployment on Google Kubernetes Engine. The application demonstrates modern microservices architecture with Kubernetes orchestration, container images stored in Google Artifact Registry, and event-driven communication.

## Live Application

- **Frontend**: http://34.173.223.100
- **API Gateway**: http://34.136.203.92

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
- Google Kubernetes Engine (GKE) - Container orchestration
- Google Artifact Registry - Container image storage
- Google Cloud Build - CI/CD pipeline

## Architecture

```
Internet → Google Cloud Load Balancer
    ↓
┌───────────────────────────────────────────────────────────────────────────────┐
│                          GOOGLE KUBERNETES ENGINE                             │
│                        Namespace: medicine-delivery                           │
│                                                                               │
│  ┌─────────────────┐                      ┌─────────────────┐                 │
│  │   React Web     │◄──── LoadBalancer ──►│  API Gateway    │                 │
│  │   Frontend      │                      │  (Express.js)   │                 │
│  │ External IP:    │                      │ External IP:    │                 │
│  │ 34.173.223.100  │                      │ 34.136.203.92   │                 │
│  │                 │                      │                 │                 │
│  │ • User Interface│                      │ • Authentication│                 │
│  │ • Nginx Server  │                      │ • Route Proxy   │                 │
│  │ • Static Assets │                      │ • CORS Handling │                 │
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
││ClusterIP     │     │ClusterIP     │  │ClusterIP     │  │ClusterIP    │       │
││:5432         │     │:6379         │  │:5672,:15672  │  │:3005        │       │
││              │     │              │  │              │  │             │       │
││• User Data   │     │• Session Mgmt│  │• Event Bus   │  │• Email/SMS  │       │
││• Medicine Cat│     │• Fast Lookup │  │• Async Comm  │  │• Push Notif │       │
││• Orders      │     │• Performance │  │• Order Events│  │• Real-time  │       │
││• Delivery    │     │• Cache Layer │  │• Delivery Evt│  │  Updates    │       │
│└──────────────┘     └──────────────┘  └──────────────┘  └─────────────┘       │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Overview

```
USER REQUEST FLOW:
┌─────────┐    ┌─────────────-┐    ┌─────────────┐    ┌─────────────┐
│  User   │───►│   React      │───►│ API Gateway │───►│  Services   │
│Browser  │    │  Frontend    │    │ LoadBalancer│    │(Auth/Cat/   │
│         │    │ LoadBalancer │    │34.136.203.92│    │ Ord/Del)    │
│         │    │34.173.223.100│    │             │    │(ClusterIP)  │
└─────────┘    └────────────-─┘    └─────────────┘    └─────────────┘
                      │                                     │
                      │            ┌─────────────┐          │
                      └───────►───►│ PostgreSQL  │◄─────────┘
                                   │  Database   │
                                   │(ClusterIP)  │
                                   └─────────────┘

EVENT-DRIVEN COMMUNICATION:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Order Service│───►│  RabbitMQ   │───►│Delivery Srv │───►│Notification │
│  (Place)    │    │ Message Bus │    │ (Process)   │    │Service      │
│             │    │(ClusterIP)  │    │             │    │(Notify User)│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Kubernetes Service Configuration

### External Services (LoadBalancer)

```
| Service             | Type         | External IP    | Port | Description        |
| ------------------- | ------------ | -------------- | ---- | ------------------ |
| frontend-external   | LoadBalancer | 34.173.223.100 | 80   | React Application  |
| gateway-external    | LoadBalancer | 34.136.203.92  | 80   | API Gateway        |
```

### Internal Services (ClusterIP)

```
| Service              | Type      | Cluster IP      | Port        | Description         |
| -------------------- | --------- | --------------- | ----------- | ------------------- |
| auth-cluster-ip      | ClusterIP | 34.118.230.221  | 3001        | User Authentication |
| catalog-cluster-ip   | ClusterIP | 34.118.229.98   | 3002        | Medicine Catalog    |
| order-cluster-ip     | ClusterIP | 34.118.236.5    | 3003        | Order Management    |
| delivery-cluster-ip  | ClusterIP | 34.118.239.254  | 3004        | Delivery Tracking   |
| notification-cluster-ip | ClusterIP | 34.118.231.240 | 3005        | Notifications       |
| postgres-cluster-ip  | ClusterIP | 34.118.228.201  | 5432        | Primary Database    |
| redis-cluster-ip     | ClusterIP | 34.118.233.128  | 6379        | Cache Layer         |
| rabbitmq-cluster-ip  | ClusterIP | 34.118.235.246  | 5672,15672  | Message Broker      |
```

### Pod Deployments

```
| Deployment    | Replicas | Image Registry                                    | Status  |
| ------------- | -------- | ------------------------------------------------- | ------- |
| auth          | 1        | us-central1-docker.pkg.dev/.../auth-service      | Running |
| catalog       | 1        | us-central1-docker.pkg.dev/.../catalog-service   | Running |
| order         | 2        | us-central1-docker.pkg.dev/.../order-service     | Running |
| delivery      | 2        | us-central1-docker.pkg.dev/.../delivery-service  | Running |
| notification  | 1        | us-central1-docker.pkg.dev/.../notification-service | Running |
| frontend      | 1        | us-central1-docker.pkg.dev/.../frontend          | Running |
| gateway       | 1        | us-central1-docker.pkg.dev/.../gateway-service   | Running |
| postgres      | 1        | postgres:15                                       | Running |
| redis         | 1        | redis:7-alpine                                    | Running |
| rabbitmq      | 1        | rabbitmq:3-management-alpine                      | Running |
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
# Register new user
curl -X POST http://34.136.203.92/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123", "role": "CUSTOMER"}'

# Login user
curl -X POST http://34.136.203.92/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@meds.com", "password": "Admin@123"}'
```

### Medicine Catalog

```bash
# Get all medicines
curl http://34.136.203.92/catalog/medicines

# Search medicines
curl "http://34.136.203.92/catalog/medicines?search=aspirin"
```

### Order Management

```bash
# Create order (requires auth token)
curl -X POST http://34.136.203.92/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"items": [{"medicine_id": 1, "quantity": 2}], "address": "123 Main St"}'
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
# Check service health
curl http://34.136.203.92/auth/health
curl http://34.136.203.92/catalog/health

# Check pod status
kubectl get pods -n medicine-delivery

# Check service endpoints
kubectl get services -n medicine-delivery

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

# Check gateway service status
kubectl get service gateway-external -n medicine-delivery

# Test API connectivity
curl -I http://34.136.203.92/catalog/medicines
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
3. Test health endpoints: `curl http://34.136.203.92/auth/health`
4. Check service connectivity: `kubectl get services -n medicine-delivery`
5. Verify environment configurations: `kubectl describe deployment/SERVICE_NAME -n medicine-delivery`

---

<div align="center">
Production Ready Google Cloud Deployment

_Access your application at: http://34.173.223.100_

**Clone Repository**:

```bash
git clone https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery
git checkout google-cloud-deployment
```

**For support**: Check pod logs first → `kubectl logs deployment/SERVICE_NAME -n medicine-delivery`

</div>
