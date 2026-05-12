# 🚀 Deploy Admin Dashboard to Vercel - Quick Guide

## Current Status
✅ Frontend code ready with Admin Dashboard  
✅ Backend API built with organization endpoints  
⏳ Need to deploy both for full functionality  

---

## Step 1: Deploy/Verify Backend API

### Option A: Use Railway (Recommended)

1. **Go to [Railway.app](https://railway.app)**
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo: `iyf-s10-week-12-Kimiti4`
4. Select directory: `iyf-s10-week-11-Kimiti4`
5. Add environment variables:
   ```
   PORT=3000
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
6. Click "Deploy"
7. Copy the public URL (e.g., `https://jamiilink-backend.railway.app`)

### Option B: Use Render

1. **Go to [Render.com](https://render.com)**
2. Click "New Web Service"
3. Connect GitHub repo
4. Set root directory: `iyf-s10-week-11-Kimiti4`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables (same as above)
8. Deploy

---

## Step 2: Update Frontend API URL

### Local Development
Create `.env` file in `iyf-s10-week-09-Kimiti4`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Production (Before Deploying to Vercel)
Update `.env.production` or set in Vercel dashboard:
```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## Step 3: Deploy Frontend to Vercel

### Method 1: Automatic (GitHub Integration)

1. **Already deployed at**: [https://jamii-link-ke.vercel.app](https://jamii-link-ke.vercel.app)
2. Since you pushed to GitHub, Vercel should auto-deploy
3. Check deployment status at [vercel.com/dashboard](https://vercel.com/dashboard)
4. Wait 1-2 minutes for build to complete

### Method 2: Manual Deploy

```bash
cd iyf-s10-week-09-Kimiti4

# Install Vercel CLI if not installed
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## Step 4: Configure CORS on Backend

Your backend must allow requests from Vercel domain.

### In `iyf-s10-week-11-Kimiti4/src/app.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',           // Local dev
    'https://jamii-link-ke.vercel.app'  // Production
  ],
  credentials: true
}));
```

Then redeploy backend.

---

## Step 5: Test the Deployment

### 1. Visit Admin Dashboard
Go to: [https://jamii-link-ke.vercel.app/admin](https://jamii-link-ke.vercel.app/admin)

### 2. Login
- Use existing credentials or register new account
- Should redirect to `/admin` after login

### 3. Create First Organization
- Click "Create Organization"
- Fill in details
- Submit and verify it appears in Overview tab

### 4. Check Browser Console
- Open DevTools (F12)
- Go to Network tab
- Verify API calls are going to correct backend URL
- Check for CORS errors

---

## 🔍 Troubleshooting

### Issue: "Failed to fetch organizations"

**Possible Causes:**
1. Backend not deployed or not running
2. Wrong API URL in frontend
3. CORS not configured
4. Invalid/expired JWT token

**Solutions:**
```bash
# Check backend is running
curl https://your-backend.railway.app/api/health

# Verify API URL in browser console
console.log(import.meta.env.VITE_API_URL)

# Re-login to get fresh token
```

### Issue: CORS Error

**Error Message:**
```
Access to fetch at 'https://backend.com/api/...' 
from origin 'https://jamii-link-ke.vercel.app' 
has been blocked by CORS policy
```

**Solution:**
Add Vercel domain to backend CORS whitelist (see Step 4)

### Issue: Environment Variables Not Working

**Check:**
1. Variables set in Vercel dashboard?
2. Variable names start with `VITE_`?
3. Redeployed after adding variables?

**Fix:**
```bash
# In Vercel Dashboard:
# Settings → Environment Variables
# Add: VITE_API_URL = https://your-backend.railway.app/api
# Redeploy
```

---

## ✅ Pre-Deployment Checklist

### Frontend
- [ ] `.env` file configured with production API URL
- [ ] All imports working (no missing modules)
- [ ] Admin Dashboard route added to App.jsx
- [ ] ProtectedRoute wrapper applied
- [ ] CSS files properly imported
- [ ] No console errors in local testing

### Backend
- [ ] MongoDB connection string set
- [ ] JWT secret configured
- [ ] CORS whitelist includes Vercel domain
- [ ] All routes tested locally
- [ ] Organization endpoints working
- [ ] Health check endpoint accessible

### Vercel
- [ ] GitHub repo connected
- [ ] Auto-deployment enabled
- [ ] Environment variables set (if needed)
- [ ] Custom domain configured (optional)

### Railway/Render
- [ ] Backend deployed successfully
- [ ] Environment variables configured
- [ ] Database connected
- [ ] Public URL accessible
- [ ] Health check returns 200 OK

---

## 📊 Monitoring After Deployment

### Check Logs
- **Vercel**: Dashboard → Deployments → View logs
- **Railway**: Project → Deployments → View logs

### Monitor Errors
- Watch for failed API calls in browser console
- Check backend error logs
- Monitor database connections

### Performance
- Use Vercel Analytics (built-in)
- Check page load times
- Monitor API response times

---

## 🎯 Expected Behavior After Deployment

### User Flow:
1. User visits `https://jamii-link-ke.vercel.app`
2. Clicks "Admin" button (must be logged in)
3. If not logged in → redirects to `/login`
4. After login → goes to `/admin`
5. Sees empty state or their organizations
6. Can create/manage organizations
7. All data persists in MongoDB

### API Calls:
```
Frontend (Vercel)
    ↓
Backend (Railway)
    ↓
MongoDB Atlas
```

---

## 🔄 Continuous Deployment

### Workflow:
1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
4. Vercel auto-deploys frontend (~1-2 min)
5. Railway auto-deploys backend if backend changed (~2-3 min)
6. Test on live site

---

## 💡 Pro Tips

### 1. Use Preview Deployments
Vercel creates preview URLs for pull requests:
- Great for testing before merging to main
- Share with team for feedback

### 2. Set Up Alerts
- Railway: Email alerts for deployment failures
- Vercel: Slack integration for deployment notifications

### 3. Database Backups
- MongoDB Atlas has automatic backups
- Enable daily backups in Atlas dashboard

### 4. Domain Configuration
- Buy custom domain (e.g., `jamiilink.com`)
- Configure in Vercel: Settings → Domains
- Add SSL (automatic with Vercel)

### 5. Environment Management
Keep separate configs:
- `.env.local` - Local development
- `.env.production` - Production settings
- Vercel Dashboard - Override for production

---

## 📞 Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **MongoDB Atlas**: [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- **React Router**: [reactrouter.com](https://reactrouter.com)

---

## 🎉 Success Indicators

You'll know deployment is successful when:
- ✅ Can access admin dashboard at live URL
- ✅ Can login and see protected content
- ✅ Can create organizations (data saves to DB)
- ✅ Can view/edit/delete organizations
- ✅ Member management works
- ✅ No console errors
- ✅ Fast page loads (<2 seconds)
- ✅ Mobile responsive

---

**Ready to deploy? Start with Step 1 (Backend) → Step 2 (Config) → Step 3 (Frontend)!**
