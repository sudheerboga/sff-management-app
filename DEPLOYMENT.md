# Boutiqo — Deployment Guide

## Firebase Projects

| Alias | Project ID | Purpose |
|---|---|---|
| `staging` | `boutiques-management` | Testing / Development |
| `production` | `boutiqo-sales` | Live / Production |

---

## One-Time Setup

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Add both Google accounts
```bash
firebase login:add   # add testing account
firebase login:add   # add production account
```

### 3. Verify both accounts are added
```bash
firebase login:list
```

### 4. Create env files (never commit these)

**.env.development** — testing Firebase
```
VITE_FIREBASE_API_KEY=AIzaSyBPPQizMEd5sPVAONpcDVDG5gu94vM6nOw
VITE_FIREBASE_AUTH_DOMAIN=boutiques-management.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=boutiques-management
VITE_FIREBASE_STORAGE_BUCKET=boutiques-management.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=253951289711
VITE_FIREBASE_APP_ID=1:253951289711:web:e4b8e9d6dc5280a352209a
VITE_FIREBASE_MEASUREMENT_ID=G-4DH4ZBZFEQ
```

**.env.production** — live Firebase
```
VITE_FIREBASE_API_KEY=AIzaSyBpS8XATHDzas2kQdxF4zDeHSw0FKdZ7cA
VITE_FIREBASE_AUTH_DOMAIN=boutiqo-sales.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=boutiqo-sales
VITE_FIREBASE_STORAGE_BUCKET=boutiqo-sales.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=13203812064
VITE_FIREBASE_APP_ID=1:13203812064:web:2f635adb4eb3c101f26a85
```

---

## Daily Development

```bash
npm run dev
```
Automatically connects to `boutiques-management` (testing Firebase). No extra steps needed.

---

## Deploy to Production

```bash
# 1. Switch to production Google account
firebase login:use <production-email@gmail.com>

# 2. Switch to production Firebase project
firebase use production

# 3. Build the app (picks up .env.production automatically)
npm run build

# 4. Deploy everything
firebase deploy
```

Or deploy in parts:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
firebase deploy --only hosting
```

---

## Deploy to Staging / Testing

```bash
# 1. Switch to testing Google account
firebase login:use <testing-email@gmail.com>

# 2. Switch to staging Firebase project
firebase use staging

# 3. Build with staging mode
npm run build:staging

# 4. Deploy
firebase deploy
```

---

## First Time — New Firebase Project Bootstrap

When setting up a brand new Firebase project from scratch:

### Enable services (Firebase Console → browser)
1. Firestore → Create database
2. Storage → Get started
3. Authentication → Get started → Enable **Email/Password**

### Create the first superAdmin
1. Firebase Console → Authentication → Users → **Add user**
   - Email: your admin email
   - Password: strong password
   - Copy the **UID**

2. Firebase Console → Firestore → **Start collection**
   - Collection ID: `superAdmins`
   - Document ID: `<paste UID>`
   - Fields:
     ```
     name      (string)    → Your Name
     email     (string)    → your-email
     createdAt (timestamp) → now
     ```

3. Log in to the app — you'll land on `/admin`

### Deploy rules to the new project
```bash
firebase use <project-alias>
firebase deploy --only firestore:rules,firestore:indexes,storage
```

---

## Project Structure for Environments

```
.env.development   → testing Firebase (used by npm run dev)
.env.production    → live Firebase   (used by npm run build)
.firebaserc        → project aliases (staging / production)
```

Both `.env` files are in `.gitignore` — never commit them.

---

## Quick Reference

| What | Command |
|---|---|
| Run locally | `npm run dev` |
| Build for prod | `npm run build` |
| Build for staging | `npm run build:staging` |
| Deploy all to prod | `firebase use production && firebase deploy` |
| Deploy rules only | `firebase deploy --only firestore:rules,storage` |
| Check active project | `firebase use` |
| Check active account | `firebase login:list` |
| Switch account | `firebase login:use <email>` |
