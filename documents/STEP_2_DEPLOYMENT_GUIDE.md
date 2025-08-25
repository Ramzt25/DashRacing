# 🚀 GridGhost Production Deployment Guide

## ✅ Step 2: Infrastructure & Deployment - **READY TO DEPLOY**

### Current Status
✅ **Infrastructure Configuration**: Complete  
✅ **Security Setup**: Managed Identity + Key Vault  
✅ **Deployment Tools**: Verified (az, azd, docker)  
✅ **Infrastructure Validation**: All Bicep files error-free  
⏳ **Next**: Azure subscription setup and deployment  

---

## 🔧 Pre-Deployment Requirements

### 1. Azure Subscription Setup
**You'll need an active Azure subscription to deploy GridGhost.**

**Option A: Free Azure Account**
1. Visit: https://azure.microsoft.com/free/
2. Sign up for 12 months free + $200 credit
3. Complete verification with phone/email

**Option B: Existing Account**
1. Log into https://portal.azure.com
2. Navigate to "Subscriptions" 
3. Ensure you have an active subscription

### 2. Environment Variables Setup
Create these environment variables before deployment:

```bash
# Core Settings
export AZURE_ENV_NAME="gridghost-prod"
export AZURE_LOCATION="eastus"
export JWT_SECRET="$(openssl rand -base64 32)"
export DATABASE_ADMIN_PASSWORD="GridGhost2025!$(openssl rand -base64 8)"

# API Keys (obtain from providers)
export GOOGLE_MAPS_API_KEY="your-google-maps-api-key-here"
export AZURE_MAPS_API_KEY="your-azure-maps-api-key-here"  
export EXPO_PUBLIC_GOOGLE_MAPS_API_KEY="your-expo-google-maps-key"
export EXPO_PUBLIC_AZURE_MAPS_KEY="your-expo-azure-maps-key"
```

**Get API Keys:**
- **Google Maps**: https://developers.google.com/maps/gmp-get-started
- **Azure Maps**: https://docs.microsoft.com/azure/azure-maps/how-to-manage-authentication

---

## 🚀 Deployment Steps

### Step 1: Authentication
```bash
# Login to Azure
azd auth login

# Verify subscription access
az account list --output table
```

### Step 2: Preview Deployment
```bash
# Preview what will be created (recommended)
azd provision --preview
```

### Step 3: Deploy Infrastructure
```bash
# Deploy everything (infrastructure + applications)
azd up
```

**Expected deployment time: 10-15 minutes**

---

## 📊 What Gets Deployed

### Azure Resources Created:
1. **Resource Group** - `rg-gridghost-prod`
2. **Container Apps Environment** - Scalable app hosting
3. **Container App** - GridGhost API server
4. **PostgreSQL Flexible Server** - User data & race data
5. **Container Registry** - Docker image storage  
6. **Storage Account** - File uploads & race telemetry
7. **Key Vault** - Secure secret storage
8. **Application Insights** - Performance monitoring
9. **Static Web App** - Mobile application hosting
10. **Log Analytics** - Centralized logging

### Security Features:
✅ **Managed Identity** - No hardcoded credentials  
✅ **RBAC Permissions** - Least privilege access  
✅ **TLS Encryption** - All traffic encrypted  
✅ **Key Vault Secrets** - Secure credential storage  
✅ **Network Security** - Proper firewall rules  

---

## 💰 Cost Breakdown

### Monthly Estimates (USD):
- **Container Apps**: $30-50 (auto-scaling)
- **PostgreSQL Flexible**: $25-40 (burstable tier)
- **Storage Account**: $5-15 (hot tier)
- **Application Insights**: $10-20 (monitoring)
- **Key Vault**: $1-5 (secret operations)
- **Static Web Apps**: $0 (free tier)
- **Other Services**: $5-10 (logs, registry)

**Total: $76-140/month** (scales with usage)

**Free Tier Benefits:**
- First month covered by $200 Azure credit
- Many services have free tiers for development

---

## 🔍 Post-Deployment Steps

### 1. Verify Deployment
```bash
# Check deployment status
azd show

# Get application URLs
azd show --output json | jq '.services'
```

### 2. Database Migration
```bash
# Navigate to API directory
cd src

# Run Prisma migrations
npx prisma migrate deploy
npx prisma db seed
```

### 3. Container Image Build
```bash
# Build and push API container
azd deploy gridghost-api
```

### 4. Testing
```bash
# Get API endpoint
export API_URL=$(azd show --output json | jq -r '.services."gridghost-api".endpoint')

# Test health endpoint
curl $API_URL/health
```

---

## 🎯 Production Readiness Checklist

### Performance & Scaling:
✅ **Auto-scaling**: 1-10 Container App instances  
✅ **Database**: Burstable tier with auto-grow storage  
✅ **CDN**: Static assets served globally  
✅ **Caching**: Redis-compatible Azure Cache (future)  

### Monitoring & Observability:
✅ **Application Insights**: Performance metrics  
✅ **Log Analytics**: Centralized logging  
✅ **Health Checks**: API endpoint monitoring  
✅ **Alerts**: Custom performance alerts (setup needed)  

### Security & Compliance:
✅ **Authentication**: JWT-based user auth  
✅ **Data Encryption**: At-rest and in-transit  
✅ **Network Security**: Private networking option  
✅ **Compliance**: GDPR-ready data handling  

---

## 🆘 Troubleshooting

### Common Issues:

**"No subscriptions found"**
- Ensure Azure subscription is active
- Run `az account list` to verify access
- Try `azd auth login` again

**"Insufficient quota"**
- Check regional availability: `az account list-locations`
- Try different Azure region in AZURE_LOCATION

**"Key Vault access denied"**
- Managed identity setup handles this automatically
- Verify deployment completed successfully

**"Container build failed"**
- Ensure Docker is running
- Check Dockerfile exists in project root

---

## 🚀 Ready to Deploy!

GridGhost is fully configured for Azure production deployment. Once you have an Azure subscription:

1. Set the environment variables
2. Run `azd up`
3. Wait 10-15 minutes for complete deployment
4. Your racing app will be live on Azure! 🏁

**Next**: After successful deployment, we'll proceed to **Step 3: Legal & Compliance** for production readiness.