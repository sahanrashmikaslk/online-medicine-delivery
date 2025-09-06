# Online Medicine Delivery - Group 14

## Technology Stack

### Frontend

- **React 18** with Vite build system
- **Tailwind CSS** for responsive styling
- **JavaScript ES6+** with modern React hooks
- **Google OAuth 2.0** integration for authentication
- **Axios/Fetch API** for HTTP requests
- **React Router** for client-side routing

### Backend Services

- **Node.js** with Express.js framework
- **PostgreSQL 15** as primary database
- **Redis 7** for caching and session management
- **RabbitMQ 3** for message queuing and event-driven communication
- **JSON Web Tokens (JWT)** for authentication
- **bcrypt** for password hashing
- **Nodemailer** for email notifications
- **Helmet** for security headers
- **CORS** for cross-origin resource sharing

### DevOps & Infrastructure

- **Docker** for containerization
- **Docker Compose** for local development
- **Kubernetes (GKE)** for production orchestration
- **Google Cloud Platform** for cloud hosting
- **GitHub Actions** for CI/CD pipelines
- **Google Container Registry** for image storage
- **Nginx** for reverse proxy and static file serving

## Microservices Architecture

### Core Services

- **Auth Service** (Port 3001): User authentication, JWT management, Google OAuth, email services
- **Catalog Service** (Port 3002): Medicine inventory, search functionality, Redis caching
- **Order Service** (Port 3003): Shopping cart, order processing, payment handling, RabbitMQ events
- **Delivery Service** (Port 3004): Delivery tracking, status updates, logistics management
- **Notification Service** (Port 3005): Email notifications, event-driven messaging

### Supporting Components

- **API Gateway** (Port 8080): Request routing, CORS handling, authentication proxy
- **Frontend** (Port 5173): React application with user interface
- **PostgreSQL** (Port 5432): Primary database for all services
- **Redis** (Port 6379): Caching layer and session storage
- **RabbitMQ** (Port 5672/15672): Message broker for async communication

### Service Communication Flow

```
Frontend → API Gateway → [Auth|Catalog|Order|Delivery|Notification]
                              ↓
                    [PostgreSQL|Redis|RabbitMQ]
```

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Docker Desktop
- Git

### 1. Clone and Setup

```bash
git clone https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/medsdb
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

### 3. Start Application

```bash
# Start everything with Docker Compose
docker-compose up -d

# Wait 2-3 minutes for services to initialize
```

### 4. Access Application

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **Admin Login**: admin@meds.com / Admin@123

## Project Structure

```
online-medicine-delivery/
├── services/
│   ├── auth/          # Authentication service (port 3001)
│   ├── catalog/       # Medicine catalog service (port 3002)
│   ├── order/         # Order management service (port 3003)
│   ├── delivery/      # Delivery tracking service (port 3004)
│   └── notification/  # Email notification service (port 3005)
├── gateway/           # API Gateway (port 8080)
├── web/              # React frontend (port 5173)
├── scripts/db/       # Database initialization
├── gcp/              # Kubernetes deployment files
└── docker-compose.yml
```

### Service URLs

| Service       | URL                   | Purpose             |
| ------------- | --------------------- | ------------------- |
| Frontend      | http://localhost:5173 | User interface      |
| Gateway       | http://localhost:8080 | API routing         |
| Auth          | http://localhost:3001 | User authentication |
| Catalog       | http://localhost:3002 | Medicine inventory  |
| Orders        | http://localhost:3003 | Order processing    |
| Delivery      | http://localhost:3004 | Delivery tracking   |
| Notifications | http://localhost:3005 | Email service       |

## Google Cloud Platform Setup

### Cloud Architecture

The production system runs on Google Kubernetes Engine (GKE) with the following setup:

### Infrastructure Components

- **GKE Cluster**: Managed Kubernetes cluster with auto-scaling
- **Cloud Load Balancer**: External load balancer with SSL termination
- **Container Registry**: Docker image storage and management
- **Cloud SQL**: Managed PostgreSQL database (optional)
- **Cloud Memorystore**: Managed Redis cache (optional)
- **Cloud Pub/Sub**: Message queuing service (alternative to RabbitMQ)

### Kubernetes Setup

#### Prerequisites

- Google Cloud SDK installed and configured
- kubectl configured for GKE cluster
- Docker installed for building images

#### 1. Create GKE Cluster

```bash
# Set project and zone
export PROJECT_ID=your-project-id
export CLUSTER_NAME=medicine-delivery-cluster
export ZONE=us-central1-a

# Create cluster
gcloud container clusters create $CLUSTER_NAME \
  --zone=$ZONE \
  --num-nodes=3 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=5 \
  --machine-type=e2-standard-2
```

#### 2. Build and Push Images

```bash
# Configure Docker authentication
gcloud auth configure-docker

# Build and push all service images
docker build -t gcr.io/$PROJECT_ID/auth-service services/auth/
docker push gcr.io/$PROJECT_ID/auth-service

docker build -t gcr.io/$PROJECT_ID/catalog-service services/catalog/
docker push gcr.io/$PROJECT_ID/catalog-service

# Repeat for all services...
```

#### 3. Deploy to Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f gcp/namespace.yaml
kubectl apply -f gcp/postgres.yaml
kubectl apply -f gcp/redis.yaml
kubectl apply -f gcp/rabbitmq.yaml
kubectl apply -f gcp/microservices.yaml
kubectl apply -f gcp/gateway.yaml
kubectl apply -f gcp/frontend.yaml
kubectl apply -f gcp/ingress.yaml
```

#### 4. Production URLs

- **Application**: https://your-domain.com
- **API**: https://your-domain.com/api
- **Admin Panel**: https://your-domain.com/admin

### Kubernetes Services Configuration

| Component            | Type        | Replicas | Resources           |
| -------------------- | ----------- | -------- | ------------------- |
| Frontend             | Deployment  | 2        | 256Mi RAM, 100m CPU |
| Gateway              | Deployment  | 1        | 256Mi RAM, 100m CPU |
| Auth Service         | Deployment  | 2        | 256Mi RAM, 100m CPU |
| Catalog Service      | Deployment  | 2        | 256Mi RAM, 100m CPU |
| Order Service        | Deployment  | 2        | 256Mi RAM, 100m CPU |
| Delivery Service     | Deployment  | 2        | 256Mi RAM, 100m CPU |
| Notification Service | Deployment  | 1        | 256Mi RAM, 100m CPU |
| PostgreSQL           | StatefulSet | 1        | 1Gi RAM, 500m CPU   |
| Redis                | Deployment  | 1        | 256Mi RAM, 100m CPU |
| RabbitMQ             | Deployment  | 1        | 512Mi RAM, 200m CPU |

## CI/CD Pipeline

### GitHub Actions Workflow

The project uses GitHub Actions for automated deployment:

#### Pipeline Stages

1. **Code Quality**: Linting, testing, security scans
2. **Build**: Docker image creation for all services
3. **Push**: Images pushed to Google Container Registry
4. **Deploy**: Automatic deployment to GKE cluster
5. **Verify**: Health checks and smoke tests

#### Deployment Strategies

- **Rolling Updates**: Zero-downtime deployments
- **Blue-Green**: Full environment switches for major releases
- **Canary**: Gradual traffic shifting for new features

#### Environment Management

- **Development**: Automatic deployment on feature branches
- **Staging**: Manual approval for release candidates
- **Production**: Automated deployment with monitoring

### Monitoring and Observability

- **Prometheus**: Metrics collection and alerting
- **Grafana**: Dashboard and visualization
- **Fluentd**: Log aggregation and forwarding
- **Jaeger**: Distributed tracing for microservices

## Features

### Customer Features

- User registration and authentication
- Google OAuth integration
- Medicine browsing and search
- Shopping cart management
- Order placement and tracking
- Email notifications

### Admin Features

- User management and analytics
- Medicine inventory management
- Order tracking and updates
- Delivery status management
- System monitoring dashboard

### System Features

- Microservices architecture
- Event-driven communication
- Horizontal auto-scaling
- High availability deployment
- Security hardening
- Performance optimization

## Default Accounts

```bash
# Admin Account
Email: admin@meds.com
Password: Admin@123

# Create customer accounts via registration
```
