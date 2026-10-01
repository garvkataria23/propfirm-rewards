# ⚡ PropFirm Rewards — Prop-Firm Affiliate Rewards Web Application

A complete, production-ready, modern **Prop-Firm Affiliate Rewards Web Application** built with the requested high-performance stack:

| Layer | Stack |
| :--- | :--- |
| **Frontend** | **Next.js 16 (App Router)** + TypeScript |
| **UI System** | **Tailwind CSS** + **shadcn/ui** design patterns, Lucide icons, Dark Fintech theme |
| **Backend** | **NestJS 10** + TypeScript REST API + Swagger/OpenAPI |
| **Database** | **PostgreSQL** (Neon / Supabase / Railway) via **Prisma ORM** (with zero-config SQLite for local dev) |
| **Authentication** | JWT Token Session handling with **bcrypt** password hashing & Role-Based Access Control |
| **File Storage** | **Cloudflare R2** (AWS S3-compatible) with automatic local disk storage fallback |
| **Email Delivery** | **Resend** transactional email API with HTML templates + dev logger |
| **Deployment** | Vercel (Frontend) + Railway / Render / Docker (Backend) + Neon / Supabase (PostgreSQL) |

---

## 📖 Business Model & Core Journey

The platform connects proprietary trading firms with retail traders through affiliate referral codes. Traders earn reward points upon verification of eligible challenge purchases and redeem those points for physical electronics and digital gift cards.

```
 BUY USING OUR CODE
         ↓
SUBMIT PURCHASE PROOF
         ↓
 ADMIN VERIFICATION (Anti-Fraud & Duplicate Prevention)
         ↓
   POINTS CREDITED (Atomic Points Ledger)
         ↓
   COLLECT POINTS
         ↓
   REDEEM REWARDS (Double-Spend Protection & Inventory Reservation)
         ↓
    TRACK REWARD (5-Step Courier Fulfillment Pipeline)
```

> **IMPORTANT DISCLAIMER:** The platform itself is **NOT a proprietary trading firm**, does not provide trading capital, and does not solicit financial investments. All prop firm activities operate subject to the relevant prop firm's affiliate terms.

---

## 🚀 Live Deployments & Services

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/garvkataria23/propfirm-rewards)

- **Production Frontend (Vercel):** [https://frontend-eta-beryl-ezh34u4upe.vercel.app](https://frontend-eta-beryl-ezh34u4upe.vercel.app)
- **1-Click Render Cloud Hosting:** [https://render.com/deploy?repo=https://github.com/garvkataria23/propfirm-rewards](https://render.com/deploy?repo=https://github.com/garvkataria23/propfirm-rewards)
- **GitHub Repository:** [https://github.com/garvkataria23/propfirm-rewards](https://github.com/garvkataria23/propfirm-rewards)
- **Local Frontend:** [http://localhost:3000](http://localhost:3000)
- **Local Backend API:** [http://localhost:4000](http://localhost:4000)
- **Swagger Documentation:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 🔑 Pre-Seeded Accounts

The database comes pre-seeded with realistic data (Prop firms, challenge tiers, rewards catalog, historical purchases, and active redemptions):

| Role | Email | Password | Initial State |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@propfirmrewards.com` | `Admin@123456` | Full administrative control, purchase verification, points adjustment |
| **Demo Trader** | `trader@example.com` | `Trader@123456` | Alex Morgan: **13,000 Points**, 3 verified purchases, 1 shipped redemption |
| **Demo Trader 2** | `sarah.chen@example.com` | `Trader@123456` | Sarah Chen: 1 submission with "More Info Required" |

---

## 🏗️ Architecture & Features

### 1. Public Website & Discovery
- **Hero Section:** "Trade. Earn. Get Rewarded." with real-time points metrics.
- **6-Step Interactive Journey:** Clear visual walkthrough of how purchases turn into rewards.
- **Interactive Rewards Calculator:** Real-time calculation of points earned based on selected prop firm and challenge tier.
- **Partner Catalog (`/prop-firms`):** Filter and search prop firms (FTMO, Funding Pips, Alpha Capital Group, FundedNext). 1-click affiliate code copy, direct affiliate links, and challenge tiers table.
- **Firm Details (`/prop-firms/[slug]`):** Detailed offer tiers, points yield breakdown, eligibility terms.
- **Rewards Marketplace (`/rewards`):** Flagship categories (Smartphones, Tablets, Trading Hardware, Audio, Gift Cards). In-stock filtering, points requirement, instant checkout modal.
- **How It Works (`/how-it-works`) & FAQ (`/faq`):** Detailed guide with best practices and legal disclosures.

### 2. User Authentication & Profile
- Sign up (`/register`), Login (`/login`) with instant 1-click demo fast-fill buttons.
- JWT-based authentication with expiration and role checking.
- Trader profile (`/dashboard/profile`) with multiple saved shipping addresses.

### 3. Purchase Submission & Anti-Fraud Verification
- **Submission Form (`/dashboard/purchases/new`):** Select firm, challenge tier, input Order ID, Account ID, purchase date, amount paid, email used, and drag-and-drop receipt/invoice files.
- **Anti-Fraud & Duplicate Prevention:** Server rejects duplicate Order IDs for the same firm if already approved or pending review.
- **Workflow Statuses:**
  - `PENDING`: Awaiting review
  - `UNDER_REVIEW`: Currently under inspection
  - `APPROVED`: Points credited automatically via atomic transaction
  - `REJECTED`: Shows mandatory rejection reason to user
  - `MORE_INFO_REQUIRED`: Prompts user with admin inquiry and provides an in-app resubmission form

### 4. Financial Points Ledger
- Every point change creates an immutable transaction in `PointsLedger`:
  - `PURCHASE_REWARD` (+points)
  - `REDEMPTION` (-points)
  - `ADMIN_CREDIT` (manual bonus with mandatory reason)
  - `ADMIN_DEDUCTION` (manual deduction with balance checks)
  - `REFUND_REVERSAL` (automatic refund if order is cancelled)
- Summary KPIs: Available Points, Total Points Earned, Total Points Redeemed, Pending Points.

### 5. Rewards Store & Double-Spend Protection
- Atomic ACID transaction during checkout:
  - Verifies account is active (not suspended)
  - Verifies reward is active and in-stock
  - Verifies user balance >= pointsRequired
  - Safely deducts points, decrements stock, records redemption with unique code `RDM-YYYY-XXXX`, and triggers celebratory confetti!
- **Courier Delivery Tracking (`/dashboard/redemptions`):** 5-step visual pipeline (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`) with carrier and tracking number.

### 6. Admin Control Portal (`/admin`)
- **Executive Dashboard:** Live KPIs, pending verification alerts, points liability, and recent activity.
- **Purchase Verification Queue (`/admin/purchases`):** Inspect proof images/PDFs, verify against affiliate records, approve with automated point calculations, reject with reason, or request more information.
- **Trader Management (`/admin/users`):** View user purchase history, suspend/activate accounts with mandatory justification, and execute manual points adjustments with required audit reasons.
- **Prop Firms & Offers Configurator (`/admin/prop-firms`):** Full CRUD for prop firms and challenge tier points without code changes.
- **Rewards Catalog Management (`/admin/rewards`):** Full CRUD for rewards, inventory stock levels, and unlimited stock toggles.
- **Redemptions Pipeline (`/admin/redemptions`):** Order fulfillment, courier assignment (FedEx/UPS/DHL), tracking numbers, and automated point refund/restock upon cancellation.
- **Audit Logs (`/admin/audit-logs`):** Immutable log of every admin action, affected entity, timestamp, and before/after values.
- **System Settings (`/admin/settings`):** Global parameters and support contact info.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Push database schema (SQLite for local dev or PostgreSQL)
npx prisma db push

# Seed demo data (Admin, Traders, Prop Firms, Rewards, Transactions)
npx prisma db seed

# Run unit & integration test suites
npm test

# Build & Start backend server
npm run build
npm run start:prod
# Backend runs on http://localhost:4000 (Swagger docs at /api/docs)
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Build Next.js App
npm run build

# Start production server
npm run start
# Frontend runs on http://localhost:3000
```

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
```ini
PORT=4000
NODE_ENV=development

# Database URL
# For local development with zero dependencies:
DATABASE_URL="file:./dev.db"

# For Neon / Supabase / Railway PostgreSQL:
# DATABASE_URL="postgresql://user:password@ep-sample-pool.us-east-2.aws.neon.tech/propfirm?sslmode=require"

JWT_SECRET="REDACTED_JWT_SECRET"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"

# Cloudflare R2 Storage (AWS S3-compatible)
CLOUDFLARE_R2_ACCOUNT_ID=""
CLOUDFLARE_R2_ACCESS_KEY_ID=""
CLOUDFLARE_R2_SECRET_ACCESS_KEY=""
CLOUDFLARE_R2_BUCKET_NAME="propfirm-proofs"
CLOUDFLARE_R2_PUBLIC_URL=""

# Resend Email Integration
RESEND_API_KEY=""
EMAIL_FROM="PropFirm Rewards <support@propfirmrewards.com>"

# Monitoring
SENTRY_DSN=""
```

### Frontend (`frontend/.env.local`)
```ini
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

## 🧪 Critical Business Logic Test Coverage

Unit and integration test suites cover all critical rules specified in Section 37:
- **Points calculation & offer tier resolution**
- **Anti-fraud duplicate purchase detection**
- **Atomic purchase approval & ledger write**
- **Duplicate approval prevention**
- **Purchase rejection with reason notification**
- **Redemption balance validation (insufficient points refusal)**
- **Reward out-of-stock handling**
- **Suspended user redemption prohibition**
- **Atomic point deduction & stock decrement**
- **Admin point adjustments with mandatory audit reason**
- **Negative balance constraint enforcement**

Run tests anytime:
```bash
cd backend
npm test
```

---

## 🚢 Production Deployment Guide

### Deploy Database to Neon / Supabase
1. Create a PostgreSQL database instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the connection string to `DATABASE_URL`.
3. In `backend/prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run `npx prisma db push` and `npx prisma db seed`.

### Deploy Backend to Railway / Render
1. Connect the `backend/` directory to Railway or Render.
2. Set Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `CLOUDFLARE_R2_*`, `RESEND_API_KEY`).
3. Build command: `npm install && npx prisma generate && npm run build`
4. Start command: `node dist/src/main.js`

### Deploy Frontend to Vercel
1. Import the `frontend/` directory into Vercel.
2. Set Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend-api.railway.app`.
3. Deploy!
