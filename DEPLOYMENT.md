# Deployment Guide — AI Study Companion

This document provides step-by-step instructions for deploying the **AI Study Companion** to production cloud platforms.

---

## 🚀 Option 1: 1-Click Unified Full-Stack Deployment (Recommended)

You can host both the **Frontend React UI** and the **Express Backend API** together on a single service with zero CORS issues on **Render**, **Railway**, or **Fly.io**.

### Steps for Render.com (Free Tier):
1. **Push your code to GitHub** (create a new repository, e.g. `ai-study-companion`).
2. Log in to [Render.com](https://render.com) and click **"New +" ➔ "Web Service"**.
3. Select your GitHub repository.
4. Configure the service settings:
   - **Name**: `ai-study-companion`
   - **Language / Runtime**: `Node`
   - **Branch**: `main` (or `master`)
   - **Root Directory**: *(Leave empty)*
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables (under **"Environment"**):
   - `PORT`: `4000` (Render will also automatically assign `PORT`)
   - `AI_PROVIDER`: `gemini`
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key - optional, falls back to neural engine if omitted)*
6. Click **"Deploy Web Service"**.
7. In ~2 minutes, your live URL will be active (e.g., `https://ai-study-companion.onrender.com`).

---

## ⚡ Option 2: Separated Deployment (Vercel Frontend + Render Backend)

### Step A: Deploy Backend API on Render
1. In Render, create a **Web Service** with:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
2. Once deployed, copy your backend URL (e.g., `https://ai-study-companion-api.onrender.com`).

### Step B: Deploy Frontend on Vercel
1. Log in to [Vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your GitHub repository.
3. In **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **"Deploy"**. Your frontend is live!

---

## 💻 Option 3: Local Production Testing

To verify the full production build locally before pushing to the cloud:

```bash
# 1. Install all dependencies and build the client bundle
npm run build

# 2. Start the unified production server
npm start
```

Open your browser to: **`http://localhost:4000`**  
Both the React single-page app and the API routes will be served seamlessly!
