# Google Cloud Deployment Script for Medicine Delivery Platform (PowerShell)
# Make sure you have gcloud CLI installed and authenticated

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [string]$ClusterName = "medicine-delivery-cluster",
    [string]$Region = "us-central1", 
    [string]$Zone = "us-central1-a"
)

Write-Host "🚀 Starting Google Cloud deployment..." -ForegroundColor Green

# Set project
Write-Host "📝 Setting project to $ProjectId..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "🔧 Enabling required Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable container.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable compute.googleapis.com

# Create GKE cluster if it doesn't exist
Write-Host "🔨 Checking if GKE cluster exists..." -ForegroundColor Yellow
$clusterExists = gcloud container clusters describe $ClusterName --zone=$Zone 2>$null
if (-not $clusterExists) {
    Write-Host "Creating GKE cluster..." -ForegroundColor Green
    gcloud container clusters create $ClusterName `
        --zone=$Zone `
        --num-nodes=3 `
        --enable-autorepair `
        --enable-autoupgrade `
        --enable-autoscaling `
        --min-nodes=1 `
        --max-nodes=10 `
        --machine-type=e2-medium `
        --disk-size=20GB `
        --enable-ip-alias `
        --enable-network-policy `
        --addons=HorizontalPodAutoscaling,HttpLoadBalancing
} else {
    Write-Host "✅ GKE cluster already exists" -ForegroundColor Green
}

# Get cluster credentials
Write-Host "🔐 Getting cluster credentials..." -ForegroundColor Yellow
gcloud container clusters get-credentials $ClusterName --zone=$Zone

# Create static IP for ingress
Write-Host "🌐 Creating static IP address..." -ForegroundColor Yellow
$ipExists = gcloud compute addresses describe medicine-delivery-ip --global 2>$null
if (-not $ipExists) {
    gcloud compute addresses create medicine-delivery-ip --global
}

# Build and push Docker images
Write-Host "🐳 Building and pushing Docker images..." -ForegroundColor Green

Write-Host "Building Gateway service..." -ForegroundColor Cyan
gcloud builds submit gateway/ --tag "gcr.io/$ProjectId/gateway:latest"

Write-Host "Building Auth service..." -ForegroundColor Cyan
gcloud builds submit services/auth/ --tag "gcr.io/$ProjectId/auth:latest"

Write-Host "Building Catalog service..." -ForegroundColor Cyan
gcloud builds submit services/catalog/ --tag "gcr.io/$ProjectId/catalog:latest"

Write-Host "Building Order service..." -ForegroundColor Cyan
gcloud builds submit services/order/ --tag "gcr.io/$ProjectId/order:latest"

Write-Host "Building Delivery service..." -ForegroundColor Cyan
gcloud builds submit services/delivery/ --tag "gcr.io/$ProjectId/delivery:latest"

Write-Host "Building Notification service..." -ForegroundColor Cyan
gcloud builds submit services/notification/ --tag "gcr.io/$ProjectId/notification:latest"

Write-Host "Building Frontend..." -ForegroundColor Cyan
gcloud builds submit web/ --tag "gcr.io/$ProjectId/frontend:latest"

# Update Kubernetes manifests with project ID
Write-Host "📝 Updating Kubernetes manifests..." -ForegroundColor Yellow
Get-ChildItem -Path "gcp/*.yaml" | ForEach-Object {
    (Get-Content $_.FullName) -replace "YOUR_PROJECT_ID", $ProjectId | Set-Content $_.FullName
}

# Deploy to Kubernetes
Write-Host "🚀 Deploying to Kubernetes..." -ForegroundColor Green

# Apply namespace first
kubectl apply -f gcp/namespace.yaml

# Apply configurations
kubectl apply -f gcp/configmap.yaml

# Deploy infrastructure
kubectl apply -f gcp/postgres.yaml
kubectl apply -f gcp/redis.yaml
kubectl apply -f gcp/rabbitmq.yaml

# Wait for infrastructure to be ready
Write-Host "⏳ Waiting for infrastructure to be ready..." -ForegroundColor Yellow
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
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/gateway -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/auth -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/catalog -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/order -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/delivery -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/notification -n medicine-delivery
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n medicine-delivery

# Get external IP
Write-Host "🌐 Getting external IP address..." -ForegroundColor Yellow
$externalIp = gcloud compute addresses describe medicine-delivery-ip --global --format="value(address)"

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Point your domain to IP: $externalIp" -ForegroundColor White
Write-Host "   2. Update the domain in gcp/ingress.yaml" -ForegroundColor White
Write-Host "   3. Update CORS_ORIGIN in gcp/configmap.yaml" -ForegroundColor White
Write-Host "   4. Reapply ingress and configmap if you make changes" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Useful commands:" -ForegroundColor Yellow
Write-Host "   kubectl get pods -n medicine-delivery" -ForegroundColor White
Write-Host "   kubectl get services -n medicine-delivery" -ForegroundColor White
Write-Host "   kubectl logs -f deployment/gateway -n medicine-delivery" -ForegroundColor White
Write-Host "   kubectl describe ingress medicine-delivery-ingress -n medicine-delivery" -ForegroundColor White
