# Google Cloud VM Deployment (Azure-style)

## Step 1: Create VM Instance

```bash
# Create a VM similar to Azure setup
gcloud compute instances create medicine-delivery-vm \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=e2-standard-2 \
    --boot-disk-size=20GB \
    --zone=us-central1-a \
    --tags=medicine-delivery,http-server,https-server

# Create firewall rules
gcloud compute firewall-rules create allow-medicine-delivery \
    --allow tcp:3000,tcp:8080,tcp:5432,tcp:6379,tcp:5672,tcp:15672 \
    --source-ranges 0.0.0.0/0 \
    --target-tags medicine-delivery
```

## Step 2: SSH into VM

```bash
# SSH via gcloud (easiest)
gcloud compute ssh medicine-delivery-vm --zone=us-central1-a

# Or via browser SSH:
# Go to https://console.cloud.google.com/compute/instances
# Click "SSH" button
```

## Step 3: Setup VM (Run inside SSH session)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Logout and login again to apply docker group
exit
```

## Step 4: Deploy Application

```bash
# SSH back in
gcloud compute ssh medicine-delivery-vm --zone=us-central1-a

# Clone your repository
git clone https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery

# Checkout production branch
git checkout azure-deployment  # Use existing production config

# Get VM external IP
EXTERNAL_IP=$(curl -s ifconfig.me)
echo "Your VM IP: $EXTERNAL_IP"

# Update environment files with your VM IP
# Edit web/.env and gateway .env files

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Step 5: Access Application

```bash
# Get external IP
gcloud compute instances describe medicine-delivery-vm --zone=us-central1-a --format="value(networkInterfaces[0].accessConfigs[0].natIP)"

# Your app will be available at:
# http://EXTERNAL_IP:3000
```

## VM Management Commands

```bash
# Start VM
gcloud compute instances start medicine-delivery-vm --zone=us-central1-a

# Stop VM
gcloud compute instances stop medicine-delivery-vm --zone=us-central1-a

# SSH into VM
gcloud compute ssh medicine-delivery-vm --zone=us-central1-a

# Copy files to VM
gcloud compute scp LOCAL_FILE medicine-delivery-vm:~/REMOTE_PATH --zone=us-central1-a

# Copy files from VM
gcloud compute scp medicine-delivery-vm:~/REMOTE_FILE LOCAL_PATH --zone=us-central1-a
```

## Cost Comparison

### VM Approach

- **e2-standard-2**: ~$49/month (always running)
- **Storage**: ~$2/month (20GB)
- **Network**: ~$1-5/month
- **Total**: ~$52-56/month

### GKE Approach

- **GKE Management**: Free
- **Nodes**: ~$30-100/month (auto-scaling)
- **Load Balancer**: ~$18/month
- **Storage**: ~$2/month
- **Total**: ~$50-120/month (depends on traffic)

## When to Choose VM

Choose VM if:

- ✅ You want simple, familiar deployment
- ✅ You need direct SSH access
- ✅ You have predictable traffic
- ✅ You want full control over the environment
- ✅ You prefer Docker Compose over Kubernetes

Choose GKE if:

- ✅ You want professional, scalable deployment
- ✅ You expect variable traffic
- ✅ You want managed infrastructure
- ✅ You want high availability
- ✅ You want to learn modern DevOps practices
