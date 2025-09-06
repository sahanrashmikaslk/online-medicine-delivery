# Online Medicine Delivery - System Architecture

## Architecture Overview

This document describes the architecture of the Online Medicine Delivery platform deployed on Google Cloud Platform using Kubernetes, featuring Google OAuth integration, email notifications, and unified domain access through ingress controller.

## Current Production Configuration

**Production URL**: `http://34.128.184.43.nip.io`  
**API Base**: `http://34.128.184.43.nip.io/api`  
**Authentication**: Local and Google OAuth 2.0  
**Notifications**: Email via Gmail SMTP

## Architecture Diagram

```mermaid
graph TB
    %% External Users and Services
    User[User Browser]
    Admin[Admin User]
    Google[Google OAuth 2.0]
    Gmail[Gmail SMTP]

    %% Ingress Controller
    Ingress[Ingress Controller<br/>34.128.184.43<br/>nip.io domain]

    %% Frontend
    Frontend[React Frontend<br/>Google Sign-In SDK<br/>Nginx Server<br/>Port: 3000]

    %% API Gateway
    Gateway[API Gateway<br/>Express.js Router<br/>CORS & Auth Proxy<br/>Port: 8080]

    %% Microservices with Enhanced Features
    subgraph "Microservices Layer"
        Auth[Auth Service<br/>JWT + Google OAuth<br/>Email Service<br/>User Management<br/>Port: 3001]
        Catalog[Catalog Service<br/>Medicine Management<br/>Redis Caching<br/>Search API<br/>Port: 3002]
        Order[Order Service<br/>Order Processing<br/>RabbitMQ Events<br/>Payment Logic<br/>Port: 3003]
        Delivery[Delivery Service<br/>Tracking System<br/>Status Updates<br/>RabbitMQ Consumer<br/>Port: 3004]
        Notification[Notification Service<br/>Event-Driven Emails<br/>RabbitMQ Consumer<br/>Real-time Updates<br/>Port: 3005]
    end

    %% Enhanced Infrastructure
    subgraph "Infrastructure Layer"
        PostgreSQL[(PostgreSQL 15<br/>User Data & OAuth Info<br/>Medicine Catalog<br/>Orders & Delivery<br/>Port: 5432)]
        Redis[(Redis 7<br/>Session Management<br/>API Response Cache<br/>Performance Layer<br/>Port: 6379)]
        RabbitMQ[(RabbitMQ 3<br/>Event Bus<br/>Order → Delivery → Notification<br/>Async Communication<br/>Port: 5672)]
    end

    %% Google Cloud Platform
    subgraph "Google Kubernetes Engine"
        GKE[3-Node Cluster<br/>us-central1-a<br/>Auto-scaling Enabled]
        Secrets[Kubernetes Secrets<br/>Google Client ID<br/>Email Credentials<br/>JWT Secrets<br/>Database Passwords]
    end

    %% User Interaction Flows
    User --> Ingress
    Admin --> Ingress

    %% Ingress Routing
    Ingress -->|"/* (Frontend)"| Frontend
    Ingress -->|"/api/* (Backend)"| Gateway

    %% Frontend to Backend
    Frontend -->|"API Calls via Ingress"| Ingress
    Frontend -->|"Google OAuth Flow"| Google

    %% Gateway Routing
    Gateway --> Auth
    Gateway --> Catalog
    Gateway --> Order
    Gateway --> Delivery
    Gateway --> Notification

    %% Authentication Flows
    Google -->|"OAuth Token Verification"| Auth
    Auth -->|"Email Notifications"| Gmail

    %% Service Dependencies
    Auth --> PostgreSQL
    Auth --> Secrets
    Catalog --> PostgreSQL
    Catalog --> Redis
    Order --> PostgreSQL
    Order --> RabbitMQ
    Delivery --> PostgreSQL
    Delivery --> RabbitMQ
    Notification --> RabbitMQ
    Notification --> Gmail

    %% Event-Driven Communication
    Order -.->|"order.created"| RabbitMQ
    RabbitMQ -.->|"delivery.assigned"| Delivery
    RabbitMQ -.->|"notification.send"| Notification
    Notification -.->|"Email Sent"| Gmail

    %% Infrastructure Management
    GKE --> Frontend
    GKE --> Gateway
    GKE --> Auth
    GKE --> Catalog
    GKE --> Order
    GKE --> Delivery
    GKE --> Notification
    GKE --> PostgreSQL
    GKE --> Redis
    GKE --> RabbitMQ
    GKE --> Secrets

    %% Styling
    classDef userClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef frontendClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef serviceClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef dbClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef cloudClass fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    classDef authClass fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef eventClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class User,Admin userClass
    class Frontend,Ingress frontendClass
    class Gateway,Catalog,Order,Delivery,Notification serviceClass
    class PostgreSQL,Redis,RabbitMQ dbClass
    class GKE,Secrets cloudClass
    class Auth,Google,Gmail authClass
```

## Component Details

### Ingress Layer

- **Single Domain Access**: `34.128.184.43.nip.io` for both frontend and API
- **Google Cloud Load Balancer**: Automatic SSL termination and global distribution
- **Path-based Routing**:
  - `/*` routes to React frontend
  - `/api/*` routes to API Gateway
- **nip.io DNS**: Wildcard DNS service for domain-based OAuth compliance

### Frontend Layer

- **React Application**: Modern SPA with Vite build system and Google Sign-In integration
- **Google OAuth SDK**: Client-side authentication with Google Identity Services
- **Dynamic API Detection**: Automatically routes API calls through ingress
- **Nginx Server**: Serves static files with optimized caching
- **Environment Configuration**:
  - `VITE_API_URL=http://34.128.184.43.nip.io/api`
  - `VITE_GOOGLE_CLIENT_ID=1050334836326-2jg080g9dm516nqpql4vh8niocg17itv`

### API Gateway Enhanced

- **Express.js Router**: Enhanced with dual routing for `/api` prefix support
- **Authentication Proxy**: Handles both JWT and Google OAuth verification
- **CORS Configuration**: Configured for nip.io domain access
- **Route Duplication**: Supports both direct and ingress-based API calls
- **Health Monitoring**: Comprehensive health checks for all services

### Enhanced Microservices

#### Auth Service (Enhanced)

- **Dual Authentication**: Local email/password and Google OAuth 2.0
- **Google Token Verification**: Server-side validation of Google ID tokens
- **Email Services**: Welcome emails, order confirmations, custom notifications
- **User Profile Management**: Stores Google profile data (name, picture)
- **JWT Generation**: Consistent token format for both auth methods
- **Database Schema**: Extended with Google OAuth fields

#### Catalog Service

- **Medicine Management**: Full CRUD with admin capabilities
- **Redis Caching**: High-performance medicine lookups
- **Search API**: Advanced filtering and search capabilities
- **Stock Management**: Real-time inventory tracking

#### Order Service

- **Order Processing**: Complete order lifecycle management
- **RabbitMQ Integration**: Publishes order events for downstream processing
- **Payment Processing**: Integrated payment logic
- **Order History**: Complete audit trail

#### Delivery Service

- **Tracking System**: Real-time delivery status updates
- **Event-Driven**: Consumes order events from RabbitMQ
- **Status Management**: Complete delivery lifecycle
- **Geographic Tracking**: Location-based delivery optimization

#### Notification Service (New)

- **Event-Driven Architecture**: Consumes events from RabbitMQ
- **Email Templates**: HTML email templates with branding
- **Multiple Triggers**: Welcome, order confirmation, delivery updates
- **Gmail Integration**: SMTP-based email delivery

### Enhanced Data Layer

#### PostgreSQL (Extended Schema)

- **User Management**: Extended with OAuth fields (google_id, auth_provider, profile_picture)
- **Medicine Catalog**: Complete inventory with categories and pricing
- **Order Management**: Full order lifecycle with items and payments
- **Delivery Tracking**: Status updates and geographic data
- **Audit Logging**: Complete system audit trail

#### Redis (Optimized)

- **API Response Caching**: Improves medicine catalog performance
- **Session Management**: User session persistence
- **Search Result Caching**: Optimized search performance
- **Rate Limiting**: API rate limiting implementation

#### RabbitMQ (Event-Driven)

- **Exchange Configuration**: Topic-based event routing
- **Event Types**: order.created, delivery.updated, notification.send
- **Queue Bindings**: Service-specific queue consumption
- **Dead Letter Queues**: Error handling and retry logic

### Infrastructure (Production-Ready)

#### Google Kubernetes Engine

- **3-Node Cluster**: Auto-scaling with resource optimization
- **Namespace Isolation**: medicine-delivery namespace
- **Resource Management**: CPU and memory limits for all pods
- **Health Checks**: Liveness and readiness probes
- **Horizontal Pod Autoscaling**: Automatic scaling based on metrics

#### Security Configuration

- **Kubernetes Secrets**: Secure storage of sensitive data
  - Google OAuth client ID and secret
  - Gmail SMTP credentials
  - JWT signing secrets
  - Database passwords
- **RBAC**: Role-based access control
- **Network Policies**: Pod-to-pod communication security
- **Container Security**: Non-root containers with security contexts

## Authentication Architecture

### Google OAuth 2.0 Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Google
    participant AuthService
    participant Database

    User->>Frontend: Click "Sign in with Google"
    Frontend->>Google: Initiate OAuth flow
    Google->>User: Present consent screen
    User->>Google: Grant permissions
    Google->>Frontend: Return ID token
    Frontend->>AuthService: POST /api/auth/google with token
    AuthService->>Google: Verify token
    Google->>AuthService: Token validation response
    AuthService->>Database: Create or update user
    Database->>AuthService: User data
    AuthService->>Frontend: JWT token + user profile
    Frontend->>User: Authenticated session
```

### Local Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthService
    participant Database

    User->>Frontend: Email/Password login
    Frontend->>AuthService: POST /api/auth/login
    AuthService->>Database: Verify credentials
    Database->>AuthService: User data
    AuthService->>Frontend: JWT token + user profile
    Frontend->>User: Authenticated session
```

## Email Notification Architecture

### Event-Driven Email Flow

```mermaid
sequenceDiagram
    participant OrderService
    participant RabbitMQ
    participant AuthService
    participant Gmail
    participant User

    OrderService->>RabbitMQ: Publish order.created event
    RabbitMQ->>AuthService: Consume order event
    AuthService->>Gmail: Send order confirmation email
    Gmail->>User: Email delivered

    Note over AuthService: Welcome emails sent<br/>immediately on registration
```

## Deployment Architecture

### Current Kubernetes Configuration

```yaml
# Namespace: medicine-delivery
# Services: ClusterIP for internal, Ingress for external
# Resources: Optimized for production workload
# Scaling: HPA enabled for critical services
```

### Service Mesh

```
Ingress (34.128.184.43.nip.io)
├── Frontend (React + Google OAuth)
└── Gateway (/api/*)
    ├── Auth Service (JWT + Google OAuth + Email)
    ├── Catalog Service (Redis cached)
    ├── Order Service (RabbitMQ events)
    ├── Delivery Service (RabbitMQ consumer)
    └── Notification Service (Email sender)
```

## Technology Stack (Updated)

### Frontend Technologies

- React 18 with Hooks and Context API
- Google Identity Services SDK
- Vite for optimized build and hot reloading
- Tailwind CSS for responsive design
- Nginx for production serving

### Backend Technologies

- Node.js 20 with Express.js framework
- Google Auth Library for OAuth verification
- Nodemailer for email services
- bcrypt for password security
- JSON Web Tokens for session management
- Helmet for security headers
- CORS for cross-origin support

### Infrastructure Technologies

- Google Kubernetes Engine (GKE) for orchestration
- Google Container Registry for image storage
- Google Cloud Load Balancer for ingress
- PostgreSQL 15 for primary database
- Redis 7 for caching and sessions
- RabbitMQ 3 for event-driven messaging
- Docker for containerization

## Security Features (Enhanced)

### Authentication Security

- Google OAuth 2.0 with server-side token verification
- JWT tokens with secure signing and expiration
- bcrypt password hashing for local accounts
- Role-based access control (ADMIN/CUSTOMER)

### Infrastructure Security

- Kubernetes RBAC for cluster access control
- Secrets management for sensitive data
- Network policies for pod communication
- Container security contexts (non-root)
- Resource quotas and limits

### Application Security

- Helmet.js for security headers
- CORS configuration for domain restrictions
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries
- Rate limiting and request size limits

## Monitoring and Observability

### Health Monitoring

- Health check endpoints for all services
- Kubernetes liveness and readiness probes
- Service dependency health verification
- Database connection monitoring

### Logging Strategy

- Centralized logging through Kubernetes
- Service-specific log levels
- Error tracking and alerting
- Audit logging for sensitive operations

### Performance Monitoring

- Redis performance metrics
- Database query optimization
- API response time tracking
- Resource utilization monitoring
