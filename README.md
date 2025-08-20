# Linkroom

Minimal React + Firebase jobs board with conditional AdSense rendering.

## Features
- Email/Google auth with roles (`admin`, `employer`).
- Admin and employer job posting via Cloud Functions.
- Employer job creation decrements company tokens.
- Job detail page renders AdSense only for admin-posted jobs.

## Setup
1. **Firebase project**
   - Enable Email/Password and Google sign-in.
   - Create Firestore and Cloud Functions (requires billing).
2. **Env**
   - Copy `.env.example` to `.env` and fill Firebase and AdSense values.
3. **Install & run**
   ```bash
   npm install
   npm run dev
   ```
4. **Auth & data seeding**
   - Create an admin user and set custom claim `role: "admin"`.
   - Create an employer user with `role: "employer"` and `companyId` referencing a company doc: `{ tokensRemaining: 3 }`.
5. **Posting jobs**
   - Admin: visit `/admin/post-job`.
   - Employer: visit `/employer/post-job`.
6. **Verify ads**
   - Admin jobs show AdSense blocks on detail page.
   - Employer jobs never render ads and decrement tokens.

## Ad slots

Use the `AdSlot` component to render individual ad units. Specify the AdSense slot ID for each location where an ad should appear:

```tsx
import AdSlot from './components/AdSlot'

<AdSlot slot="YOUR_SLOT_ID_HERE" />
```

Replace `YOUR_SLOT_ID_HERE` with the slot ID for the ad unit.

## Tests
```
npm test
```
