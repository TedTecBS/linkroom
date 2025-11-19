# Linkroom Setup Guide

This guide will walk you through setting up the Linkroom job board application from scratch.

## Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org/))
- A Firebase account ([Sign up](https://firebase.google.com/))
- A Paystack account ([Sign up](https://paystack.com/))
- A Mapbox account ([Sign up](https://www.mapbox.com/))
- Git installed

## Step 1: Install Dependencies

```bash
cd linkroom
npm install
```

Install Cloud Functions dependencies:

```bash
cd functions
npm install
cd ..
```

## Step 2: Firebase Project Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "linkroom" (or your preferred name)
4. Follow the setup wizard

### 2.2 Register Web App

1. In Firebase Console, click the **Web** icon (</>) to add a web app
2. Register app with nickname: "Linkroom Web"
3. Copy the Firebase configuration object (you'll need this for `.env`)

### 2.3 Enable Authentication

1. Navigate to **Authentication** in the Firebase Console
2. Click **Get Started**
3. Enable sign-in methods:
   - **Email/Password**: Enable
   - **Google**: Enable (configure OAuth consent screen)

### 2.4 Create Firestore Database

1. Navigate to **Firestore Database**
2. Click **Create database**
3. Choose **Production mode**
4. Select a location (choose closest to your users)
5. Click **Enable**

### 2.5 Enable Cloud Storage

1. Navigate to **Storage**
2. Click **Get started**
3. Use default security rules for now (we'll deploy custom rules later)
4. Click **Done**

### 2.6 Upgrade to Blaze Plan (Required for Cloud Functions)

1. Navigate to **Upgrade** in Firebase Console
2. Select **Blaze (Pay as you go)** plan
3. Set up billing

## Step 3: Configure Environment Variables

### 3.1 Frontend Environment

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Firebase Configuration (from Step 2.2)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Paystack (get from Paystack dashboard)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Mapbox (get from Mapbox dashboard)
VITE_MAPBOX_TOKEN=pk.xxxxxxxxxxxxx

# Environment
VITE_ENV=development
```

### 3.2 Cloud Functions Environment

Configure Firebase Functions config:

```bash
firebase functions:config:set paystack.secret_key="sk_test_xxxxxxxxxxxxx"
```

## Step 4: Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

## Step 5: Deploy Storage Rules

```bash
firebase deploy --only storage
```

## Step 6: Initialize Database with Sample Data (Optional)

You can manually add some initial data through Firebase Console or create a seed script.

### Create Admin User

1. Sign up through the app with email/password
2. Go to Firebase Console → Authentication
3. Copy the User UID
4. Go to Firestore Database → users collection
5. Find your user document and update the `role` field to `"admin"`

### Create Sample Plans

Go to Firestore Database and create the `plans` collection:

```javascript
// Plan 1: Single Job
{
  name: "Single Job Posting",
  type: "single",
  price: 149,
  currency: "ZAR",
  jobCredits: 1,
  description: "Post a single job listing",
  isActive: true
}

// Plan 2: Bundle
{
  name: "5 Job Bundle",
  type: "bundle",
  price: 600,
  currency: "ZAR",
  jobCredits: 5,
  description: "Post up to 5 jobs",
  isActive: true
}

// Plan 3: Monthly Subscription
{
  name: "Monthly Subscription",
  type: "subscription",
  price: 1500,
  currency: "ZAR",
  durationMonths: 1,
  description: "Unlimited job postings for 1 month",
  features: ["Unlimited job postings", "Priority support", "Featured company badge"],
  isActive: true
}

// Plan 4: Annual Subscription
{
  name: "Annual Subscription",
  type: "subscription",
  price: 12500,
  currency: "ZAR",
  durationMonths: 12,
  description: "Unlimited job postings for 1 year",
  features: ["Unlimited job postings", "Priority support", "Featured company badge", "Save 30%"],
  isActive: true
}
```

## Step 7: Deploy Cloud Functions

```bash
cd functions
npm run build
firebase deploy --only functions
cd ..
```

## Step 8: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 9: Test the Application

### Test Authentication

1. Visit `http://localhost:3000/signup`
2. Create a job seeker account
3. Create an employer account
4. Test Google sign-in

### Test Firestore Security

Try accessing data you shouldn't have access to - security rules should prevent unauthorized access.

## Step 10: Deploy to Production

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

## Additional Configuration

### Configure Paystack Webhooks

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://<region>-<project-id>.cloudfunctions.net/paystackWebhook`
3. Save the webhook secret

### Set up Custom Domain (Optional)

1. In Firebase Console, go to **Hosting**
2. Click **Add custom domain**
3. Follow the DNS configuration steps

### Enable Cloud Scheduler (for Job Alerts)

```bash
gcloud scheduler jobs create pubsub sendJobAlerts \
  --schedule="0 9 * * *" \
  --topic=your-topic-name \
  --message-body="trigger"
```

## Monitoring and Maintenance

### View Logs

```bash
# Frontend logs (in browser console)

# Cloud Functions logs
firebase functions:log
```

### Monitor Usage

1. Firebase Console → Usage and billing
2. Monitor Authentication, Firestore, Storage, and Functions usage

### Backup Firestore Data

Set up automated Firestore backups:

```bash
gcloud firestore export gs://your-bucket-name
```

## Troubleshooting

### Issue: "Firebase not initialized"

**Solution**: Check that `.env` file exists and contains valid credentials.

### Issue: "Permission denied" errors

**Solution**: 
- Check Firestore security rules
- Ensure user has correct role
- Verify user is authenticated

### Issue: Cloud Functions not deploying

**Solution**:
- Ensure you're on Blaze plan
- Check `functions/package.json` for errors
- Run `cd functions && npm run build` to check for TypeScript errors

### Issue: Paystack payments failing

**Solution**:
- Verify Paystack API keys (test vs live)
- Check Cloud Functions config: `firebase functions:config:get`
- Review Cloud Functions logs

## Next Steps

Now that your application is set up:

1. **Customize branding** - Update colors, logos, and copy
2. **Add content** - Create job listings, companies
3. **Configure email templates** - For notifications and alerts
4. **Set up analytics** - Google Analytics or similar
5. **Implement AI features** - Job recommendations, CV screening
6. **Add tests** - Unit tests, integration tests

## Getting Help

- **Documentation**: Check `docs/DEVELOPMENT.md`
- **Firebase Docs**: https://firebase.google.com/docs
- **Paystack Docs**: https://paystack.com/docs
- **GitHub Issues**: Report bugs and request features

---

## Quick Reference Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run lint               # Run linter
npm run format             # Format code

# Firebase
firebase login             # Login to Firebase
firebase deploy            # Deploy everything
firebase deploy --only hosting      # Deploy hosting only
firebase deploy --only functions    # Deploy functions only
firebase deploy --only firestore:rules  # Deploy Firestore rules

# Functions
cd functions
npm run build              # Build functions
npm run serve              # Run functions locally
firebase functions:log     # View logs
```

---

🎉 **Congratulations!** Your Linkroom application is now set up and ready for development.
