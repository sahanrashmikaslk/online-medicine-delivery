#!/bin/bash

# Google Cloud Deployment Script for Medicine Delivery Platform
# Make sure you have gcloud CLI installed and authenticated

set -e

# Configuration
PROJECT_ID="your-gcp-project-id"
CLUSTER_NAME="medicine-delivery-cluster"
REGION="us-central1"
ZONE="us-central1-a"

echo "🚀 Starting Google Cloud deployment..."

# Set project
echo "📝 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable container.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable compute.googleapis.com

# Create GKE cluster if it doesn't exist
if ! gcloud container clusters describe $CLUSTER_NAME --zone=$ZONE &> /dev/null; then
    echo "🔨 Creating GKE cluster..."
    gcloud container clusters create $CLUSTER_NAME \
        --zone=$ZONE \
        --num-nodes=3 \
        --enable-autorepair \
        --enable-autoupgrade \
        --enable-autoscaling \
        --min-nodes=1 \
        --max-nodes=10 \
        --machine-type=e2-medium \
        --disk-size=20GB \
        --enable-ip-alias \
        --enable-network-policy \
        --addons=HorizontalPodAutoscaling,HttpLoadBalancing
else
    echo "✅ GKE cluster already exists"
fi

# Get cluster credentials
echo "🔐 Getting cluster credentials..."
gcloud container clusters get-credentials $CLUSTER_NAME --zone=$ZONE

# Create static IP for ingress
echo "🌐 Creating static IP address..."
if ! gcloud compute addresses describe medicine-delivery-ip --global &> /dev/null; then
    gcloud compute addresses create medicine-delivery-ip --global
fi

# Build and push Docker images
echo "🐳 Building and pushing Docker images..."

# Gateway
echo "Building Gateway service..."
gcloud builds submit gateway/ --tag gcr.io/$PROJECT_ID/gateway:latest

# Auth Service
echo "Building Auth service..."
gcloud builds submit services/auth/ --tag gcr.io/$PROJECT_ID/auth:latest

# Catalog Service
echo "Building Catalog service..."
gcloud builds submit services/catalog/ --tag gcr.io/$PROJECT_ID/catalog:latest

# Order Service
echo "Building Order service..."
gcloud builds submit services/order/ --tag gcr.io/$PROJECT_ID/order:latest

# Delivery Service
echo "Building Delivery service..."
gcloud builds submit services/delivery/ --tag gcr.io/$PROJECT_ID/delivery:latest

# Notification Service
echo "Building Notification service..."
gcloud builds submit services/notification/ --tag gcr.io/$PROJECT_ID/notification:latest

# Frontend
echo "Building Frontend..."
gcloud builds submit web/ --tag gcr.io/$PROJECT_ID/frontend:latest

# Update Kubernetes manifests with project ID
echo "📝 Updating Kubernetes manifests..."
find gcp/ -name "*.yaml" -exec sed -i "s/YOUR_PROJECT_ID/$PROJECT_ID/g" {} \;

# Deploy to Kubernetes
echo "🚀 Deploying to Kubernetes..."

# Apply namespace first
kubectl apply -f gcp/namespace.yaml

# Apply configurations
kubectl apply -f gcp/configmap.yaml

# Deploy infrastructure
kubectl apply -f gcp/postgres.yaml
kubectl apply -f gcp/redis.yaml
kubectl apply -f gcp/rabbitmq.yaml

# Wait for infrastructure to be ready
echo "⏳ Waiting for infrastructure to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/redis -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/rabbitmq -n medicine-delivery

# Deploy microservices
kubectl apply -f gcp/gateway.yaml
kubectl apply -f gcp/microservices.yaml
kubectl apply -f gcp/order-delivery-notification.yaml
kubectl apply -f gcp/frontend.yaml

# Apply autoscaling
kubectl apply -f gcp/hpa.yaml

# Apply ingress
kubectl apply -f gcp/ingress.yaml

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/gateway -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/auth -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/catalog -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/order -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/delivery -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/notification -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n medicine-delivery

# Get external IP
echo "🌐 Getting external IP address..."
EXTERNAL_IP=$(gcloud compute addresses describe medicine-delivery-ip --global --format="value(address)")

echo "✅ Deployment completed successfully!"
echo "📝 Next steps:"
echo "   1. Point your domain to IP: $EXTERNAL_IP"
echo "   2. Update the domain in gcp/ingress.yaml"
echo "   3. Update CORS_ORIGIN in gcp/configmap.yaml"
echo "   4. Reapply ingress and configmap if you make changes"
echo ""
echo "🔍 Useful commands:"
echo "   kubectl get pods -n medicine-delivery"
echo "   kubectl get services -n medicine-delivery"
echo "   kubectl logs -f deployment/gateway -n medicine-delivery"
echo "   kubectl describe ingress medicine-delivery-ingress -n medicine-delivery"
