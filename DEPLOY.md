# 🛍️ Pushpa Paridhan — Deployment Guide

## Architecture
- **Frontend**: Vercel (static React app)
- **Backend**: Render (Node.js + SQLite)

## Step 1: Push to GitHub

```bash
cd pushpaParidhan
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/pushpa-paridhan.git
git push -u origin main
```

## Step 2: Deploy Backend on Render (FREE)

1. Go to [render.com](https://render.com) and sign up
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Name**: `pushpa-paridhan-api`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Click **Create Web Service**
6. Wait for deploy, then copy the URL (e.g., `https://pushpa-paridhan-api.onrender.com`)

## Step 3: Deploy Frontend on Vercel (FREE)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://pushpa-paridhan-api.onrender.com` (your Render URL)
6. Click **Deploy**

## Step 4: Update Backend CORS

After deployment, update the backend environment variable:
- **Key**: `FRONTEND_URL`
- **Value**: `https://your-project.vercel.app`

## Step 5: Set Razorpay (Optional)

Add these env vars in Render:
- `RAZORPAY_KEY_ID` = your key
- `RAZORPAY_KEY_SECRET` = your secret

## Default Admin Login
- URL: `https://your-project.vercel.app/admin/login`
- Username: `admin`
- Password: `admin123`

## Local Development
```bash
cd backend && npm start    # Port 5001
cd frontend && npm run dev # Port 3000
```
