# 🚀 Deploy JamiiLink Backend to Railway.app (No Card Required!)

## Why Railway?
- ✅ **No credit card required** initially
- ✅ **$5 free credit** monthly (enough for your project)
- ✅ Easy deployment from GitHub
- ✅ Automatic environment variable setup
- ✅ Similar to Render but more beginner-friendly

---

## Step-by-Step Deployment

### Step 1: Sign Up for Railway

1. Go to: **https://railway.app**
2. Click **"Login"** or **"Start a New Project"**
3. Choose **"Login with GitHub"** (recommended)
4. Authorize Railway to access your repositories

**No credit card needed!** 🎉

---

### Step 2: Create New Project

1. Click **"New Project"**
2. Choose **"Deploy from GitHub repo"**
3. Select your repository: `iyf-s10-week-12-Kimiti4`
4. Railway will scan your repo

---

### Step 3: Configure Backend Service

Railway will detect your backend automatically. If not:

1. Click **"+ New"** → **"GitHub Repo"**
2. Select: `iyf-s10-week-12-Kimiti4`
3. Choose the branch: `main`

**Root Directory:** 
```
iyf-s10-week-11-Kimiti4
```
(This tells Railway where your backend code is)

---

### Step 4: Add Environment Variables

Click on your service → **"Variables"** tab → **"Add Variable"**

Add these variables one by one:

#### Variable 1: PORT
```
PORT = 3000
```

#### Variable 2: NODE_ENV
```
NODE_ENV = production
```

#### Variable 3: MONGODB_URI
```
MONGODB_URI = mongodb+srv://elsapoguapo47_db_user:stqqJgQJrxzyvqdW@cluster0.pz2quoo.mongodb.net/jamiilink?retryWrites=true&w=majority
```
⚠️ **Mark as Secret:** Click the eye icon to hide it

#### Variable 4: JWT_SECRET
```
JWT_SECRET = jamii-link-ke-production-secret-key-2026-xyz-abc-123-def-456
```
⚠️ **Mark as Secret:** Click the eye icon

#### Variable 5: JWT_EXPIRES_IN
```
JWT_EXPIRES_IN = 7d
```

#### Variable 6: CORS_ORIGIN
```
CORS_ORIGIN = http://localhost:5173
```
(Update this after deploying frontend)

#### Variable 7: LOG_LEVEL
```
LOG_LEVEL = info
```

---

### Step 5: Configure Build & Start Commands

Railway auto-detects these, but verify:

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

If Railway doesn't detect them:
1. Go to **"Settings"** tab
2. Scroll to **"Build & Deploy"**
3. Set custom commands above

---

### Step 6: Deploy!

1. Click **"Deploy"** button
2. Wait 2-5 minutes for build
3. Watch the logs for success messages

**Expected Logs:**
```
✅ MongoDB Connected: cluster0.pz2quoo.mongodb.net
🚀 Server running on port 3000
Environment: production
```

---

## ✅ After Deployment

### Get Your Railway URL

1. Go to your service dashboard
2. Click **"Settings"** tab
3. Find **"Domains"** section
4. Copy your URL (looks like):
   ```
   https://your-project-name.railway.app
   ```

Or click **"Generate Domain"** if none exists.

---

### Test Your API

#### Test 1: Health Check
```
https://your-project-name.railway.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-01T...",
  "uptime": 123.45,
  "database": "connected"
}
```

#### Test 2: Posts API
```
https://your-project-name.railway.app/api/posts
```

**Expected Response:**
```json
{
  "posts": []
}
```

---

## 🔧 Troubleshooting

### Problem: Build Fails
**Check:**
- Root directory is correct (`iyf-s10-week-11-Kimiti4`)
- package.json exists in that folder
- All dependencies listed in package.json

**Fix:**
1. Check **"Deployments"** tab for error logs
2. Verify root directory in Settings
3. Redeploy

### Problem: MongoDB Connection Error
**Check:**
- MONGODB_URI is correct (no typos)
- MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Database user has correct permissions

**Fix:**
1. Double-check MONGODB_URI variable
2. Update MongoDB Atlas network access
3. Redeploy

### Problem: Port Already in Use
**Solution:**
Railway sets PORT automatically. Remove the PORT variable or set it to the value Railway provides.

---

## 💰 Railway Free Tier Details

**What You Get:**
- $5 credit per month (resets monthly)
- Enough for small projects like yours
- No credit card required initially

**When You Need a Card:**
- After using $5 credit
- For higher usage limits
- For multiple services

**Your Project Cost:**
- Estimated: $0-2/month (well within free tier)
- Won't need a card for weeks!

---

## 🌐 Update Frontend CORS

After deploying frontend to Vercel:

1. Go to Railway dashboard
2. Open your backend service
3. Go to **"Variables"** tab
4. Update CORS_ORIGIN:
   ```
   CORS_ORIGIN = https://your-app.vercel.app
   ```
5. Railway auto-redeploys

---

## 📊 Railway vs Render Comparison

| Feature | Railway | Render |
|---------|---------|--------|
| Card Required | ❌ No (initially) | ✅ Yes |
| Free Credit | $5/month | 750 hours |
| Ease of Use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Auto-Deploy | ✅ Yes | ✅ Yes |
| Good for Week 12 | ✅ Perfect | ✅ Perfect |

---

## 🎯 Quick Summary

**Steps:**
1. ✅ Sign up at railway.app (GitHub login)
2. ✅ Create new project from GitHub repo
3. ✅ Set root directory: `iyf-s10-week-11-Kimiti4`
4. ✅ Add 7 environment variables
5. ✅ Click Deploy
6. ✅ Test: `https://your-app.railway.app/api/health`

**Total Time:** 10-15 minutes  
**Cost:** $0 (free tier)  
**Card Required:** NO! 🎉

---

## 🚀 Next: Deploy Frontend to Vercel

Once backend is working on Railway:

1. Go to: https://vercel.com
2. Sign up with GitHub
3. Import your repo
4. Set root directory: `iyf-s10-week-09-Kimiti4`
5. Add environment variable:
   ```
   VITE_API_URL = https://your-app.railway.app/api
   ```
6. Deploy!

**Vercel also requires NO credit card!** ✅

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check deployment logs for errors

---

**You're all set! Railway is the perfect alternative to Render for your Week 12 project.** 🎊

Built with ❤️ for Kenyan Communities
