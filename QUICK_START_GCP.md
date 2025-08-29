# Quick Start Guide for Google Cloud Deployment

## Prerequisites Checklist

### ✅ Step 1: Install Google Cloud SDK

**Download and Install:**

1. Go to: https://cloud.google.com/sdk/docs/install-sdk#windows
2. Download `GoogleCloudSDKInstaller.exe`
3. Run the installer as Administrator
4. Follow the installation wizard
5. When prompted, check both:
   - ✅ "Start Cloud SDK Shell"
   - ✅ "Run gcloud init"

**Verify Installation:**

```powershell
# Open a new PowerShell window and run:
gcloud --version
kubectl version --client
```

### ✅ Step 2: Authenticate with Google Cloud

```powershell
# Login to your Google account
gcloud auth login

# This will open a browser window for authentication
# Follow the prompts to sign in
```

### ✅ Step 3: Create Google Cloud Project

**Option A: Via Web Console (Recommended)**

1. Go to: https://console.cloud.google.com/
2. Click "New Project"
3. Project Name: `Medicine Delivery Platform`
4. Note your Project ID (auto-generated, e.g., `medicine-delivery-platform-12345`)

**Option B: Via Command Line**

```powershell
# Create project (replace with your preferred project ID)
gcloud projects create medicine-delivery-platform-12345 --name="Medicine Delivery Platform"

# Set as default project
gcloud config set project medicine-delivery-platform-12345
```

### ✅ Step 4: Enable Billing

1. Go to: https://console.cloud.google.com/billing
2. Link a billing account to your project
3. New accounts get $300 in free credits!

### ✅ Step 5: Install kubectl (if not included with gcloud)

```powershell
# Install kubectl component
gcloud components install kubectl

# Verify installation
kubectl version --client
```

## 🚀 Deployment Steps

### Step 1: Update Configuration

Open the project in VS Code and update these files:

**1. Update `gcp/configmap.yaml`:**

```yaml
# Replace this line:
CORS_ORIGIN: "https://medicine-delivery.your-domain.com"
# With your actual domain or use "*" for testing:
CORS_ORIGIN: "*"
```

**2. Update `gcp/ingress.yaml`:**

```yaml
# Replace:
- host: medicine-delivery.your-domain.com
# With your domain or comment out for IP access
```

### Step 2: Run Deployment

```powershell
# Navigate to your project directory
cd "C:\Users\sahan\Desktop\MYProjects\online-medicine-delivery"

# Run the deployment script (replace with your actual project ID)
.\deploy-gcp.ps1 -ProjectId "your-project-id-here"

# Example:
# .\deploy-gcp.ps1 -ProjectId "medicine-delivery-platform-12345"
```

### Step 3: Monitor Deployment

```powershell
# Watch pods starting up
kubectl get pods -n medicine-delivery -w

# Check services
kubectl get services -n medicine-delivery

# Check ingress (may take 5-10 minutes to get external IP)
kubectl get ingress -n medicine-delivery
```

### Step 4: Access Your Application

```powershell
# Get the external IP address
gcloud compute addresses describe medicine-delivery-ip --global --format="value(address)"

# Or check ingress status
kubectl describe ingress medicine-delivery-ingress -n medicine-delivery
```

## 🔧 Troubleshooting

### Common Issues and Solutions

**1. "gcloud command not found"**

- Restart PowerShell after installing Google Cloud SDK
- Add to PATH: `C:\Users\[USERNAME]\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin`

**2. "Project not found"**

- Make sure you've set the correct project: `gcloud config set project YOUR_PROJECT_ID`
- Verify project exists: `gcloud projects list`

**3. "Insufficient permissions"**

- Make sure billing is enabled
- Check IAM roles: you need Editor or Owner role

**4. "Quota exceeded"**

- New accounts have limited quotas
- Request quota increase in Google Cloud Console

**5. "Pods not starting"**

- Check pod logs: `kubectl logs POD_NAME -n medicine-delivery`
- Check events: `kubectl get events -n medicine-delivery`

### Useful Commands

```powershell
# View all resources
kubectl get all -n medicine-delivery

# Check pod logs
kubectl logs -f deployment/gateway -n medicine-delivery

# Access a pod shell
kubectl exec -it deployment/postgres -n medicine-delivery -- bash

# Scale a deployment
kubectl scale deployment gateway --replicas=3 -n medicine-delivery

# Delete all resources (cleanup)
kubectl delete namespace medicine-delivery
```

## 💰 Cost Management

### Monitor Costs

- Go to: https://console.cloud.google.com/billing
- Set up billing alerts
- Monitor usage in Cloud Console

### Cost Optimization

- Use preemptible instances for development
- Scale down during off-hours
- Monitor resource usage and adjust limits

### Free Tier Limits

- $300 credit for new accounts
- 1 f1-micro instance always free
- Limited to certain regions and services

## 🔒 Security Best Practices

1. **Enable 2FA** on your Google account
2. **Use IAM roles** instead of basic roles
3. **Rotate secrets** regularly
4. **Monitor access logs**
5. **Keep services updated**

## 📞 Support

If you encounter issues:

1. Check the logs first
2. Review Google Cloud documentation
3. Check Stack Overflow for similar issues
4. Contact Google Cloud Support (with billing account)

---

**Next Steps After Deployment:**

1. Set up monitoring and alerting
2. Configure backups
3. Set up CI/CD pipeline
4. Configure domain and SSL
5. Optimize costs and performance
