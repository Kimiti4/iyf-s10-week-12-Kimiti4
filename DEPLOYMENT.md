# Deployment Guide - JamiiLink - Week 12

## Pre-Deployment Checklist

### Backend (Express API)
- [ ] All API endpoints working correctly
- [ ] Health check endpoint returns proper status
- [ ] CORS configured for frontend domain
- [ ] Environment variables properly set
- [ ] MongoDB connection working
- [ ] Error handling implemented
- [ ] No sensitive data in code (use .env)

### Frontend (React)
- [ ] All pages rendering correctly
- [ ] API calls working with backend
- [ ] Authentication flow complete
- [ ] Protected routes working
- [ ] Responsive design tested
- [ ] No console errors
- [ ] Build succeeds without errors

## Deploy Backend to Render

### Step 1: Prepare Repository
Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for Week 12 deployment"
git push origin main
```

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 3: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Select **"Connect a repository"**
3. Choose your repository: `iyf-s10-week-12-Kimiti4`
4. Configure the service:
   - **Name:** `community-hub-api`
   - **Region:** Choose closest to Kenya (e.g., Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `iyf-s10-week-11-Kimiti4`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### Step 4: Add Environment Variables
In the Render dashboard, add these environment variables:
```
NODE_ENV=production
PORT=3000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
FRONTEND_URL=https://your-app.vercel.app
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment to complete (3-5 minutes)
3. Test your API:
   ```
   https://community-hub-api.onrender.com/api/health
   ```

### Step 6: Verify Deployment
Check these endpoints:
- Health: `https://your-app.onrender.com/api/health`
- Posts: `https://your-app.onrender.com/api/posts`
- Market: `https://your-app.onrender.com/api/market/prices`

## Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Install Vercel GitHub App

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your repository: `iyf-s10-week-12-Kimiti4`
3. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `iyf-s10-week-09-Kimiti4`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 3: Add Environment Variables
Add this environment variable:
```
VITE_API_URL=https://community-hub-api.onrender.com/api
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (1-2 minutes)
3. Your app will be live at: `https://your-app.vercel.app`

### Step 5: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Testing After Deployment

### 1. Test Health Endpoint
```bash
curl https://your-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-01T...",
  "uptime": 123.456,
  "database": "connected",
  "environment": "production"
}
```

### 2. Test Frontend
- Visit your Vercel URL
- Try registering a new user
- Create a post
- Test login/logout
- Check responsive design on mobile

### 3. Monitor Logs
- **Render:** Dashboard → Logs tab
- **Vercel:** Project → Deployments → View logs

## Troubleshooting

### Backend Issues

**Problem:** Database connection failed
- Check MONGODB_URI is correct
- Ensure IP whitelist includes 0.0.0.0/0 in MongoDB Atlas
- Verify network access settings

**Problem:** CORS errors
- Check FRONTEND_URL matches your Vercel domain exactly
- Verify CORS configuration in app.js

**Problem:** 503 Service Unavailable
- Render free tier spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading to paid plan for production

### Frontend Issues

**Problem:** API calls failing
- Check VITE_API_URL is correct
- Verify backend is deployed and running
- Check browser console for CORS errors

**Problem:** Build fails
- Check all imports are correct
- Ensure all dependencies are in package.json
- Run `npm run build` locally first to debug

**Problem:** Blank page after deployment
- Check browser console for errors
- Verify all environment variables are set
- Check Vercel build logs

## Performance Tips

1. **Enable Compression**
   Add to backend:
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Cache Static Assets**
   Add cache headers for better performance

3. **Optimize Images**
   Compress images before uploading

4. **Use CDN**
   Consider Cloudflare for additional caching

## Monitoring

### Uptime Monitoring
- Use [UptimeRobot](https://uptimerobot.com/) (free)
- Monitor your API health endpoint
- Get alerts when service is down

### Error Tracking
- Consider Sentry for error tracking
- Log important events
- Monitor database performance

## Next Steps After Deployment

1. **Share your live demo** with instructors
2. **Test thoroughly** on different devices
3. **Collect feedback** from users
4. **Iterate and improve** based on feedback
5. **Add more features** (image upload, notifications, etc.)
6. **Consider production upgrades**:
   - Paid Render plan for always-on service
   - Custom domain
   - SSL certificate (automatic on both platforms)
   - Database backups

## Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

---

Good luck with your deployment! 🚀
