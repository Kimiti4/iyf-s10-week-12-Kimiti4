# 🚀 Deploy JamiiLink Backend to Render.com

## Quick Deployment Guide

This guide will help you deploy the JamiiLink backend API (with organization management) to Render.com.

---

## Prerequisites

✅ GitHub repository with backend code  
✅ MongoDB Atlas database (free tier works)  
✅ Render.com account (free tier available)  

---

## Step 1: Prepare Your Repository

### Ensure Code is Pushed
```bash
cd "c:\Users\user\New folder (4)\iyf-s10-week-12-Kimiti4"
git add .
git commit -m "Update CORS for production deployment"
git push origin main
```

### Verify render.yaml Exists
The file `iyf-s10-week-11-Kimiti4/render.yaml` should be in your repo root or backend directory.

---

## Step 2: Set Up MongoDB Atlas

If you don't have MongoDB Atlas yet:

1. **Go to** [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. **Sign up** for free tier
3. **Create a cluster** (M0 Sandbox - Free)
4. **Create database user**:
   - Username: `jamiilink_admin`
   - Password: Generate strong password (save it!)
5. **Whitelist IP**: Add `0.0.0.0/0` (allow from anywhere)
6. **Get connection string**:
   ```
   mongodb+srv://jamiilink_admin:<password>@cluster0.xxxxx.mongodb.net/jamiilink
   ```
   Replace `<password>` with your actual password

---

## Step 3: Deploy to Render.com

### Option A: Using render.yaml (Recommended)

1. **Go to** [render.com](https://render.com)
2. **Sign in** with GitHub
3. Click **"New +"** → **"Blueprint"**
4. **Connect repository**: Select `iyf-s10-week-12-Kimiti4`
5. **Select directory**: `iyf-s10-week-11-Kimiti4`
6. Render will auto-detect `render.yaml`
7. **Configure environment variables** (see Step 4)
8. Click **"Apply"**
9. Wait for deployment (~2-3 minutes)

### Option B: Manual Setup

1. **Go to** [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. **Connect repository**: `iyf-s10-week-12-Kimiti4`
4. **Configure service**:
   - **Name**: `jamiilink-backend`
   - **Root Directory**: `iyf-s10-week-11-Kimiti4`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Click **"Advanced"** → Add environment variables (Step 4)
6. Click **"Create Web Service"**

---

## Step 4: Configure Environment Variables

In Render dashboard, go to your service → **Environment** tab:

### Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Already set in render.yaml |
| `PORT` | `3000` | Already set |
| `MONGODB_URI` | `mongodb+srv://...` | From MongoDB Atlas |
| `JWT_SECRET` | Random 32+ chars | Use generator below |
| `JWT_EXPIRES_IN` | `7d` | Token expiration |
| `FRONTEND_URL` | `https://jamii-link-ke.vercel.app` | Your Vercel URL |
| `LOG_LEVEL` | `info` | Logging level |

### Generate JWT Secret

Use one of these methods:

**Method 1: Online Generator**
- Visit [randomkeygen.com](https://randomkeygen.com)
- Copy a "CodeIgniter Encryption Key"

**Method 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Example JWT_SECRET:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## Step 5: Verify Deployment

### Check Service Status

1. Go to Render dashboard
2. Click on your service
3. Check **Status**: Should show **"Live"**
4. Click **"Logs"** tab to see real-time logs

### Test Health Endpoint

Copy your service URL (e.g., `https://jamiilink-backend.onrender.com`)

Test in browser:
```
https://jamiilink-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "✅ OK",
  "timestamp": "2026-05-01T...",
  "uptime": 123.456,
  "memory": 45.67,
  "environment": "production",
  "categories": ["mtaani", "skill", "farm", "gig", "alert"]
}
```

### Test Organization Endpoints

Using curl or Postman:

```bash
# Get organizations (requires auth token)
curl https://jamiilink-backend.onrender.com/api/organizations

# Create organization (requires auth)
curl -X POST https://jamiilink-backend.onrender.com/api/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Org",
    "slug": "test-org",
    "type": "community",
    "description": "Testing deployment"
  }'
```

---

## Step 6: Update Frontend Configuration

### Update Vercel Environment Variables

1. **Go to** [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: `jamii-link-ke`
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   ```
   VITE_API_URL = https://jamiilink-backend.onrender.com/api
   ```
5. **Redeploy** frontend:
   - Go to **Deployments** tab
   - Click **"..."** → **"Redeploy"**

### Alternative: Update Local .env

For local testing with production backend:

Create `.env` in `iyf-s10-week-09-Kimiti4`:
```env
VITE_API_URL=https://jamiilink-backend.onrender.com/api
```

Then restart dev server:
```bash
npm run dev
```

---

## Step 7: Test Full Integration

### 1. Access Admin Dashboard

Visit: `https://jamii-link-ke.vercel.app/admin`

### 2. Login

Use existing credentials or register new account.

### 3. Create Organization

1. Click **"Create Organization"**
2. Fill in details
3. Submit

### 4. Verify in Database

Check MongoDB Atlas:
- Go to **Collections**
- Look for `organizations` collection
- Should see your new organization

### 5. Check Browser Console

Open DevTools (F12) → Network tab:
- Verify API calls go to `https://jamiilink-backend.onrender.com/api/...`
- No CORS errors
- All requests return 200 OK

---

## 🔍 Troubleshooting

### Issue: Build Failed

**Error**: `npm install failed`

**Solutions**:
1. Check `package.json` exists in correct directory
2. Verify all dependencies listed
3. Check Render logs for specific error
4. Try removing `node_modules` and `package-lock.json`, then recommit

### Issue: Service Crashes on Start

**Error**: `Cannot connect to database`

**Solutions**:
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
3. Test connection string locally first
4. Check Render logs for detailed error

### Issue: CORS Errors in Browser

**Error**: `Access to fetch blocked by CORS policy`

**Solutions**:
1. Verify `FRONTEND_URL` env var is set correctly
2. Check CORS configuration in `src/app.js` includes your Vercel URL
3. Redeploy backend after CORS changes
4. Clear browser cache and retry

### Issue: 401 Unauthorized

**Error**: `Invalid or expired token`

**Solutions**:
1. Logout and login again to get fresh token
2. Verify `JWT_SECRET` matches between deployments
3. Check token isn't expired (default 7 days)
4. Verify Authorization header format: `Bearer <token>`

### Issue: Health Check Fails

**Error**: Health check endpoint returns error

**Solutions**:
1. Check service logs in Render dashboard
2. Verify `/api/health` route exists
3. Check database connection
4. Restart service from Render dashboard

---

## 📊 Monitoring & Maintenance

### View Logs

1. Go to Render dashboard
2. Click your service
3. Click **"Logs"** tab
4. See real-time application logs

### Monitor Performance

Render free tier includes:
- CPU usage
- Memory usage
- Request count
- Response times

### Auto-Deploy

Render automatically deploys when you push to GitHub:
1. Make changes locally
2. Commit and push
3. Render builds and deploys (~2-3 min)
4. Check **Events** tab for deployment status

### Manual Redeploy

1. Go to service dashboard
2. Click **"Manual Deploy"**
3. Select branch (usually `main`)
4. Click **"Deploy"**

---

## 💰 Cost Breakdown

### Render Free Tier
- ✅ 750 hours/month (enough for 1 service always-on)
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ✅ 1 GB disk storage
- ✅ Automatic SSL
- ✅ Custom domains

### MongoDB Atlas Free Tier (M0)
- ✅ 512 MB storage
- ✅ Shared RAM/CPU
- ✅ Unlimited reads/writes
- ✅ Automatic backups

**Total Cost: $0/month** 🎉

---

## 🔐 Security Checklist

- ✅ MongoDB password is strong (12+ chars)
- ✅ JWT_SECRET is random and 32+ characters
- ✅ IP whitelist configured in MongoDB Atlas
- ✅ CORS restricts to known domains only
- ✅ Environment variables not committed to Git
- ✅ HTTPS enabled (automatic on Render)
- ✅ `.env` file in `.gitignore`

---

## 📝 Post-Deployment Tasks

### 1. Test All Features
- [ ] User registration/login
- [ ] Create organization
- [ ] View organizations
- [ ] Edit organization settings
- [ ] Manage members
- [ ] Change member roles
- [ ] Delete/archive organization

### 2. Performance Testing
- [ ] API response times < 500ms
- [ ] No timeout errors
- [ ] Images load quickly
- [ ] Mobile responsive

### 3. Error Handling
- [ ] Invalid tokens handled gracefully
- [ ] Database errors show user-friendly messages
- [ ] 404 pages work correctly
- [ ] Network errors caught

### 4. Documentation
- [ ] Update README with production URLs
- [ ] Document environment variables
- [ ] Create backup procedures
- [ ] Write incident response plan

---

## 🎯 Success Indicators

You'll know deployment is successful when:

✅ Health endpoint returns 200 OK  
✅ Can login from Vercel frontend  
✅ Can create organizations (data saves to MongoDB)  
✅ No CORS errors in browser console  
✅ Member management works  
✅ All CRUD operations functional  
✅ Service stays online (not sleeping)  
✅ Logs show no critical errors  

---

## 🔄 Continuous Deployment Workflow

### Making Updates

1. **Develop locally**:
   ```bash
   # Test changes
   npm run dev
   ```

2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

3. **Monitor deployment**:
   - Check Render **Events** tab
   - Watch build logs
   - Verify service goes live

4. **Test on production**:
   - Visit live URL
   - Test new features
   - Check for regressions

---

## 📞 Support Resources

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas Docs**: [mongodb.com/docs/atlas](https://mongodb.com/docs/atlas)
- **Express.js Docs**: [expressjs.com](https://expressjs.com)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

---

## 🎉 You're Done!

Once all steps are complete:

- **Frontend**: https://jamii-link-ke.vercel.app
- **Backend API**: https://jamiilink-backend.onrender.com
- **Admin Dashboard**: https://jamii-link-ke.vercel.app/admin

Your multi-tenant SaaS platform is now **live and production-ready**! 🚀
