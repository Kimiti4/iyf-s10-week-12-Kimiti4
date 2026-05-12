# 🔧 Fix: Module Loading Error on Railway

## Error Message
```
at Module._extensions..js (node:internal/modules/cjs/loader:1422:10)
```

## What This Means

This error typically indicates one of these issues:
1. ❌ Missing or incorrect environment variables
2. ❌ Database connection failure during startup
3. ❌ Syntax error in a required file
4. ❌ Missing dependencies

---

## ✅ Solution Steps

### Step 1: Check Railway Environment Variables

The most common cause is **missing environment variables**. Railway needs these to start your app.

#### Required Variables in Railway Dashboard:

Go to your Railway project → **Variables** tab and add:

| Variable | Value | Required? |
|----------|-------|-----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `MONGODB_URI` | Your MongoDB Atlas connection string | ✅ **CRITICAL** |
| `JWT_SECRET` | Random 64+ character string | ✅ **CRITICAL** |
| `JWT_EXPIRES_IN` | `7d` | ✅ Yes |
| `FRONTEND_URL` | `https://jamii-link-ke.vercel.app` | ✅ Yes |
| `PORT` | `3000` (or leave blank for Railway auto) | Optional |
| `LOG_LEVEL` | `info` | Optional |

**⚠️ IMPORTANT:** 
- Mark `MONGODB_URI` and `JWT_SECRET` as **secrets** (click the lock icon 🔒)
- Without `MONGODB_URI`, the app will crash on startup when trying to connect to the database

---

### Step 2: Verify MongoDB Atlas Connection String

Your `MONGODB_URI` should look like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jamiilink?retryWrites=true&w=majority
```

**Check:**
- [ ] Username is correct
- [ ] Password is correct (no special characters unescaped)
- [ ] Cluster URL is correct
- [ ] Database name is included (`/jamiilink`)
- [ ] IP whitelist includes `0.0.0.0/0` (allow all IPs)

**Test locally first:**
```bash
# Create .env file temporarily
echo "MONGODB_URI=your_connection_string" > .env

# Test connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(err => console.error('Error:', err))"
```

---

### Step 3: Check Railway Build Logs

1. Go to Railway Dashboard
2. Click your service
3. Go to **Deployments** tab
4. Click on the latest deployment
5. Check **Build Logs** and **Runtime Logs**

**Look for errors like:**
- `Missing required environment variable`
- `MongoServerError: Authentication failed`
- `Cannot find module`
- `SyntaxError`

---

### Step 4: Verify Root Directory

Make sure Railway is deploying from the correct directory:

**Railway Settings → General:**
- **Root Directory**: `iyf-s10-week-11-Kimiti4`

If this is wrong, Railway won't find `package.json` or `server.js`.

---

### Step 5: Check package.json

Verify these fields exist in `iyf-s10-week-11-Kimiti4/package.json`:

```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

Railway uses `"start"` script to run your app.

---

### Step 6: Redeploy After Adding Variables

After adding all environment variables:

1. Go to **Deployments** tab
2. Click **"Redeploy"** (or push a new commit)
3. Wait for build (~2-3 minutes)
4. Check logs for successful startup

**Successful startup logs should show:**
```
🚀 Jamii Link KE API running in production mode
🌐 Server: http://localhost:3000
📊 Health: http://localhost:3000/api/health
```

---

## 🔍 Debugging Checklist

Run through this checklist:

### Environment Variables
- [ ] `MONGODB_URI` is set in Railway
- [ ] `JWT_SECRET` is set (64+ characters)
- [ ] `NODE_ENV` is set to `production`
- [ ] `FRONTEND_URL` includes your Vercel domain
- [ ] Secrets are marked with lock icon 🔒

### MongoDB Atlas
- [ ] Cluster is running
- [ ] Database user created
- [ ] IP whitelist: `0.0.0.0/0`
- [ ] Connection string tested locally

### Railway Configuration
- [ ] Root directory: `iyf-s10-week-11-Kimiti4`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start` (or auto-detected)
- [ ] Node version >= 18

### Code Issues
- [ ] No syntax errors in files
- [ ] All dependencies in `package.json`
- [ ] `.env` file NOT committed to Git
- [ ] `node_modules` NOT committed to Git

---

## 🧪 Test Locally First

Before debugging on Railway, test locally:

```bash
cd iyf-s10-week-11-Kimiti4

# Create .env file
cat > .env << EOF
NODE_ENV=development
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=test-secret-key-for-local-testing-only
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
EOF

# Install dependencies
npm install

# Start server
npm start
```

**If it works locally**, the issue is with Railway's environment variables.  
**If it fails locally**, fix the error first, then deploy.

---

## 📋 Common Fixes

### Issue: "MongoServerError: Authentication failed"
**Fix:** Check MongoDB username/password in connection string

### Issue: "Missing required environment variable"
**Fix:** Add all required vars to Railway Variables tab

### Issue: "Cannot find module 'dotenv'"
**Fix:** Run `npm install` and ensure `dotenv` is in `package.json`

### Issue: "Port already in use"
**Fix:** Remove hardcoded PORT or let Railway auto-assign

### Issue: "SyntaxError: Unexpected token"
**Fix:** Check for syntax errors in recently modified files

---

## 🎯 Quick Fix (Most Likely Solution)

90% of the time, this error is caused by **missing MONGODB_URI**.

**Do this now:**

1. Go to Railway Dashboard
2. Click your service
3. Go to **Variables** tab
4. Add `MONGODB_URI` with your MongoDB Atlas connection string
5. Mark it as secret (🔒)
6. Redeploy

That should fix it! ✅

---

## 📞 Still Having Issues?

### Check These Resources:

1. **Railway Logs**: Most detailed error info
2. **Local Testing**: Reproduce error locally first
3. **MongoDB Atlas**: Verify cluster is running
4. **Package Dependencies**: Ensure all installed

### Get Help:

- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- MongoDB Docs: [mongodb.com/docs](https://mongodb.com/docs)
- Express.js Docs: [expressjs.com](https://expressjs.com)

---

## ✅ Success Indicators

You'll know it's fixed when:

- ✅ Railway logs show "Jamii Link KE API running in production mode"
- ✅ Health endpoint returns 200 OK
- ✅ No errors in runtime logs
- ✅ Service status shows "Live" (green)

---

**Start with Step 1 (add environment variables) - that fixes most cases!** 🚀
