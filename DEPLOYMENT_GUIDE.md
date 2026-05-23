# 🚀 AI Incident Analyzer - Hackathon Deployment Guide

Follow these steps to get your project live on the internet so you can show it to the judges!

## Step 1: Push Your Code to GitHub
Ensure all your files (including the CORS update we just made) are committed and pushed to a GitHub repository.

## Step 2: Deploy the Backend (Render)
We have configured your backend to be instantly deployable on Render.

1. Go to [Render](https://render.com/) and sign in with GitHub.
2. Click **New +** in the top right corner and select **Blueprint** (or **Web Service**).
3. Connect your GitHub account and select this repository.
4. Render will automatically detect the `render.yaml` file in your root directory and handle the setup (Python environment, installing dependencies, and running Uvicorn).
5. Click **Apply** or **Deploy**.
6. Wait a few minutes for the build to finish.
7. **Important:** Copy the live Render URL generated for your backend (e.g., `https://sre-ai-analyzer-backend-xxxx.onrender.com`).

*🔥 Pro-tip for the Judges:* Render's free tier spins down after 15 minutes of inactivity. To avoid a 50-second delay while presenting, ping the URL a minute before you show it to the judges!

## Step 3: Connect Frontend to Backend
Before deploying the frontend, it needs to know where the backend is hosted.

1. Open the file `frontend/.env.production` in your code editor.
2. Replace the placeholder URL with the live Render URL you copied in Step 2:
   ```env
   VITE_API_BASE=https://sre-ai-analyzer-backend-xxxx.onrender.com
   ```
3. Save the file, commit the change, and **push it to GitHub**.

## Step 4: Deploy the Frontend (Vercel)
Your frontend is fully configured for Vercel using the `vercel.json` file.

1. Go to [Vercel](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** and select **Project**.
3. Import your GitHub repository.
4. **Critical Step:** In the deployment settings, change the **Root Directory** by clicking "Edit" and selecting the `frontend` folder.
5. Vercel will automatically detect `Vite` as the framework.
6. Click **Deploy**.
7. Once deployed, click on the generated URL (e.g., `https://your-project-name.vercel.app`).

**🎉 You're Done!**
Your application is live. Because we updated the CORS settings in `main.py` to `allow_origins=["*"]`, your frontend will communicate with your backend instantly without any CORS errors. Good luck with the judges!
