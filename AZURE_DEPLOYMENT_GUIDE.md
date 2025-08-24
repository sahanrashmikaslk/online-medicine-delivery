# Azure Deployment Commands - Copy and paste these one by one

# Step 1: Connect to Azure VM
ssh -i cloudproject_key.pem azureuser@20.106.187.119

# Step 2: Setup Azure VM (run once)
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker azureuser
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo apt install git -y

# Step 3: Logout and login again
exit
ssh -i cloudproject_key.pem azureuser@20.106.187.119

# Step 4: Clone and deploy
git clone https://github.com/sahanrashmikaslk/online-medicine-delivery.git
cd online-medicine-delivery
chmod +x deploy-azure.sh
./deploy-azure.sh

# Step 5: Open Azure VM ports (run in Azure Portal)
# Go to your VM → Networking → Add inbound port rules:
# Port 3000 (Frontend)
# Port 8080 (API)
# Port 15672 (RabbitMQ Management)

# Your app will be available at:
# Frontend: http://20.106.187.119:3000
# API: http://20.106.187.119:8080
