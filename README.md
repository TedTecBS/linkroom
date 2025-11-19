# Linkroom

**Connecting Top Talent with Opportunity**

A modern, production-ready job board web application built with React, TypeScript, Firebase, and Tailwind CSS.

## 🚀 Features

### For Job Seekers
- Create and manage professional profiles
- Upload and store CVs
- Browse and search jobs with advanced filters
- Save jobs for later
- Apply for jobs (internal or external)
- Track application status
- Set up job alerts with custom criteria

### For Employers
- Create and manage company profiles
- Post and manage job listings
- View and manage applications
- AI-powered candidate screening
- Flexible billing options (single jobs, bundles, subscriptions)
- Integrated Paystack payment processing

### For Administrators
- Comprehensive admin dashboard
- User and employer management
- Job moderation and approval
- Featured company management
- Activity logs and analytics

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with shadcn/ui components
- **Routing:** React Router v6
- **State Management:** React Query + Zustand
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

### Backend
- **Platform:** Firebase
  - Authentication (Email/Password, Google OAuth)
  - Firestore (NoSQL database)
  - Cloud Functions (API layer)
  - Cloud Storage (File uploads)
- **Payments:** Paystack API
- **Maps:** Mapbox API

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account and project
- Paystack account (for payments)
- Mapbox account (for location features)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd linkroom
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# Mapbox
VITE_MAPBOX_TOKEN=your_mapbox_token

# Environment
VITE_ENV=development
```

### 3. Firebase Setup

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com)

2. **Enable Authentication:**
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google

3. **Create Firestore Database:**
   - Go to Firestore Database
   - Create database in production mode
   - Deploy security rules (see `firestore.rules`)

4. **Enable Cloud Storage:**
   - Go to Storage
   - Get started with default settings

5. **Setup Cloud Functions:**
   ```bash
   cd functions
   npm install
   ```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
linkroom/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   └── layouts/         # Layout components
│   ├── features/            # Feature-based modules
│   │   ├── auth/            # Authentication
│   │   ├── jobs/            # Job management
│   │   ├── employers/       # Employer features
│   │   ├── job-seeker/      # Job seeker features
│   │   └── admin/           # Admin features
│   ├── pages/               # Page components
│   ├── lib/                 # Core utilities
│   │   ├── firebase.ts      # Firebase configuration
│   │   ├── firestore-collections.ts  # Type-safe collections
│   │   └── utils.ts         # Helper functions
│   ├── types/               # TypeScript type definitions
│   ├── hooks/               # Custom React hooks
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── functions/               # Firebase Cloud Functions
├── public/                  # Static assets
└── firestore.rules          # Firestore security rules
```

## 🔐 Security

- All sensitive operations go through Cloud Functions
- Firestore security rules enforce role-based access
- No direct client writes to critical collections
- Environment variables for all secrets
- Input validation with Zod schemas

## 🧪 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format
```

### Code Quality

- **TypeScript strict mode** enabled
- **ESLint** for code linting
- **Prettier** for code formatting
- Follow React and TypeScript best practices

## 🚢 Deployment

### Frontend (Elitehost or Firebase Hosting)

```bash
# Build the application
npm run build

# Deploy to Firebase Hosting (optional)
firebase deploy --only hosting
```

### Cloud Functions

```bash
cd functions
npm run deploy
```

## 📊 Data Model

### Collections

- `users` - User accounts and roles
- `job_seeker_profiles` - Job seeker profiles and CVs
- `organisations` - Company profiles
- `jobs` - Job listings
- `applications` - Job applications
- `plans` - Billing plans
- `subscriptions` - Active subscriptions
- `alerts` - Job alert configurations
- `saved_jobs` - Saved jobs by users
- `admin_logs` - Admin activity logs

## 💳 Billing

Powered by Paystack with the following options:

- **Single Job:** R149 per posting
- **Bundle:** R600 for 5 postings
- **Monthly Subscription:** R1,500 (unlimited jobs)
- **Annual Subscription:** R12,500 (unlimited jobs)

## 🤖 AI Features

- **Job Recommendations** - Based on profile and preferences
- **Cover Letter Assistance** - AI-generated tailored cover letters
- **Candidate Screening** - Automated CV scoring and ranking

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Support

For support and questions, please contact: [your-email@example.com]

---

Built with ❤️ for connecting top talent with opportunity
