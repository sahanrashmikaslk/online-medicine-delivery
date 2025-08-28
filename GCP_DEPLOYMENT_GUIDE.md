# Google Cloud Platform Deployment Guide

## Online Medicine Delivery Platform - GCP Edition

This guide provides comprehensive instructions for deploying the Online Medicine Delivery platform on Google Cloud Platform using Google Kubernetes Engine (GKE), Cloud Build, and other GCP services.

## Architecture Overview

```
                                 INTERNET
                                    │
                                    ▼
                        ┌─────────────────────────┐
                        │   Google Cloud Load     │
                        │   Balancer + CDN        │
                        │  (Global HTTP(S) LB)    │
                        └─────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE KUBERNETES ENGINE (GKE)                            │
│                             Namespace: medicine-delivery                         │
│                                                                                 │
│  ┌─────────────────┐                      ┌─────────────────┐                  │
│  │   React Web     │◄──── HTTPS/SSL ─────►│  API Gateway    │                  │
│  │   Frontend      │                      │  (Express.js)   │                  │
│  │   (Nginx)       │                      │   Port: 8080    │                  │
│  │   Port: 3000    │                      │                 │                  │
│  │                 │                      │ • Authentication│                  │
│  │ • Static Files  │                      │ • Route Proxy   │                  │
│  │ • Gzip Enabled  │                      │ • CORS Handling │                  │
│  │ • Auto-scaling  │                      │ • Auto-scaling  │                  │
│  └─────────────────┘                      └─────────┬───────┘                  │
│                                                     │                          │
│                               ┌─────────────────────┼─────────────────────┐    │
│                               │                     │                     │    │
│                               ▼                     ▼                     ▼    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │Auth Service │    │Cat. Service │    │Order Service│    │Delivery Srv │      │
│  │Port: 3001   │    │Port: 3002   │    │Port: 3003   │    │Port: 3004   │      │
│  │             │    │             │    │             │    │             │      │
│  │• JWT Auth   │    │• Medicine   │    │• Order Mgmt │    │• Track Deliv│      │
│  │• User Mgmt  │    │• Inventory  │    │• Cart Logic │    │• Status Upd │      │
│  │• Auto-scale │    │• Redis Cache│    │• Payments   │    │• Auto-scale │      │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘      │
│         │                  │                  │                  │             │
│         │                  │                  │                  │             │
│         ▼                  ▼                  ▼                  ▼             │
│  ┌─────────────────────────┬──────────────────┬──────────────────┐             │
│  │                         │                  │                  │             │
│  ▼                         ▼                  ▼                  ▼             │
│┌──────────────┐     ┌──────────────┐  ┌──────────────┐  ┌─────────────┐       │
││ PostgreSQL   │     │   Redis      │  │  RabbitMQ    │  │Notification │       │
││ Database     │     │   Cache      │  │ Message Que  │  │Service      │       │
││Port: 5432    │     │Port: 6379    │  │Port: 5672    │  │Port: 3005   │       │
││              │     │              │  │              │  │             │       │
││• Persistent  │     │• In-Memory   │  │• Event Bus   │  │• Email/SMS  │       │
││  Storage     │     │• Session Mgmt│  │• Async Comm  │  │• Push Notif │       │
││• Auto Backup │     │• Performance │  │• Persistent  │  │• Real-time  │       │
││• HA Config   │     │• Auto-scale  │  │  Messages    │  │  Updates    │       │
│└──────────────┘     └──────────────┘  └──────────────┘  └─────────────┘       │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

### Required Tools

- Google Cloud SDK (`gcloud`)
- Kubernetes CLI (`kubectl`)
- Docker
- Git

### GCP Account Setup

1. Create a Google Cloud Project
2. Enable billing for your project
3. Install and authenticate gcloud CLI

```bash
# Install gcloud CLI (if not installed)
# Follow: https://cloud.google.com/sdk/docs/install

# Login to your Google account
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

## Quick Start Deployment

### 1. Clone and Setup

```bash
git clone https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery
git checkout google-cloud-deployment
```

### 2. Configure Project Settings

Update the following files with your project details:

**deploy-gcp.sh**

```bash
PROJECT_ID="your-gcp-project-id"        # Change this
CLUSTER_NAME="medicine-delivery-cluster"
REGION="us-central1"
ZONE="us-central1-a"
```

**gcp/configmap.yaml**

```yaml
CORS_ORIGIN: "https://your-domain.com" # Change this
```

**gcp/ingress.yaml**

```yaml
- host: your-domain.com # Change this
```

### 3. Deploy to Google Cloud

```bash
# Make deploy script executable
chmod +x deploy-gcp.sh

# Run deployment
./deploy-gcp.sh
```

### 4. Configure Domain

After deployment, you'll get a static IP address. Configure your domain DNS:

```bash
# Get the external IP
gcloud compute addresses describe medicine-delivery-ip --global

# Point your domain A record to this IP
```

## Detailed Configuration

### Environment Variables

All environment variables are managed through Kubernetes ConfigMaps and Secrets:

**ConfigMap (gcp/configmap.yaml):**

- `NODE_ENV`: production
- `CORS_ORIGIN`: Your domain URL
- `DATABASE_HOST`: postgres-cluster-ip
- `REDIS_HOST`: redis-cluster-ip
- `RABBITMQ_HOST`: rabbitmq-cluster-ip

**Secrets (gcp/configmap.yaml):**

- `jwt-secret`: JWT signing key (base64 encoded)
- `database-password`: PostgreSQL password (base64 encoded)
- `redis-password`: Redis password (base64 encoded)
- `rabbitmq-password`: RabbitMQ password (base64 encoded)

### Service Scaling

The platform includes Horizontal Pod Autoscaling (HPA) for automatic scaling:

| Service  | Min Replicas | Max Replicas | CPU Threshold | Memory Threshold |
| -------- | ------------ | ------------ | ------------- | ---------------- |
| Gateway  | 2            | 10           | 70%           | 80%              |
| Auth     | 2            | 8            | 70%           | -                |
| Catalog  | 2            | 8            | 70%           | -                |
| Order    | 2            | 8            | 70%           | -                |
| Delivery | 2            | 6            | 70%           | -                |
| Frontend | 2            | 6            | 70%           | -                |

### Storage Configuration

**Persistent Volumes:**

- PostgreSQL: 10Gi (standard-rwo)
- Redis: 5Gi (standard-rwo)
- RabbitMQ: 5Gi (standard-rwo)

### Security Features

1. **Network Policies**: Kubernetes network policies for micro-segmentation
2. **RBAC**: Role-based access control for services
3. **Secrets Management**: Kubernetes secrets for sensitive data
4. **SSL/TLS**: Managed certificates through Google Cloud Load Balancer
5. **Container Security**: Non-root containers, security contexts

## CI/CD Pipeline

### Cloud Build Setup

The project includes automated CI/CD using Google Cloud Build:

```bash
# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Create build trigger
gcloud builds triggers create github \
    --repo-name=online-medicine-delivery \
    --repo-owner=sahanrashmikaslk \
    --branch-pattern="google-cloud-deployment" \
    --build-config=cloudbuild.yaml
```

### Manual Build

```bash
# Build all services manually
gcloud builds submit . --config=cloudbuild.yaml
```

## Monitoring and Logging

### Google Cloud Monitoring

```bash
# Enable monitoring API
gcloud services enable monitoring.googleapis.com

# View cluster monitoring
gcloud container clusters describe medicine-delivery-cluster --zone=us-central1-a
```

### Useful Commands

```bash
# View pods
kubectl get pods -n medicine-delivery

# View services
kubectl get services -n medicine-delivery

# View ingress
kubectl get ingress -n medicine-delivery

# Check pod logs
kubectl logs -f deployment/gateway -n medicine-delivery

# Scale deployment manually
kubectl scale deployment gateway --replicas=5 -n medicine-delivery

# View HPA status
kubectl get hpa -n medicine-delivery

# Port forward for local access
kubectl port-forward svc/gateway-cluster-ip 8080:8080 -n medicine-delivery
```

## Cost Optimization

### Free Tier Benefits

- GKE Autopilot cluster management: Free
- Google Cloud Load Balancer: $18/month
- Persistent Disk: $0.04/GB/month
- Container Registry: 0.5GB free storage

### Estimated Monthly Costs

- **Development**: $50-100/month
- **Production**: $200-500/month (depends on traffic)

### Cost Optimization Tips

1. Use preemptible instances for non-critical workloads
2. Enable cluster autoscaling
3. Use appropriate machine types (e2-medium for development)
4. Monitor resource usage with Google Cloud Monitoring

## Troubleshooting

### Common Issues

**1. Pod CrashLoopBackOff**

```bash
kubectl describe pod POD_NAME -n medicine-delivery
kubectl logs POD_NAME -n medicine-delivery
```

**2. Service Unavailable**

```bash
kubectl get endpoints -n medicine-delivery
kubectl describe service SERVICE_NAME -n medicine-delivery
```

**3. Database Connection Issues**

```bash
kubectl exec -it deployment/postgres -n medicine-delivery -- psql -U postgres -d medicine_delivery
```

**4. SSL Certificate Issues**

```bash
kubectl describe managedcertificate medicine-delivery-ssl -n medicine-delivery
```

### Health Checks

All services include health check endpoints:

- Gateway: `GET /health`
- Auth: `GET /health`
- Catalog: `GET /health`
- Order: `GET /health`
- Delivery: `GET /health`
- Notification: `GET /health`
- Frontend: `GET /health`

## Security Best Practices

1. **Regular Updates**: Keep base images updated
2. **Secrets Rotation**: Rotate secrets regularly
3. **Network Policies**: Implement strict network policies
4. **Resource Limits**: Set appropriate resource limits
5. **Monitoring**: Enable comprehensive monitoring and alerting

## Backup and Recovery

### Database Backup

```bash
# Create backup job
kubectl create job postgres-backup --from=cronjob/postgres-backup -n medicine-delivery

# Manual backup
kubectl exec -it deployment/postgres -n medicine-delivery -- pg_dump -U postgres medicine_delivery > backup.sql
```

### Disaster Recovery

- Use Google Cloud SQL for managed PostgreSQL with automatic backups
- Implement cross-region replication for critical data
- Regular backup testing and recovery procedures

## Support and Maintenance

### Monitoring Alerts

Set up alerts for:

- Pod restart rates
- CPU/Memory usage thresholds
- Database connection issues
- SSL certificate expiration

### Regular Maintenance

- Update Docker images monthly
- Review and update resource limits
- Monitor costs and optimize resources
- Security patches and updates

---

## Additional Resources

- [Google Kubernetes Engine Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [Google Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/overview/best-practices/)
- [Google Cloud Free Tier](https://cloud.google.com/free)

For issues and support, please create an issue in the GitHub repository.
