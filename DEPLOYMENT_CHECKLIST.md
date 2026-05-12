# ✅ Render.com Deployment Checklist

## Pre-Deployment Preparation

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- [ ] Create M0 (Free) cluster
- [ ] Create database user with strong password
- [ ] Whitelist IP: `0.0.0.0/0` (allow all IPs)
- [ ] Copy connection string:
  ```
  mongodb+srv://username:password@cluster.mongodb.net/jamiilink
  ```

### 2. Generate JWT Secret
- [ ] Run in terminal:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Copy the generated secret (64+ characters)

### 3. Verify Code is Pushed
- [ ] All changes committed to GitHub
- [ ] Latest commit includes:
  - `render.yaml` configuration
  - Updated CORS in `src/app.js`
  - `.env.example` updated

---

## Render.com Deployment Steps

### Step 1: Sign Up/Login
- [ ] Go to [render.com](https://render.com)
- [ ] Sign up with GitHub account
- [ ] Authorize Render to access your repositories

### Step 2: Create Web Service
- [ ] Click **"New +"** → **"Web Service"**
- [ ] Select repository: `iyf-s10-week-12-Kimiti4`
- [ ] Configure service:

#### Basic Settings
- [ ] **Name**: `jamiilink-backend`
- [ ] **Region**: Oregon (closest to you)
- [ ] **Branch**: `main`
- [ ] **Root Directory**: `iyf-s10-week-11-Kimiti4`
- [ ] **Environment**: `Node`
- [ ] **Build Command**: `npm install`
- [ ] **Start Command**: `npm start`
- [ ] **Plan**: Free

### Step 3: Add Environment Variables

Click **"Advanced"** and add these variables:

| Key | Value | Sensitive? |
|-----|-------|------------|
| `NODE_ENV` | `production` | No |
| `PORT` | `3000` | No |
| `MONGODB_URI` | Your MongoDB connection string | **YES** ✓ |
| `JWT_SECRET` | Generated secret from Step 2 | **YES** ✓ |
| `JWT_EXPIRES_IN` | `7d` | No |
| `FRONTEND_URL` | `https://jamii-link-ke.vercel.app` | No |
| `LOG_LEVEL` | `info` | No |

**Important**: Mark `MONGODB_URI` and `JWT_SECRET` as **"Secret"** (Render will encrypt them)

### Step 4: Deploy
- [ ] Click **"Create Web Service"**
- [ ] Wait for build (~2-3 minutes)
- [ ] Monitor build logs for errors

---

## Post-Deployment Verification

### Check Service Status
- [ ] Service shows **"Live"** status (green)
- [ ] No errors in build logs
- [ ] Service URL displayed (e.g., `https://jamiilink-backend.onrender.com`)

### Test Health Endpoint
Open in browser:
```
https://YOUR-SERVICE-URL.onrender.com/api/health
```

Expected response:
```json
{
  "status": "✅ OK",
  "timestamp": "...",
  "uptime": 123.45,
  "memory": 45.67,
  "environment": "production",
  "categories": ["mtaani", "skill", "farm", "gig", "alert"]
}
```

- [ ] Returns 200 OK
- [ ] Shows `"environment": "production"`
- [ ] No error messages

### Test Organization API
Using curl or Postman:

```bash
# Test GET organizations (should return empty array or auth error)
curl https://YOUR-SERVICE-URL.onrender.com/api/organizations
```

- [ ] Endpoint responds (may return 401 if not authenticated - that's OK)
- [ ] No 500 server errors
- [ ] No CORS errors

---

## Frontend Configuration

### Update Vercel Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select project: `jamii-link-ke`
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://YOUR-SERVICE-URL.onrender.com/api`
   - **Environment**: Production, Preview, Development
5. Click **"Save"**

### Redeploy Frontend
- [ ] Go to **Deployments** tab in Vercel
- [ ] Click **"..."** on latest deployment
- [ ] Select **"Redeploy"**
- [ ] Wait for rebuild (~1 minute)

---

## Integration Testing

### Test Admin Dashboard

1. Visit: `https://jamii-link-ke.vercel.app/admin`
2. Login with your credentials
3. Try creating an organization

**Test Cases:**
- [ ] Can access admin dashboard
- [ ] Login works
- [ ] "Create Organization" button visible
- [ ] Can fill out organization form
- [ ] Submit creates organization successfully
- [ ] Organization appears in Overview tab
- [ ] Can edit organization settings
- [ ] Can view members (if any)
- [ ] No console errors (F12 → Console)
- [ ] No network errors (F12 → Network)

### Check Browser DevTools

Press F12 and check:

**Console Tab:**
- [ ] No red errors
- [ ] No CORS warnings

**Network Tab:**
- [ ] API calls go to `https://YOUR-SERVICE-URL.onrender.com/api/...`
- [ ] All requests return 200 or appropriate status codes
- [ ] No failed requests

---

## Troubleshooting Common Issues

### ❌ Build Failed

**Check:**
- [ ] Root directory is correct: `iyf-s10-week-11-Kimiti4`
- [ ] `package.json` exists in that directory
- [ ] All dependencies listed in `package.json`
- [ ] Build logs show specific error

**Fix:**
- Review Render build logs
- Fix the error locally
- Commit and push
- Trigger manual redeploy

### ❌ Service Crashes

**Check:**
- [ ] `MONGODB_URI` is correct
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] `JWT_SECRET` is set
- [ ] Service logs show error message

**Fix:**
- Check **Logs** tab in Render
- Fix environment variables
- Restart service

### ❌ CORS Errors

**Error Message:**
```
Access to fetch blocked by CORS policy
```

**Check:**
- [ ] `FRONTEND_URL` env var is set to `https://jamii-link-ke.vercel.app`
- [ ] CORS config in `src/app.js` includes Vercel URL
- [ ] Backend has been redeployed after CORS changes

**Fix:**
- Update environment variable
- Redeploy backend
- Clear browser cache

### ❌ 401 Unauthorized

**Check:**
- [ ] User is logged in
- [ ] Token exists in localStorage
- [ ] Authorization header format: `Bearer <token>`
- [ ] Token not expired

**Fix:**
- Logout and login again
- Check token in localStorage
- Verify JWT_SECRET matches

---

## Final Verification

### Complete Testing Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Can register new user
- [ ] Can login
- [ ] Can access `/admin` route
- [ ] Can create organization
- [ ] Can view organizations
- [ ] Can edit organization
- [ ] Can delete/archive organization
- [ ] Can view members
- [ ] Can change member roles
- [ ] No console errors
- [ ] No network errors
- [ ] Mobile responsive
- [ ] Fast load times (<2 seconds)

---

## Success! 🎉

If all checkboxes are checked, your deployment is complete!

### Your Live URLs:
- **Frontend**: https://jamii-link-ke.vercel.app
- **Backend API**: https://YOUR-SERVICE-URL.onrender.com
- **Admin Dashboard**: https://jamii-link-ke.vercel.app/admin
- **Health Check**: https://YOUR-SERVICE-URL.onrender.com/api/health

---

## Next Steps

### 1. Monitor Service
- Check Render dashboard daily for first week
- Watch for crashes or high memory usage
- Monitor response times

### 2. Set Up Alerts (Optional)
- Render email notifications for deployments
- MongoDB Atlas alerts for connection issues

### 3. Document Credentials
- Save MongoDB password securely
- Save JWT_SECRET securely
- Document all environment variables

### 4. Plan Updates
- Establish deployment workflow
- Test updates on staging first
- Schedule regular maintenance

---

## Support

If you encounter issues:

1. **Check Render Logs**: Most errors are visible there
2. **Review Documentation**: See `RENDER_DEPLOYMENT_GUIDE.md`
3. **Test Locally**: Ensure it works on localhost first
4. **Check Environment Variables**: Most common issue

---

**Ready to deploy? Start from Step 1 and work through the checklist!** ✅
