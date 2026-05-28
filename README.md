# Boutiqo

Multi-tenant SaaS platform for boutique management. A super admin controls the platform, creates boutiques, and manages subscriptions. Each boutique owner and their staff log in with phone OTP and get isolated access to their own data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | MUI v5 + Custom theme system (inline styles with `T` object) |
| State | Zustand + TanStack Query |
| Auth | Firebase Authentication (Phone OTP + Email/Password) |
| Database | Firebase Firestore |
| Storage | Firebase Storage + Cloudinary (optional, per boutique) |
| PWA | vite-plugin-pwa + Workbox |
| Charts | Recharts |
| Forms | React Hook Form + Zod |

---

## Features

### Super Admin
- Dashboard with all boutiques overview
- Create / manage boutiques (name, owner, address, GSTIN)
- Configure per-boutique subscription (plan, expiry, feature flags)
- Configure per-boutique Cloudinary image storage
- Soft-delete recovery panel (restore deleted orders/measurements)

### Boutique Admin
- All staff features below, plus:
- Staff management — invite staff by phone, activate/deactivate
- Boutique branding (primary/secondary/accent colours, logo)
- Subscription status view

### Staff
- **Orders** — create, edit, filter, search orders; track status (pending → in-progress → ready → delivered); add payment instalments; per-item image uploads; WhatsApp bill generation
- **Customers** — customer directory with multiple family members per account; phone-based lookup
- **Measurements** — per-customer, per-member measurement records; custom garment templates with unlimited fields
- **Reports** — monthly revenue table, bar/line charts, status donut, top customers

---

## User Roles

```
superAdmin       → manages the whole platform (admin panel at /admin)
admin            → manages one boutique (all features + staff)
staff            → day-to-day operations only (orders, customers, measurements)
```

---

## Firestore Data Structure

```
firestore
├── superAdmins/
│   └── {uid}                        ← created manually once (see setup below)
│       ├── name: string
│       └── createdAt: timestamp
│
├── boutiques/
│   └── {boutiqueId}
│       ├── name, ownerName, ownerPhone, ownerEmail, address, gstin
│       ├── status: "active" | "inactive" | "suspended"
│       ├── subscription: { plan, planName, expiresAt, features[], isActive, maxOrders, maxStaff }
│       ├── branding: { primaryColor, secondaryColor, accentColor, logoUrl }
│       ├── cloudinary: { cloudName, uploadPreset, folder }
│       ├── orders/{orderId}
│       ├── measurements/{measId}
│       ├── customers/{customerId}
│       ├── measurementTemplates/{templateId}
│       └── deletedRecords/{recordId}
│
├── boutiqueUsers/
│   └── {uid}                        ← auto-created on first login via invite
│       ├── boutiqueId, name, phone, role, isActive
│       └── createdAt
│
├── staffInvites/
│   └── {phone}                      ← created by superAdmin (owner invite) or boutique admin (staff invite)
│       ├── boutiqueId, name, role, invitedBy
│       └── createdAt
│
└── subscriptionPlans/
    └── {planId}                     ← optional, for plan catalogue
```

---

## Auth & Login Flow

```
User opens app
  └── Firebase checks persisted session
       ├── Session exists → resolveUserRole() → route to correct panel
       └── No session → Login screen
                          ↓
              Phone tab: enter +91 number → SMS OTP → verify
              Admin tab: email + password (superAdmin only)
                          ↓
              resolveUserRole() checks in this order:
                1. superAdmins/{uid}      → role: superAdmin → /admin
                2. boutiqueUsers/{uid}    → role: admin/staff → /dashboard
                3. staffInvites/{phone}   → first login: auto-creates boutiqueUsers/{uid} → /dashboard
                4. None found            → access denied (shown on login)
```

---

## Firebase Setup — Step by Step

### Step 1 — Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → enter project name → continue
3. Enable or disable Google Analytics (optional) → **Create project**

---

### Step 2 — Enable Authentication

1. Left sidebar → **Build → Authentication → Get started**
2. **Sign-in method** tab:
   - Enable **Phone** → Save (for boutique owners and staff)
   - Enable **Email/Password** → Save (for super admin login)
3. **Settings** tab → **Authorized domains** → add your production domain (e.g. `boutiques-management.web.app` is already there by default; add your custom domain if you have one)

---

### Step 3 — Create Firestore Database

1. Left sidebar → **Build → Firestore Database → Create database**
2. Choose **Start in production mode** (rules are deployed separately)
3. Region: **`asia-south1`** (Mumbai) → **Enable**

---

### Step 4 — Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # select your Firebase project
firebase deploy --only firestore:rules
```

Or paste the contents of `firestore.rules` manually in:
Firebase Console → Firestore → **Rules** tab → publish.

---

### Step 5 — Add Firebase Config to the App

1. Firebase Console → ⚙️ **Project Settings → Your Apps → Web (`</>`)**
2. Register app → copy the config object
3. Paste into `src/lib/firebase.ts`:

```ts
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123...:web:abc...",
};
```

---

### Step 6 — Create the First Super Admin (CRITICAL — do this manually)

There is no signup form for super admins. You create the document directly in Firestore:

1. Firebase Console → **Firestore → Start collection**
2. Collection ID: `superAdmins`
3. Document ID: **paste the UID of the user you want as super admin**

   > To get the UID: go to **Authentication → Users** → create a user with email/password there → copy the UID

4. Add these fields to the document:
   ```
   name        (string)   →  "Your Name"
   createdAt   (timestamp) → click "server timestamp" or just enter current time
   ```
5. Save

That's it. When this user logs in with email/password via the Admin Login tab, they land on `/admin`.

---

### Step 7 — Create Your First Boutique

Once you're logged in as superAdmin:

1. Go to **Admin → Boutiques → + New Boutique**
2. Fill in:
   - Boutique Name, Owner Name, **Owner Phone** (this is critical — must be exact +91XXXXXXXXXX format)
   - Email, Address, GSTIN (optional)
   - Cloudinary config (optional, for order image uploads)
3. Click **Create Boutique**

This automatically creates a `staffInvites/{ownerPhone}` document so the owner can log in.

---

### Step 8 — Boutique Owner First Login

The owner doesn't need to be created anywhere manually.

1. Owner opens the app
2. Enters their phone number (must match exactly what you used in Step 7)
3. Verifies OTP
4. On first login: the app reads `staffInvites/{phone}` → creates `boutiqueUsers/{uid}` automatically → owner lands on `/dashboard` with `role: admin`

From the dashboard, the boutique admin can:
- Add staff: **Staff page → Invite Staff** (enter staff name + phone)
- When staff member logs in for the first time, same invite flow happens

---

### Step 9 — Deploy the App

```bash
npm run build
firebase deploy --only hosting
```

Or set up Firebase Hosting first:

```bash
firebase init hosting
# Public directory: dist
# Single-page app: Yes
# Overwrite index.html: No

npm run build
firebase deploy
```

App will be live at: `https://your-project.web.app`

---

## Local Development

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Setup Order Summary (Quick Reference)

```
1. Create Firebase project
2. Enable Phone + Email/Password auth
3. Create Firestore (production mode, asia-south1)
4. Deploy firestore.rules
5. Paste Firebase config into src/lib/firebase.ts
6. In Firebase Auth → create super admin email/password user → copy UID
7. In Firestore → manually create superAdmins/{uid} document
8. Log in to app with email/password → you're in the admin panel
9. Create boutique with owner phone number
10. Owner logs in with phone OTP → auto-provisioned → done
11. Owner adds staff from Staff page → staff log in with phone OTP → done
```

---

## PWA — Install on Phone (No App Store)

### iPhone (Safari only — Chrome on iOS does not support PWA install)
1. Open app URL in **Safari**
2. Tap the **Share** button (box with arrow at the bottom)
3. Scroll down → **Add to Home Screen** → **Add**
4. App launches fullscreen, no browser bar

### Android (Chrome)
1. Open app URL in **Chrome**
2. Tap **⋮ menu → Add to Home screen → Install**
3. App icon appears on home screen, opens fullscreen

---

## Project Structure

```
src/
├── lib/
│   ├── firebase.ts              ← Firebase app init + exports (db, auth, storage)
│   └── collections.ts           ← Firestore collection name constants
│
├── services/
│   ├── auth.ts                  ← Phone OTP, email login, resolveUserRole(), listenAuthState()
│   ├── boutiques.ts             ← CRUD for boutiques + owner invite creation
│   ├── orders.ts                ← Orders CRUD, soft delete, payment instalment
│   ├── customers.ts             ← Customer + family member management
│   ├── measurements.ts          ← Measurement records CRUD
│   ├── measurementTemplates.ts  ← Custom garment template management
│   ├── staff.ts                 ← Staff invite + boutiqueUsers management
│   └── softDelete.ts            ← Soft delete + restore logic
│
├── features/
│   ├── auth/                    ← LoginPage, SplashPage
│   ├── orders/                  ← OrdersPage, OrderFormPage, OrderDetailDrawer,
│   │                               OrdersFilterSheet, WhatsAppBillModal
│   ├── customers/               ← CustomersPage
│   ├── measurements/            ← MeasurementsPage, MeasurementFormPage,
│   │                               MeasurementViewPage, MeasurementItemsPage
│   ├── reports/                 ← ReportsPage (charts + monthly table)
│   ├── staff/                   ← StaffPage
│   ├── subscription/            ← SubscriptionPage
│   └── admin/                   ← AdminLayout, AdminDashboard, BoutiquesPage,
│                                   DeletedRecordsPage, CreateBoutiqueModal
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx         ← Main shell with sidebar + bottom nav + outlet
│   │   ├── TopBar.tsx           ← Sticky top bar with safe-area padding
│   │   ├── BottomNav.tsx        ← iOS-style bottom tab bar with home indicator padding
│   │   └── Sidebar.tsx          ← Desktop sidebar nav
│   └── common/
│       ├── CustomerMemberPicker.tsx
│       ├── ConfirmDialog.tsx
│       ├── PageHeader.tsx
│       ├── StatusChip.tsx
│       ├── EmptyState.tsx
│       └── LoadingScreen.tsx
│
├── hooks/
│   ├── useAppTheme.ts           ← Returns T (theme object) + isDark; fetches boutique branding
│   └── useBoutiqueCloudinary.ts ← Cloudinary config for current boutique
│
├── theme/
│   ├── appTheme.ts              ← buildT() → AppTheme object used everywhere as inline styles
│   └── index.ts                 ← createAppTheme() → MUI ThemeProvider theme
│
├── stores/
│   ├── authStore.ts             ← Zustand: current user
│   └── uiStore.ts               ← Zustand: theme mode, sidebar state
│
├── types/
│   └── index.ts                 ← All TypeScript interfaces
│
└── App.tsx                      ← Providers (QueryClient, ThemeProvider, SnackbarProvider)
```

---

## Firestore Security Rules Summary

| Collection | superAdmin | boutique admin | staff | others |
|---|---|---|---|---|
| `superAdmins` | read/write | — | — | — |
| `boutiques/{id}` | full | read + update | read | — |
| `boutiques/{id}/orders` | full | full | full | — |
| `boutiques/{id}/customers` | full | full | full | — |
| `boutiques/{id}/measurements` | full | full | full | — |
| `boutiques/{id}/measurementTemplates` | full | full | read | — |
| `boutiques/{id}/deletedRecords` | full | full | write | — |
| `boutiqueUsers` | full | read/update own boutique | read self | — |
| `staffInvites` | full | create/update own boutique | — | self read |

---

## Common Issues

**"Access denied" after login**
→ Phone number in the invite doesn't match exactly. Must be `+91XXXXXXXXXX`.

**Boutique owner sees blank screen after OTP**
→ `staffInvites/{phone}` document wasn't created (boutique might not have been saved). Re-create the boutique or add the invite manually in Firestore.

**"text/html is not a valid JavaScript MIME type" on PWA**
→ Service worker is serving a stale cached index.html for a new JS chunk after a redeploy. The app auto-recovers by clearing the cache and reloading. If it happens frequently, run `npm run build && firebase deploy` to push the latest build.

**Phone OTP not sending**
→ Check Firebase Console → Authentication → Phone → make sure it's enabled. For local dev, add `localhost` to authorized domains.

**Images not uploading**
→ Cloudinary config must be set on the boutique (Admin panel → Boutiques → edit boutique → add Cloud Name, Upload Preset, Folder).
