# Clyqa — Waitlist Landing Page

Clyqa is Africa's performance creator marketplace. Brands post campaigns, creators post content on their own pages, and everyone earns based on real views, likes, and sales — no more one-off flat fees.

This repository contains the Clyqa waitlist landing page, built to capture early interest from creators and brands ahead of the Nigeria launch.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Firebase 12** — Firestore (client SDK) for waitlist submissions
- **TypeScript**

## Local Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd the-clyqa-mvp

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Then open .env.local and fill in your Firebase config values (see Firebase Setup below)

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project (or use an existing one).
2. In the Firebase console, go to **Firestore Database** and click **Create database**. Start in production mode.
3. Go to **Project Settings → Your Apps** and add a **Web app**. Copy the Firebase config values.
4. Paste the config values into your `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firestore Security Rules

In the Firebase console under **Firestore → Rules**, apply the following rules to allow waitlist submissions while preventing public reads:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /waitlist/{entry} {
      allow create: if true;
      allow read, update, delete: if false;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Vercel Deployment

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
3. In the Vercel project settings, go to **Environment Variables** and add all the `NEXT_PUBLIC_FIREBASE_*` variables plus `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL, e.g. `https://clyqa.vercel.app`).
4. Click **Deploy**.

Vercel will automatically redeploy on every push to your main branch.
