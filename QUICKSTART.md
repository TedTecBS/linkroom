# Quick Start Guide - Linkroom

Get Linkroom up and running in under 30 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Firebase account created
- [ ] Paystack account created (for payments)
- [ ] Mapbox account created (for location features)

## Step 1: Install Dependencies (2 minutes)

```bash
# Navigate to project directory
cd linkroom

# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

## Step 2: Firebase Project Setup (10 minutes)

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name your project (e.g., "linkroom")
4. Disable Google Analytics (optional for now)
5. Click **"Create project"**

### Enable Services

**Authentication:**
1. Go to **Authentication** → **Get Started**
2. Enable **Email/Password**
3. Enable **Google** sign-in

**Firestore:**
1. Go to **Firestore Database** → **Create database**
2. Start in **production mode**
3. Choose a location close to your users

**Storage:**
1. Go to **Storage** → **Get started**
2. Use default security rules
3. Click **Done**

**Upgrade to Blaze Plan:**
1. Go to **Upgrade** (needed for Cloud Functions)
2. Select **Blaze (Pay as you go)**
3. Set up billing

### Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** → Click **Web** icon `</>`
3. Register app with nickname "Linkroom Web"
4. Copy the config object

## Step 3: Configure Environment (5 minutes)

### Create .env File

```bash
cp .env.example .env
```

### Edit .env File

Open `.env` and add your credentials:

```env
# Firebase (from Step 2)
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Paystack (get from dashboard)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key

# Mapbox (get from dashboard)
VITE_MAPBOX_TOKEN=pk.your_token

VITE_ENV=development
```

### Configure Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set your project
firebase use --add
# Select your project from the list
```

## Step 4: Deploy Security Rules (3 minutes)

```bash
# Deploy Firestore and Storage security rules
firebase deploy --only firestore:rules,storage
```

## Step 5: Run the App (1 minute)

```bash
# Start development server
npm run dev
```

Visit: **http://localhost:3000**

## Step 6: Create Your First User (2 minutes)

1. Click **"Sign Up"**
2. Select role: **"Job Seeker"** or **"Employer"**
3. Fill in details
4. Create account

### Make Yourself an Admin

1. Go to Firebase Console → **Authentication**
2. Copy your **User UID**
3. Go to **Firestore Database** → **users** collection
4. Find your user document
5. Edit the `role` field to `"admin"`

## Step 7: Add Sample Data (5 minutes)

### Create Plans

Go to Firestore Database and create **plans** collection:

**Plan 1: Single Job**
```json
{
  "name": "Single Job Posting",
  "type": "single",
  "price": 149,
  "currency": "ZAR",
  "jobCredits": 1,
  "description": "Post a single job listing",
  "isActive": true
}
```

**Plan 2: Monthly Subscription**
```json
{
  "name": "Monthly Subscription",
  "type": "subscription",
  "price": 1500,
  "currency": "ZAR",
  "durationMonths": 1,
  "description": "Unlimited job postings for 1 month",
  "isActive": true
}
```

## Troubleshooting

### "Firebase not initialized"
- Check that `.env` file exists
- Verify all Firebase credentials are correct
- Restart dev server

### "Permission denied" errors
- Security rules may not be deployed: `firebase deploy --only firestore:rules`
- Check user has correct role in Firestore

### Dependencies installation fails
- Clear cache: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

### Port 3000 already in use
- Change port in `vite.config.ts`: `server: { port: 3001 }`

## What's Next?

### Immediate Next Steps

1. **Deploy Cloud Functions**
   ```bash
   cd functions
   firebase deploy --only functions
   ```

2. **Configure Paystack**
   - Set Functions config: `firebase functions:config:set paystack.secret_key="sk_test_your_key"`

3. **Start Building Features**
   - Implement job posting
   - Create job search
   - Add payment flows

### Resources

- **Documentation**: Check `docs/` folder
- **Development Guide**: `docs/DEVELOPMENT.md`
- **Setup Guide**: `docs/SETUP.md`
- **Project Status**: `PROJECT_STATUS.md`

### Recommended Order of Implementation

1. **Job Seeker Profile** - Let users create profiles
2. **Job Posting** - Let employers post jobs
3. **Job Search** - Basic job listing and search
4. **Applications** - Apply for jobs functionality
5. **Payments** - Subscription and billing
6. **AI Features** - Job recommendations, CV screening

## Production Deployment

When ready for production:

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy Cloud Functions
cd functions && firebase deploy --only functions
```

Your app will be live at: `https://your-project-id.web.app`

---

## Quick Command Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run lint                   # Check code quality

# Firebase
firebase deploy                # Deploy everything
firebase deploy --only hosting # Deploy frontend only
firebase deploy --only functions # Deploy Cloud Functions only
firebase functions:log         # View function logs

# Functions
cd functions
npm run build                  # Build functions
npm run serve                  # Test functions locally
```

---

🎉 **Congratulations!** Linkroom is now running locally. Time to build amazing features!

Need help? Check the documentation or review existing code for patterns.

**Happy coding!** 🚀
