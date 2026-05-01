# ⚡ Quick Render.com Setup - Do This Now!

## 🚨 Fix These 3 Things First

### 1️⃣ DELETE the .env Secret File
- Find `.env` in "Secret Files" section
- Click trash icon 🗑️
- Confirm delete

---

### 2️⃣ ADD Environment Variables (One by One)

Click **"Add Environment Variable"** 8 times:

| # | Name | Value | Secret? |
|---|------|-------|---------|
| 1 | `PORT` | `3000` | No |
| 2 | `NODE_ENV` | `production` | No |
| 3 | `MONGODB_URI` | `mongodb+srv://elsapoguapo47_db_user:stqqJgQJrxzyvqdW@cluster0.pz2quoo.mongodb.net/jamiilink?retryWrites=true&w=majority` | **YES** 🔒 |
| 4 | `JWT_SECRET` | `jamii-link-ke-production-secret-key-2026-xyz-abc-123-def-456` | **YES** 🔒 |
| 5 | `JWT_EXPIRES_IN` | `7d` | No |
| 6 | `CORS_ORIGIN` | `http://localhost:5173` | No |
| 7 | `LOG_LEVEL` | `info` | No |
| 8 | `FRONTEND_URL` | `http://localhost:5173` | No |

**Important:** 
- Click the 🔒 lock icon for MONGODB_URI and JWT_SECRET
- Make sure NODE_ENV is `production` NOT `development`

---

### 3️⃣ FIX Health Check Path

Change from: `/healthz`  
To: `/api/health`

---

## ✅ Then Click "Deploy Web Service"

---

## 🧪 After Deployment - Test It

Your URL will be something like:
```
https://jamii-link-api.onrender.com
```

Test these URLs in your browser:

### Test 1: Health Check
```
https://jamii-link-api.onrender.com/api/health
```

Should show:
```json
{
  "status": "ok",
  "timestamp": "2026-05-01T...",
  "uptime": 123.45,
  "database": "connected"
}
```

### Test 2: Posts API
```
https://jamii-link-api.onrender.com/api/posts
```

Should show:
```json
{
  "posts": []
}
```
(or posts if you have data)

---

## ❓ If It Doesn't Work

### Check Logs:
1. Go to your Render service
2. Click **"Logs"** tab
3. Look for errors

### Common Errors:

**"MongoDB connection error"**
- Check MONGODB_URI is correct
- Check MongoDB Atlas network access allows 0.0.0.0/0

**"Missing required variable"**
- Make sure all 8 variables are added
- Check for typos in variable names

**"Port already in use"**
- Shouldn't happen on Render
- Try redeploying

---

## 📱 What You Should See

✅ Green status indicator  
✅ "Live" badge  
✅ Last deploy: "Success"  
✅ Health check: Passing  

---

## 🎯 That's It!

Once backend is working, move to frontend deployment on Vercel!

Next guide: [DEPLOYMENT.md](DEPLOYMENT.md)

Built with ❤️ for Kenyan Communities
