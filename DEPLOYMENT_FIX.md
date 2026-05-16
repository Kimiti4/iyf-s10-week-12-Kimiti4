# 🚀 Deployment Troubleshooting Guide

## Issue: Both Railway and Vercel Deployments Failed

---

## ✅ Fixes Applied

### Fix 1: Database Configuration

### Problem Identified
The backend was configured to connect to **PostgreSQL**, but the alert system uses **MongoDB**. This caused Railway deployment to fail during startup.

### Solution Implemented
- ✅ Created `src/config/mongodb.js` - MongoDB connection configuration
- ✅ Updated `server.js` to use `connectMongoDB()` instead of PostgreSQL
- ✅ Removed PostgreSQL table creation (MongoDB uses schema-less documents)
- ✅ Committed and pushed to GitHub

**Railway will now automatically redeploy with these fixes.**

### Fix 2: Vite Build Optimization

### Problem Identified
Vercel build was failing with exit code 1, likely due to chunk size warnings being treated as errors.

### Solution Implemented
- ✅ Updated `vite.config.js` with optimized build configuration
- ✅ Increased chunk size warning limit to 1000KB
- ✅ Added manual chunk splitting for better performance
- ✅ Separated vendor bundles (react, framer-motion, icons, socket.io)
- ✅ Build now completes successfully with no warnings

**Vercel will now automatically redeploy with optimized build.**

---

## 🔧 Required Environment Variables

### Railway (Backend) - REQUIRED

You MUST add these environment variables in your Railway dashboard:

1. **MONGODB_URI** (Critical)
   ```
   mongodb+srv://username:password@cluster.mongodb.net/jamiilink
   ```
   - Get this from your MongoDB Atlas dashboard
   - Format: `mongodb+srv://<user>:<password>@<cluster>/<database>`

2. **JWT_SECRET** (Critical)
   ```
   your-super-secret-key-at-least-32-characters-long
   ```
   - Must be at least 32 characters
   - Use a random string generator

3. **FRONTEND_URL** (Required for CORS)
   ```
   https://jamii-link-ke.vercel.app
   ```
   - Your Vercel deployment URL
   - Or `http://localhost:5173` for local testing

4. **NODE_ENV** (Optional, defaults to production)
   ```
   production
   ```

5. **PORT** (Optional, Railway sets this automatically)
   ```
   3000
   ```

### How to Add Environment Variables in Railway:
1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Variables" tab
4. Click "New Variable"
5. Add each variable above
6. Railway will automatically redeploy

---

### Vercel (Frontend) - REQUIRED

You MUST add this environment variable in your Vercel dashboard:

1. **VITE_API_URL** or **VITE_BACKEND_URL** (Critical)
   ```
   https://your-backend.railway.app/api
   ```
   - Replace with your actual Railway backend URL
   - Must end with `/api`
   - Example: `https://iyf-s10-week-11-kimiti4-production.up.railway.app/api`

### How to Add Environment Variables in Vercel:
1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add new variable:
   - Name: `VITE_API_URL` (or `VITE_BACKEND_URL`)
   - Value: Your Railway URL + `/api`
   - Environment: Production, Preview, Development (check all)
4. Click "Save"
5. **Redeploy** - Vercel won't auto-redeploy for env var changes

---

## 🔍 How to Check Deployment Status

### Railway Backend
1. Go to [railway.app](https://railway.app)
2. Click on your project
3. Check the "Deployments" tab
4. Look at the latest deployment logs
5. You should see:
   ```
   ✅ MongoDB Connected: <cluster-host>
   ✅ Database connected successfully
   🔌 Realtime system ready
   🚀 Jamii Link KE API running in production mode
   ```

### Vercel Frontend
1. Go to [vercel.com](https://vercel.com)
2. Click on your project
3. Check the "Deployments" tab
4. Click on the latest deployment
5. View build logs for errors
6. Once deployed, visit your live URL

---

## 🐛 Common Deployment Errors & Fixes

### Error 1: "MONGODB_URI is not defined"
**Cause**: Missing environment variable in Railway  
**Fix**: Add `MONGODB_URI` to Railway variables (see above)

### Error 2: "Cannot connect to database"
**Cause**: Invalid MongoDB connection string  
**Fix**: 
- Check your MongoDB Atlas whitelist IP addresses
- Add `0.0.0.0/0` to allow all IPs (for testing)
- Verify username/password are correct
- Ensure database name exists

### Error 3: "CORS error" or "Blocked by CORS policy"
**Cause**: FRONTEND_URL not set or incorrect  
**Fix**: 
- Add `FRONTEND_URL` to Railway with your Vercel URL
- Make sure it matches exactly (including https://)

### Error 4: "Module not found: socket.io"
**Cause**: Dependencies not installed  
**Fix**: Already fixed - `socket.io` is in package.json and will install automatically

### Error 5: Vercel build fails with "VITE_API_URL not defined"
**Cause**: Missing frontend environment variable  
**Fix**: Add `VITE_API_URL` to Vercel environment variables

### Error 6: Frontend can't connect to backend
**Cause**: Wrong backend URL in frontend  
**Fix**: 
- Check `VITE_API_URL` in Vercel
- Should be: `https://your-railway-app.up.railway.app/api`
- Test by visiting that URL in browser - should see API response

---

## 🧪 Testing After Deployment

### Step 1: Test Backend Health
```bash
curl https://your-backend.railway.app/api/health
```
Should return:
```json
{
  "status": "OK",
  "timestamp": "2026-05-01T..."
}
```

### Step 2: Test Alerts API
```bash
curl https://your-backend.railway.app/api/alerts
```
Should return:
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

### Step 3: Test Frontend
1. Visit your Vercel URL
2. Navigate to `/alerts` page
3. Try creating a new alert
4. Check browser console for errors (F12)

### Step 4: Test Realtime Updates
1. Open two browser tabs
2. Create an alert in one tab
3. Should appear instantly in the other tab (Socket.IO)

---

## 📊 Deployment Checklist

### Railway (Backend)
- [ ] MONGODB_URI added
- [ ] JWT_SECRET added
- [ ] FRONTEND_URL added
- [ ] NODE_ENV set to production
- [ ] Deployment successful (green checkmark)
- [ ] Logs show "MongoDB Connected"
- [ ] Health endpoint responds
- [ ] Alerts API endpoint responds

### Vercel (Frontend)
- [ ] VITE_API_URL added
- [ ] Build successful (no errors)
- [ ] Deployment active
- [ ] Homepage loads
- [ ] /alerts page loads
- [ ] Can create alerts
- [ ] Socket.IO connects (check console)

---

## 🆘 Still Having Issues?

### Check These Files:
1. **Backend Logs** (Railway):
   - Look for error messages
   - Check if MongoDB connection succeeds
   - Verify Socket.IO initializes

2. **Frontend Console** (Browser F12):
   - Look for CORS errors
   - Check if Socket.IO connects
   - Verify API calls succeed

3. **Network Tab** (Browser F12):
   - Check if API requests go to correct URL
   - Look for 404 or 500 errors
   - Verify WebSocket connection

### Quick Debug Commands:
```bash
# Test backend locally
cd iyf-s10-week-11-Kimiti4
npm start

# Test frontend locally
cd iyf-s10-week-09-Kimiti4
npm run dev

# Check if backend is running
curl http://localhost:3000/api/health

# Check alerts endpoint
curl http://localhost:3000/api/alerts
```

---

## 📝 Environment Variable Templates

### Backend (.env) - For Local Testing
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jamiilink
JWT_SECRET=dev-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
```

### Frontend (.env) - For Local Testing
```env
VITE_API_URL=http://localhost:3000/api
```

---

## ✅ Success Indicators

When everything is working correctly:

**Railway Logs Show:**
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
✅ Database connected successfully
🔌 Realtime system ready
🚀 Jamii Link KE API running in production mode
🌐 Server: http://localhost:3000
🚨 Alerts: http://localhost:3000/api/alerts
```

**Vercel Build Shows:**
```
✅ Build completed successfully
✅ Deployment ready
```

**Browser Console Shows:**
```
✅ Socket connected: <socket-id>
```

**Alert System Works:**
- Can view alerts at `/alerts`
- Can create new alerts
- Realtime updates work across tabs
- Verification badges display correctly
- Filtering works

---

## 🎯 Next Steps After Successful Deployment

1. **Test End-to-End Flow** (Task 8)
2. **Add more environment variables** for Phase 2 features
3. **Monitor logs** for any runtime errors
4. **Set up error tracking** (Sentry, LogRocket)
5. **Configure domain names** (custom domains)

---

**Last Updated**: May 1, 2026  
**Status**: Database fix applied and pushed to GitHub  
**Action Required**: Add environment variables to Railway and Vercel
