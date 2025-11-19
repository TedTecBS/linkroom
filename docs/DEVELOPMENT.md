# Development Guide

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **Git** for version control
- **Firebase CLI**: Install via `npm install -g firebase-tools`

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd linkroom
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Firebase and API credentials.

4. **Login to Firebase**
   ```bash
   firebase login
   firebase use --add  # Select your Firebase project
   ```

### Development Workflow

#### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

#### Running Firebase Emulators (Optional)

To test locally with Firebase emulators:

```bash
firebase emulators:start
```

Set `VITE_USE_FIREBASE_EMULATOR=true` in your `.env` file.

#### Code Quality

- **Linting**: `npm run lint`
- **Formatting**: `npm run format`
- **Type checking**: TypeScript will check types during build

#### Building for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

## Project Structure Explained

```
linkroom/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # Base shadcn/ui components
│   │   ├── layouts/      # Layout wrappers
│   │   ├── Navbar.tsx    # Main navigation
│   │   ├── Footer.tsx    # Footer component
│   │   └── Sidebar.tsx   # Dashboard sidebar
│   │
│   ├── features/         # Feature modules
│   │   ├── auth/         # Authentication logic
│   │   ├── jobs/         # Job-related features
│   │   ├── employers/    # Employer features
│   │   └── admin/        # Admin features
│   │
│   ├── pages/            # Page components (route components)
│   │   ├── auth/         # Login, Signup pages
│   │   ├── jobs/         # Job listing, detail pages
│   │   ├── job-seeker/   # Job seeker dashboard pages
│   │   ├── employer/     # Employer dashboard pages
│   │   └── admin/        # Admin dashboard pages
│   │
│   ├── lib/              # Core utilities and configuration
│   │   ├── firebase.ts   # Firebase initialization
│   │   ├── firestore-collections.ts  # Type-safe Firestore helpers
│   │   └── utils.ts      # Helper functions
│   │
│   ├── types/            # TypeScript types and Zod schemas
│   ├── hooks/            # Custom React hooks
│   ├── App.tsx           # Main app with routing
│   └── main.tsx          # Entry point
│
├── functions/            # Firebase Cloud Functions
│   ├── src/
│   │   ├── payments/     # Paystack integration
│   │   ├── applications/ # Job application logic
│   │   ├── jobs/         # Job-related functions
│   │   └── index.ts      # Functions export
│   └── package.json
│
├── public/               # Static assets
├── firestore.rules       # Firestore security rules
├── storage.rules         # Storage security rules
└── firebase.json         # Firebase configuration
```

## Key Concepts

### 1. Type Safety

All Firestore operations use **type-safe converters**:

```typescript
import { jobDoc } from '@/lib/firestore-collections';

// Fully typed read
const job = await getDoc(jobDoc('job-id'));
const jobData = job.data(); // Type: Job | undefined
```

### 2. Role-Based Access Control

Routes are protected using the `ProtectedRoute` component:

```typescript
<ProtectedRoute allowedRoles={['employer']}>
  <EmployerDashboard />
</ProtectedRoute>
```

Security is enforced both:
- **Client-side**: Via route guards
- **Server-side**: Via Firestore security rules and Cloud Functions

### 3. State Management

- **Server State**: React Query (`@tanstack/react-query`)
- **Global State**: Zustand (for auth and UI state)
- **Form State**: React Hook Form + Zod validation

### 4. Cloud Functions Architecture

All write operations to critical collections go through Cloud Functions:

- ✅ Client reads from Firestore
- ✅ Client calls Cloud Function for writes
- ✅ Cloud Function validates and writes to Firestore

Example:
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const applyForJob = httpsCallable(functions, 'applyForJob');

const result = await applyForJob({ jobId, coverLetter });
```

## Common Tasks

### Adding a New Page

1. Create the page component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Update sidebar navigation if needed in `src/components/Sidebar.tsx`

### Adding a New Collection

1. Define types in `src/types/index.ts` (with Zod schema)
2. Create converter in `src/lib/firestore-collections.ts`
3. Add security rules in `firestore.rules`
4. Create Cloud Function if complex write logic is needed

### Adding a New Cloud Function

1. Create function file in `functions/src/`
2. Export from `functions/src/index.ts`
3. Deploy: `cd functions && npm run deploy`

### Testing Locally

```bash
# Run frontend
npm run dev

# Run functions emulator
cd functions
npm run serve
```

## Deployment

### Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Deploy Cloud Functions

```bash
cd functions
firebase deploy --only functions
```

### Deploy Everything

```bash
firebase deploy
```

## Environment Variables

Required environment variables (`.env`):

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=

# Mapbox
VITE_MAPBOX_TOKEN=

# Environment
VITE_ENV=development
```

## Troubleshooting

### Firebase Connection Issues

Ensure `.env` is properly configured and Firebase project is active.

### TypeScript Errors

Run `npm run lint` to see all errors. Most common issues:
- Missing types for third-party packages
- Incorrect import paths
- Untyped function parameters

### Build Failures

Clear cache and rebuild:
```bash
rm -rf node_modules dist
npm install
npm run build
```

## Best Practices

1. **Always use TypeScript types** - No `any` types
2. **Validate all inputs** - Use Zod schemas
3. **Write meaningful commit messages** - Follow conventional commits
4. **Test security rules** - Use Firebase emulator
5. **Keep functions small** - One responsibility per function
6. **Handle errors gracefully** - User-friendly error messages
7. **Use loading states** - Better UX during async operations

## Need Help?

- Check the [README.md](../README.md) for setup instructions
- Review [Firebase documentation](https://firebase.google.com/docs)
- Check existing code for patterns and examples

---

Happy coding! 🚀
