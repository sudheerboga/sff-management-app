# Sri Fashion Fusion v5.0 — Premium Edition 🪡

## What's new in v5
- ✂️ **Your logo** integrated everywhere — splash, login hero, header
- 🎨 **Exact brand theme** from your `theme.ts` — rose/violet/blue palette, Playfair Display + Jost fonts
- 📱 **iPhone-style UI** — frosted glass header, iOS tab bar, bottom sheet modals, spring animations, safe-area insets
- 📐 **Custom measurement fields** — add/remove unlimited custom fields per garment type
- 📄 **PDF export** — branded PDF with gradient header, per-garment tables, auto-table layout
- 📊 **Excel export** — multi-sheet workbook, one sheet per garment type
- 💬 **WhatsApp billing** — formatted bill matching your April sheet style
- 🔐 **Firebase Phone OTP auth** — session persisted, UID-scoped Firestore data
- ☁️ **UID-scoped cloud storage** — `users/{uid}/orders` and `users/{uid}/measurements`
- 📊 **Analytics** — monthly revenue/profit bars, balance trend line, top customers, status pie

## Quick Start

```bash
unzip sri-fashion-fusion-v5.zip
cd sri-fashion-fusion-v5

npm install
npm start
# → http://localhost:3000
```

## Firebase Setup (Required)

1. **Firestore** → Firebase Console → Build → Firestore Database → Create → Test mode → `asia-south1`
2. **Phone Auth** → Authentication → Sign-in method → Phone → Enable
3. **Config** → Project Settings → Your Apps → Web → copy config
4. Paste into `src/firebase/config.js` replacing the 6 `REPLACE_WITH_...` values

## Data Structure

```
Firestore
└── users/
    └── {uid}/                        ← isolated per user
        ├── (profile document)
        ├── orders/
        │   └── {orderId}             ← name, date, items, total, profit, balance, status …
        └── measurements/
            └── data                  ← { "Srija": { blouse:{bust:36,…}, frock:{}, … } }
```

## Project Structure

```
src/
├── App.jsx                            ← Auth gate → MainApp
├── firebase/
│   ├── config.js                      ← ⚠️ Paste Firebase credentials here
│   ├── authService.js                 ← Phone OTP (send, verify, logout)
│   └── userService.js                 ← All Firestore ops, UID-scoped
├── hooks/
│   ├── useAuth.js                     ← Firebase auth state listener
│   └── useUserData.js                 ← Subscribes to orders + measurements by UID
├── styles/
│   └── theme.js                       ← Brand tokens (from theme.ts): colors, gradients, radii, shadows
├── data/
│   └── garments.js                    ← Garment field definitions (blouse, frock, lehenga, top)
├── utils/
│   ├── whatsapp.js                    ← Bill generator + WhatsApp share URL
│   └── exportMeasurements.js          ← PDF (jsPDF + autoTable) + Excel (xlsx) export
└── components/
    ├── Auth/        → SplashScreen (animated logo), LoginScreen (iOS OTP)
    ├── Layout/      → AppHeader (frosted glass + logo), BottomNav (iOS tab bar)
    ├── Orders/      → OrdersTab, OrderCard (with 💬 Bill), OrderModal, StatsBar
    ├── AddOrder/    → AddOrderTab
    ├── Charts/      → ChartsTab (bar, line, pie, top customers)
    ├── Measurements/→ MeasurementsTab, MeasurementForm (custom fields + PDF/Excel)
    ├── WhatsApp/    → WhatsAppBillModal (preview + phone + copy)
    └── shared/      → Logo, Avatar, StatusBadge, PrimaryButton, GhostButton,
                        FocusInput, SelectInput, SearchBar, FilterChip,
                        SegmentControl, StatCard, Toast, Spinner, EmptyState
```

## Measurement Export

### PDF
Each customer gets a branded PDF with:
- Gradient header bar (blue→violet→rose matching your logo)
- Per-garment section with colour-coded table headers
- Brand footer with generation timestamp

### Excel
Multi-sheet workbook:
- Sheet 1: "Measurements" — full summary all garments
- Sheet 2+: One sheet per garment type (Blouse, Frock, Lehenga, Top & Bottom)

## Custom Measurement Fields

In the Measurements tab → tap any customer → tap any garment tab → scroll down → tap **"+ Add Custom Measurement"**:
- Enter field name (e.g. "Armhole", "Hip Curve", "Neck Depth")
- Field is saved alongside standard fields
- Exported to both PDF and Excel automatically
- Remove with the ✕ button on the field card

## Build & Deploy

```bash
npm run build
# Drag build/ folder to https://app.netlify.com/drop
# OR: firebase deploy (if firebase.json configured)
```



############

# Sri Fashion Fusion v4.0 🪡
### Luxury Tailoring Management App

---

## Tech Stack
- **React 18** — UI framework
- **Firebase Auth** — Phone OTP login
- **Firebase Firestore** — Cloud database (UID-scoped)
- **Recharts** — Charts & analytics
- **PWA** — Installable on Android & iOS

---

## Firebase Setup (Required)

### 1. Create Firestore Database
- Firebase Console → **Build → Firestore Database → Create database**
- Mode: **Start in test mode** → Region: **`asia-south1 (Mumbai)`** → Enable

### 2. Enable Phone Authentication
- Firebase Console → **Build → Authentication → Get started**
- Click **Phone** → Enable → Save

### 3. Get Web App Config
- Firebase Console → ⚙️ **Project Settings → Your Apps → `</>` Web**
- Register app name: `sri-fashion-fusion`
- Copy the config block

### 4. Paste Config
Open `src/firebase/config.js` and replace the placeholder values:
```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123...:web:abc...",
};
```

### 5. Add Authorized Domain
- Firebase Console → **Authentication → Settings → Authorized domains**
- `localhost` is already there. For production, add your domain.

---

## Run Locally
```bash
npm install
npm start
# Opens at http://localhost:3000
```

---

## Firestore Data Structure (UID-scoped)

```
Firestore
└── users/
    └── {uid}/                        ← Each logged-in user's isolated space
        ├── (profile document)        ← Phone, createdAt
        ├── orders/
        │   ├── {orderId}             ← name, date, ddate, items, total,
        │   │                            material, given, balance, profit, status
        │   └── ...
        └── measurements/
            └── data                  ← { "Srija": { blouse: {...}, frock: {...} } }
```

---

## Auth Flow
```
App opens
  └── Firebase checks persisted session
       ├── Session found → Skip login → Fetch data by UID → Show App
       └── No session   → Login Screen
                              ↓
                         Enter +91 number
                              ↓
                         Firebase sends SMS OTP
                              ↓
                         Enter 6-digit OTP (auto-advance)
                              ↓
                         ✅ UID returned → Fetch user data → Show App
```

---

## Install on Phone (PWA) — No App Store Needed!

### Android (Chrome)
1. Open `https://your-deployed-url.com` in Chrome
2. Tap the **⋮** menu (top right)
3. Tap **"Add to Home screen"**
4. Tap **"Install"** → App icon appears on home screen
5. Opens fullscreen like a native app ✅

### iPhone (Safari)
1. Open `https://your-deployed-url.com` in Safari
2. Tap the **Share** button (rectangle with arrow)
3. Scroll down → tap **"Add to Home Screen"**
4. Tap **"Add"** → App icon appears on home screen
5. Opens fullscreen like a native app ✅

---

## Deploy (Free Options)

### Option A — Netlify (Recommended, easiest)
```bash
npm run build
# Drag the `build/` folder to https://app.netlify.com/drop
# You get a free HTTPS URL instantly
```

### Option B — Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting       # select your project, set public dir to "build"
npm run build
firebase deploy
# Your app is live at https://your-project.web.app
```

---

## ✅ Firebase Deployment Complete!

Your app is now live on Firebase!

**Hosting URL:** https://sri-fashion-fusion.web.app

**Project Console:** https://console.firebase.google.com/project/sri-fashion-fusion/overview

### What was set up:
- ✅ Build created and optimized
- ✅ Firebase CLI installed
- ✅ `firebase.json` configured with:
  - Public directory: `build`
  - Single-page app rewrites enabled (all routes → `/index.html`)
- ✅ `.firebaserc` set with your Firebase project
- ✅ App deployed successfully

### For future deployments:
```bash
npm run build && firebase deploy
```

---

## Publish to App Stores (Native App)

To publish to **Google Play Store** or **Apple App Store**, you need to wrap the React app using **Capacitor** (recommended) or React Native.

### Using Capacitor (wrap existing React app)

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npx cap init "Sri Fashion Fusion" "com.srifashion.app"

npm run build
npx cap add android
npx cap add ios
npx cap sync
```

**Android (Play Store):**
```bash
npx cap open android
# Android Studio opens → Build → Generate Signed Bundle/APK
# Upload .aab file to Google Play Console
# One-time fee: $25 USD
```

**iOS (App Store):**
```bash
npx cap open ios
# Xcode opens → Product → Archive → Distribute App
# Requires Mac + Apple Developer account
# Annual fee: $99 USD/year
```

### Recommendation
For a **tailoring business app** used on personal phones:
- **PWA (Add to Home Screen)** is the fastest and free option — works great
- **Google Play Store** if you want to share it with others / have it searchable
- **Apple App Store** only if you need iOS users to download from the store

---

## Project Structure
```
src/
├── firebase/
│   ├── config.js           ← ⚠️ Paste Firebase credentials here
│   ├── authService.js      ← Phone OTP send/verify/logout
│   └── userService.js      ← All Firestore ops (UID-scoped)
├── hooks/
│   ├── useAuth.js          ← Auth state listener
│   └── useUserData.js      ← Loads orders + measurements by UID
├── styles/
│   └── theme.js            ← Design tokens (colors, fonts, radius, gradients)
├── data/
│   └── garments.js         ← Garment measurement field definitions
├── utils/
│   └── whatsapp.js         ← Bill generator + share URL
├── components/
│   ├── Auth/               → SplashScreen, LoginScreen
│   ├── Layout/             → AppHeader, BottomNav
│   ├── Orders/             → OrdersTab, OrderCard, OrderModal, StatsBar
│   ├── AddOrder/           → AddOrderTab
│   ├── Charts/             → ChartsTab
│   ├── Measurements/       → MeasurementsTab, MeasurementForm
│   ├── WhatsApp/           → WhatsAppBillModal
│   └── shared/             → Avatar, StatusBadge, Spinner, Toast, StatCard, FieldInput
└── App.jsx                 ← Auth gate → MainApp
```
