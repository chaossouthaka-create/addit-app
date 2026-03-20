# 🚀 ADDIT Complete Deployment Guide

## Overview

This guide will walk you through deploying ADDIT to production:
- **Backend**: Railway (FastAPI)
- **Database**: MongoDB Atlas
- **Frontend**: Expo EAS (iOS & Android)
- **App Stores**: Apple App Store & Google Play Store

---

## 📋 Prerequisites

### Accounts You Need:
1. ✅ **GitHub Account** (to save code)
2. ✅ **Railway Account** (backend hosting) - https://railway.app
3. ✅ **MongoDB Atlas Account** (database) - https://mongodb.com/atlas
4. ✅ **Expo Account** (mobile builds) - https://expo.dev
5. ✅ **Stripe Account** (payments) - https://stripe.com
6. ✅ **Apple Developer Account** ($99/year) - https://developer.apple.com
7. ✅ **Google Play Console** ($25 one-time) - https://play.google.com/console

---

## PART 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

```bash
# 1. Go to https://mongodb.com/atlas
# 2. Sign up / Log in
# 3. Click "Build a Database"
# 4. Choose FREE tier (M0)
# 5. Select region closest to your users
# 6. Name cluster: "addit-production"
# 7. Click "Create"
```

### Step 2: Configure Database Access

```bash
# In MongoDB Atlas Dashboard:

# 1. Go to "Database Access" (left sidebar)
# 2. Click "Add New Database User"
# 3. Choose "Password" authentication
# 4. Username: addit_user
# 5. Password: Generate strong password (save it!)
# 6. Database User Privileges: "Read and write to any database"
# 7. Click "Add User"
```

### Step 3: Configure Network Access

```bash
# 1. Go to "Network Access" (left sidebar)
# 2. Click "Add IP Address"
# 3. Click "Allow Access from Anywhere" (0.0.0.0/0)
# 4. Confirm
```

### Step 4: Get Connection String

```bash
# 1. Go to "Database" → "Connect"
# 2. Choose "Connect your application"
# 3. Driver: Python, Version: 3.12 or later
# 4. Copy connection string (looks like):

mongodb+srv://addit_user:<password>@addit-production.xxxxx.mongodb.net/?retryWrites=true&w=majority

# 5. Replace <password> with your actual password
# 6. Save this - you'll need it for Railway
```

---

## PART 2: Backend Deployment (Railway)

### Step 1: Prepare Backend for Railway

First, let's create necessary Railway configuration files:

**Create `/app/backend/railway.json`:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn server:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Create `/app/backend/runtime.txt`:**
```
python-3.11
```

**Verify `/app/backend/requirements.txt` has all dependencies:**
```
fastapi==0.110.1
uvicorn==0.25.0
motor==3.3.2
python-dotenv==1.2.1
pydantic==2.12.5
emergentintegrations
paypal-checkout-serversdk
```

### Step 2: Push Code to GitHub

```bash
# Initialize git repository (if not already done)
cd /app
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ADDIT app ready for deployment"

# Create repository on GitHub.com
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/addit-app.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Railway

```bash
# 1. Go to https://railway.app
# 2. Sign up / Log in (use GitHub)
# 3. Click "New Project"
# 4. Choose "Deploy from GitHub repo"
# 5. Select your "addit-app" repository
# 6. Railway will auto-detect Python and start deploying
```

### Step 4: Configure Railway Environment Variables

```bash
# In Railway Dashboard:

# 1. Click on your service
# 2. Go to "Variables" tab
# 3. Add these variables:

MONGO_URL=mongodb+srv://addit_user:YOUR_PASSWORD@addit-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=addit_production
STRIPE_API_KEY=sk_live_YOUR_STRIPE_KEY
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PORT=8001

# 4. Click "Deploy" to apply changes
```

### Step 5: Get Railway Backend URL

```bash
# 1. In Railway Dashboard, go to "Settings"
# 2. Scroll to "Domains"
# 3. Click "Generate Domain"
# 4. Copy the URL (e.g., https://addit-backend.railway.app)
# 5. Save this URL - you'll need it for frontend
```

### Step 6: Configure Stripe Webhook

```bash
# 1. Go to https://dashboard.stripe.com/webhooks
# 2. Click "Add endpoint"
# 3. Endpoint URL: https://YOUR-RAILWAY-URL.railway.app/api/webhook/stripe
# 4. Select events:
#    - checkout.session.completed
#    - payment_intent.succeeded
# 5. Click "Add endpoint"
# 6. Copy "Signing secret" (starts with whsec_)
# 7. Add to Railway environment variables:

STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

---

## PART 3: Frontend Build (Expo EAS)

### Step 1: Install EAS CLI

```bash
# Install globally
npm install -g eas-cli

# Login to Expo
eas login
# Enter your Expo credentials
```

### Step 2: Update Frontend Environment Variables

**Edit `/app/frontend/.env`:**
```bash
EXPO_PUBLIC_BACKEND_URL=https://YOUR-RAILWAY-URL.railway.app
```

### Step 3: Configure EAS Build

```bash
cd /app/frontend
eas build:configure
```

This creates `/app/frontend/eas.json`. Update it:

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json"
      },
      "ios": {
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleId": "YOUR_APPLE_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

### Step 4: Update app.json for Production

**Edit `/app/frontend/app.json`:**
```json
{
  "expo": {
    "name": "ADDIT",
    "slug": "addit-aks",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "addit",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f1623"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.akssolutions.addit",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "Scan price tags and barcodes",
        "NSPhotoLibraryUsageDescription": "Save scanned images"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0f1623"
      },
      "package": "com.akssolutions.addit",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-camera",
      "expo-barcode-scanner",
      [
        "expo-secure-store",
        {
          "faceIDPermission": "ADDIT uses secure authentication"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      },
      "EXPO_PUBLIC_BACKEND_URL": "https://YOUR-RAILWAY-URL.railway.app"
    }
  }
}
```

### Step 5: Create App Icons & Splash Screen

```bash
# You need:
# - icon.png (1024x1024)
# - adaptive-icon.png (1024x1024)
# - splash-icon.png (1284x2778 or similar)

# Place these in /app/frontend/assets/images/
# Use a design tool like Figma or Canva to create them
```

### Step 6: Build for Android

```bash
cd /app/frontend

# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Google Play Store
eas build --platform android --profile production

# This will:
# 1. Upload your code to Expo servers
# 2. Build the Android app
# 3. Provide download link when done (~10-20 minutes)
```

### Step 7: Build for iOS

```bash
# You need an Apple Developer account first

# Enroll in Apple Developer Program:
# https://developer.apple.com/programs/enroll/

# Then build:
eas build --platform ios --profile production

# Follow prompts to:
# 1. Log in to Apple Developer account
# 2. Create App Store Connect app
# 3. Generate certificates
# 4. Build app (~20-30 minutes)
```

---

## PART 4: App Store Submission

### Google Play Store (Android)

#### Step 1: Create Google Play Console Account

```bash
# 1. Go to https://play.google.com/console
# 2. Pay $25 one-time registration fee
# 3. Complete account setup
```

#### Step 2: Create App Listing

```bash
# 1. Click "Create app"
# 2. App name: ADDIT
# 3. Default language: English (or your preference)
# 4. App type: App
# 5. Free or Paid: Paid ($3.99 will be set later)
# 6. Accept declarations
# 7. Click "Create app"
```

#### Step 3: Complete Store Listing

```yaml
Short Description (80 chars max):
"Smart shopping budget tracker. Never exceed your budget while shopping!"

Full Description (4000 chars max):
"ADDIT is your intelligent shopping companion that helps you stay within budget.

Features:
• Real-time budget tracking with visual progress bar
• Price scanner (OCR & barcode)
• Integrated calculator
• Shopping history by day/week/month/year
• 8 languages, 10 currencies
• No ads, no subscriptions
• One-time purchase, use forever

Perfect for:
- Families managing grocery budgets
- Students tracking expenses
- Anyone who wants to stop overspending

Download ADDIT today and take control of your shopping budget!"

App Category: Shopping
Email: your-email@example.com
Privacy Policy URL: https://your-website.com/privacy
```

#### Step 4: Upload Screenshots

```bash
# Required:
# - Phone screenshots: 2-8 images (1080x1920 or higher)
# - Tablet screenshots: 2-8 images (1200x1920 or higher)

# Take screenshots of:
# 1. PIN screen
# 2. Paywall
# 3. Home screen with items
# 4. Calculator
# 5. History
# 6. Settings
```

#### Step 5: Set Content Rating

```bash
# 1. Go to "Content rating"
# 2. Start questionnaire
# 3. Answer questions (ADDIT is suitable for Everyone)
# 4. Submit
```

#### Step 6: Set Pricing

```bash
# 1. Go to "Pricing"
# 2. Select "Paid"
# 3. Base price: $3.99 USD
# 4. Select countries to distribute
# 5. Save
```

#### Step 7: Upload AAB File

```bash
# 1. Go to "Production" → "Create new release"
# 2. Upload the .aab file from EAS build
# 3. Fill in release notes:
#    "Initial release - ADDIT v1.0.0
#     - Smart budget tracking
#     - Price scanning
#     - Multi-language support"
# 4. Click "Review release"
# 5. Click "Start rollout to Production"
```

### Apple App Store (iOS)

#### Step 1: Create App Store Connect App

```bash
# 1. Go to https://appstoreconnect.apple.com
# 2. Click "My Apps" → "+" → "New App"
# 3. Platform: iOS
# 4. Name: ADDIT
# 5. Primary Language: English
# 6. Bundle ID: com.akssolutions.addit
# 7. SKU: addit-001
# 8. User Access: Full Access
# 9. Click "Create"
```

#### Step 2: Complete App Information

```yaml
Name: ADDIT
Subtitle: Smart Shopping Budget Tracker

Description:
"ADDIT helps you shop smarter by tracking your budget in real-time.

Never overspend again! ADDIT calculates your total as you shop and alerts you before you exceed your budget.

FEATURES:
• Real-time budget tracking
• Color-coded progress (green, orange, red)
• Price label scanner (OCR)
• Barcode scanner with product lookup
• Built-in calculator
• Shopping history (day/week/month/year)
• 8 languages supported
• 10 currencies
• No ads, no subscriptions

PERFECT FOR:
- Grocery shopping
- Budget-conscious shoppers
- Families and students
- Anyone who wants financial control

One-time purchase, lifetime access!

Download ADDIT and start shopping smarter today!"

Keywords: budget,shopping,calculator,scanner,grocery,expenses,tracker,money
Support URL: https://your-website.com/support
Marketing URL: https://your-website.com
Privacy Policy URL: https://your-website.com/privacy

Category: Shopping
Secondary Category: Finance
```

#### Step 3: Set Pricing

```bash
# 1. Go to "Pricing and Availability"
# 2. Price: $3.99 USD (Tier 4)
# 3. Availability: All territories
# 4. Save
```

#### Step 4: Upload Screenshots

```bash
# Required sizes:
# - iPhone 6.7": 1290x2796 (2-10 images)
# - iPhone 6.5": 1242x2688 (2-10 images)
# - iPad Pro 12.9": 2048x2732 (2-10 images)

# Use same screenshots as Android (resize if needed)
```

#### Step 5: Upload Build with EAS

```bash
# Method 1: Automatic with EAS Submit
eas submit --platform ios --profile production

# Method 2: Manual
# 1. Download .ipa from EAS build
# 2. Use Transporter app to upload
# 3. Wait for processing (~10-30 minutes)
```

#### Step 6: Submit for Review

```bash
# 1. Complete all required fields
# 2. Add test account credentials (for Apple reviewers)
# 3. Attach demo video if needed
# 4. Click "Submit for Review"
# 5. Review typically takes 24-48 hours
```

---

## PART 5: Testing & Monitoring

### Test Production Backend

```bash
# Test backend is running
curl https://YOUR-RAILWAY-URL.railway.app/api/

# Expected response:
# {"message":"ADDIT Payment API"}

# Test payment endpoint
curl -X POST https://YOUR-RAILWAY-URL.railway.app/api/payments/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test_device",
    "origin_url": "https://test.com"
  }'

# Should return checkout_url and session_id
```

### Monitor Railway Logs

```bash
# In Railway Dashboard:
# 1. Click on your service
# 2. Go to "Deployments"
# 3. Click latest deployment
# 4. View logs in real-time
```

### Monitor MongoDB

```bash
# In MongoDB Atlas:
# 1. Go to "Database" → "Browse Collections"
# 2. Select "addit_production"
# 3. View collections:
#    - payment_transactions
#    - purchases
#    - status_checks
```

### Monitor Stripe Payments

```bash
# In Stripe Dashboard:
# 1. Go to "Payments"
# 2. Filter by status
# 3. Check webhook events in "Developers" → "Webhooks"
```

---

## 📊 Post-Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] MongoDB Atlas connected
- [ ] Environment variables configured
- [ ] Stripe webhook configured
- [ ] Frontend built with EAS
- [ ] Android app on Google Play
- [ ] iOS app on App Store
- [ ] Test payment flow end-to-end
- [ ] Monitor first 10 transactions
- [ ] Set up error monitoring (Sentry optional)
- [ ] Create support email/system
- [ ] Prepare privacy policy & terms

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check Railway logs for errors
# Common issues:
# - Missing environment variables
# - MongoDB connection string incorrect
# - Python version mismatch
```

### EAS build fails
```bash
# Check build logs
eas build:list

# Common issues:
# - Missing icons/assets
# - package.json errors
# - Bundle identifier conflicts
```

### Payment not working
```bash
# Verify:
# - Stripe API key is production key
# - Webhook is configured correctly
# - Backend URL in frontend .env is correct
# - MongoDB is accessible
```

---

## 💰 Cost Estimate

| Service | Cost |
|---------|------|
| Railway (Backend) | Free - $5/month |
| MongoDB Atlas | Free - $9/month |
| Expo EAS Builds | Free (limited) - $29/month |
| Apple Developer | $99/year |
| Google Play Console | $25 one-time |
| **Monthly Total** | $0-15 + $99/year |

---

## 📞 Support

If you encounter issues:
1. Check Railway logs
2. Check MongoDB Atlas monitoring
3. Check Stripe Dashboard
4. Review EAS build logs

---

**Deployment Complete! 🎉**

Your ADDIT app is now live in production!

*Last Updated: March 19, 2026*