# 🚀 Quick Deployment Commands

## Prerequisites Setup

```bash
# 1. Install required tools
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Login to Railway (if using Railway CLI)
npm install -g @railway/cli
railway login
```

---

## Backend Deployment (Railway)

### Option 1: Via GitHub (Recommended)

```bash
# 1. Push code to GitHub
cd /app
git init
git add .
git commit -m "ADDIT app ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/addit-app.git
git push -u origin main

# 2. Deploy via Railway Dashboard
# - Go to railway.app
# - New Project → Deploy from GitHub
# - Select repository
# - Add environment variables
```

### Option 2: Via Railway CLI

```bash
cd /app/backend

# Initialize Railway project
railway init

# Link to existing project (if created in dashboard)
railway link

# Set environment variables
railway variables set MONGO_URL="mongodb+srv://..."
railway variables set DB_NAME="addit_production"
railway variables set STRIPE_API_KEY="sk_live_..."

# Deploy
railway up

# Get deployment URL
railway domain
```

---

## MongoDB Atlas Setup

```bash
# 1. Create cluster at mongodb.com/atlas
# 2. Create database user
# 3. Whitelist all IPs (0.0.0.0/0)
# 4. Get connection string:

mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority

# 5. Replace USERNAME and PASSWORD with actual credentials
```

---

## Frontend Build (Expo EAS)

### Configure EAS

```bash
cd /app/frontend

# Initialize EAS (if not done)
eas build:configure

# Update .env with production backend URL
echo "EXPO_PUBLIC_BACKEND_URL=https://your-railway-url.railway.app" > .env
```

### Build for Android

```bash
# Development build (APK for testing)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production

# Download and test APK
# EAS will provide download link when complete
```

### Build for iOS

```bash
# Production build (requires Apple Developer account)
eas build --platform ios --profile production

# Follow prompts to:
# - Sign in to Apple account
# - Generate certificates
# - Create app in App Store Connect
```

### Submit to Stores

```bash
# Submit to Google Play
eas submit --platform android --profile production

# Submit to Apple App Store
eas submit --platform ios --profile production
```

---

## Environment Variables

### Backend (.env for Railway)

```bash
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=addit_production
STRIPE_API_KEY=sk_live_YOUR_KEY
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_SECRET=your_secret
PORT=8001
```

### Frontend (.env)

```bash
EXPO_PUBLIC_BACKEND_URL=https://your-backend.railway.app
```

---

## Testing Deployment

### Test Backend

```bash
# Health check
curl https://your-backend.railway.app/api/

# Test payment endpoint
curl -X POST https://your-backend.railway.app/api/payments/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test123",
    "origin_url": "https://test.com"
  }'
```

### Test App Builds

```bash
# Check build status
eas build:list

# View build details
eas build:view BUILD_ID

# Download build
# Click link from build:list output
```

---

## Monitoring

### Railway Logs

```bash
# Via CLI
railway logs

# Via Dashboard
# railway.app → Your Project → Deployments → Logs
```

### MongoDB Monitoring

```bash
# Via Atlas Dashboard
# mongodb.com/cloud/atlas → Database → Metrics
```

### Stripe Monitoring

```bash
# Via Stripe Dashboard
# dashboard.stripe.com → Payments
# dashboard.stripe.com → Webhooks → Recent deliveries
```

---

## Troubleshooting Commands

```bash
# Railway
railway status        # Check service status
railway logs --tail   # Follow logs in real-time
railway variables     # List environment variables

# EAS
eas build:list        # List all builds
eas build:cancel      # Cancel running build
eas credentials       # Manage certificates

# Git
git status            # Check what's changed
git log --oneline     # View commit history
git remote -v         # View remote URLs
```

---

## Update & Redeploy

### Update Backend

```bash
cd /app/backend

# Make changes to code
# ...

# Commit and push
git add .
git commit -m "Update: description"
git push

# Railway auto-deploys on push
# Or manually: railway up
```

### Update Frontend

```bash
cd /app/frontend

# Update version in app.json
# "version": "1.0.1"
# "android.versionCode": 2
# "ios.buildNumber": "2"

# Build new version
eas build --platform all --profile production

# Submit update
eas submit --platform all --profile production
```

---

## Rollback

### Railway Rollback

```bash
# Via Dashboard:
# Railway → Deployments → Click previous deployment → Redeploy

# Via CLI:
railway redeploy DEPLOYMENT_ID
```

### App Store Rollback

```bash
# Google Play:
# Play Console → Production → Releases → Create release from previous

# App Store:
# Cannot rollback - must submit new version
```

---

## Cost Monitoring

```bash
# Railway usage
# Dashboard → Usage

# MongoDB Atlas usage
# Atlas → Organization → Billing

# Expo EAS usage
# expo.dev → Account → Billing
```

---

## Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Railway backend deployed
- [ ] Environment variables set
- [ ] Stripe webhook configured
- [ ] Production Stripe key added
- [ ] Backend URL updated in frontend
- [ ] Android build completed
- [ ] iOS build completed
- [ ] Google Play listing complete
- [ ] App Store listing complete
- [ ] Test payment end-to-end
- [ ] Monitor first transactions

---

## Support Resources

- Railway Docs: https://docs.railway.app
- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Stripe: https://stripe.com/docs

---

**Quick Reference Complete!** 🚀

Use these commands for fast deployment and maintenance.
