# NeoHealth Deployment Guide 🚀

Follow these steps to deploy NeoHealth for free using **Neon** (Database), **Render** (Backend), and **Vercel** (Frontend).

## Prerequisites
- A GitHub account.
- Push your latest code to a GitHub repository.

---

## Step 1: Database Setup (Neon) 🗄️
1. Go to [Neon.tech](https://neon.tech) and Sign Up/Login.
2. Create a new project (e.g., `neohealth-db`).
3. Select **Postgres** as the database type.
4. Copy the **Connection String** provided on the dashboard.
   - It will look like: `postgres://user:password@ep-xyz.region.neon.tech/neondb?sslmode=require`
   - Keep this safe, you will need it for the Backend deployment.

---

## Step 2: Backend Deployment (Render) ⚙️
1. Go to [Render.com](https://render.com) and Sign Up/Login.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Name**: `neohealth-backend` (or any name you like)
   - **Root Directory**: `backend` (Important!)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app --bind 0.0.0.0:10000`
5. Scroll down to **Environment Variables** and add:
   - Key: `DATABASE_URL` | Value: *(Paste your Neon Connection String)*
   - Key: `SECRET_KEY` | Value: `your-secret-key-change-this`
   - Key: `JWT_SECRET_KEY` | Value: `your-jwt-secret-key-change-this`
   - Key: `PYTHON_VERSION` | Value: `3.11.5` (Optional, or leave default)
6. Click **Create Web Service**.
7. Wait for the deployment to finish. It might take a few minutes.
8. Once deployed, copy the **Service URL** from the top left (e.g., `https://neohealth-backend.onrender.com`).

---

## Step 3: Frontend Deployment (Vercel) 🌐
1. Go to [Vercel.com](https://vercel.com) and Sign Up/Login.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset**: select `Vite` (it should auto-detect).
   - **Root Directory**: Click `Edit` and select `frontend`.
5. Open **Environment Variables** section and add:
   - Key: `VITE_API_URL` | Value: *(Paste your Render Backend URL)*
     - **Important**: Make sure there is NO trailing slash `/` at the end (e.g., `https://neohealth-backend.onrender.com`).
6. Click **Deploy**.
7. Wait for the build to complete.
8. Your frontend is now live! Click the domain to view it.

---

## Step 4: Verification ✅
1. Open your Vercel frontend URL.
2. Try to **Register** a new user.
3. If successful, your minimal full-stack app is live!
