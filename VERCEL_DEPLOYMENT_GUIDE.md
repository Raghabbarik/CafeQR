# Vercel Deployment Guide for The Roasted Bean Cafe (CafeQR)

This project is fully configured for seamless one-click deployment on **Vercel**.

---

## 🚀 How It Works on Vercel

1. **Frontend (SPA)**:
   - Vite builds React into `/dist`.
   - `vercel.json` provides rewrite rules so routes like `/`, `/admin`, `/staff`, and `/orderdisplay` load `/index.html` without 404 errors.

2. **Backend (Serverless API)**:
   - `api/index.js` exports the Express backend as a Vercel Serverless Function.
   - All `/api/*` endpoints (Cafe details, Menu, Orders, Staff Login, Display PIN, Razorpay verify) run serverlessly on Vercel.

3. **Database**:
   - Backed by **Supabase Cloud PostgreSQL** (`vtpryqwnccaeeuzxunvz.supabase.co`).
   - Works immediately from any cloud location without local database dependencies.

4. **Real-time Synchronization**:
   - Includes automatic HTTP polling fallback for Vercel Serverless environments where persistent WebSockets are not maintained.

---

## 🛠️ Step-by-Step Deployment Instructions

### Method 1: Deploy with Git & Vercel Dashboard (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Configure Vercel deployment and back to home button"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New"** > **"Project"**.
   - Select your repository and click **Import**.

3. **Configure Project Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Set Environment Variables in Vercel**:
   Under **Project Settings** > **Environment Variables**, add the following:

   | Variable Name | Description / Example |
   |---|---|
   | `SUPABASE_URL` | Your Supabase project URL (e.g. `https://vtpryqwnccaeeuzxunvz.supabase.co`) |
   | `SUPABASE_SECRET_KEY` | Your Supabase Secret / Service Role Key (from Supabase Dashboard > API) |
   | `SUPABASE_PUBLISHABLE_KEY` | Your Supabase Publishable Key |
   | `JWT_SECRET` | Secret key for JWT tokens (e.g. `cafeqr_jwt_super_secret_key_2026`) |
   | `ADMIN_EMAIL` | Admin login email (e.g. `cafemanue@gmail.com`) |
   | `ADMIN_PASSWORD` | Admin login password |
   | `RAZORPAY_KEY_ID` | Razorpay Key ID |
   | `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |

5. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend and deploy the serverless API.

---

### Method 2: Deploy directly from Terminal (Vercel CLI)

1. Open your terminal in `d:\cafeqr` and run:
   ```bash
   npx vercel
   ```
2. Follow the on-screen prompts:
   - Link to existing project? **No** (if first time)
   - Project name: `cafeqr`
   - Directory located? `./`
3. Deploy to production:
   ```bash
   npx vercel --prod
   ```

---

## 📱 Live URLs After Deployment

- **Customer Ordering Page**: `https://your-domain.vercel.app/`
- **Admin Dashboard**: `https://your-domain.vercel.app/admin`
  - *Email*: `cafemanue@gmail.com`
  - *Password*: `Cafemanue@2062`
- **Staff Portal**: `https://your-domain.vercel.app/staff`
- **TV Order Display Screen**: `https://your-domain.vercel.app/orderdisplay`
  - *PIN Code*: `8899`

