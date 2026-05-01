# Quick Start Guide

## Test Week 9 React Application

### 1. Install Dependencies
```bash
cd iyf-s10-week-09-Kimiti4
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will start at: `http://localhost:5173`

### 3. Navigate the App

**Available Pages:**
- **Home** (`/`) - Landing page with features
- **Posts** (`/posts`) - Browse community posts
- **Post Detail** (`/posts/:id`) - View individual post
- **About** (`/about`) - Learn about the project

### 4. Features to Test

✅ Navigation between pages  
✅ Responsive design (try mobile view)  
✅ Hover effects on cards  
✅ Loading states  
✅ Mock data display  

---

## Test Week 10-11 Backend API

### 1. Install Dependencies
```bash
cd iyf-s10-week-11-Kimiti4
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string (optional for testing)
```

### 3. Start Server
```bash
npm run dev
```

API available at: `http://localhost:3000/api`

### 4. Test Endpoints

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

**Get Posts:**
```bash
curl http://localhost:3000/api/posts
```

**Get Market Prices:**
```bash
curl http://localhost:3000/api/market/prices
```

---

## Week 12 Integration (To be completed)

After completing Week 12 tasks:

1. Update React API service to connect to backend
2. Add authentication flow
3. Deploy backend to Render
4. Deploy frontend to Vercel
5. Test live deployment

See DEPLOYMENT.md for detailed instructions.

---

## Troubleshooting

### Week 9 Issues

**Problem:** Port 5173 already in use  
**Solution:** Kill the process or change port in vite.config.js

**Problem:** Module not found errors  
**Solution:** Run `npm install` again

**Problem:** Blank page  
**Solution:** Check browser console for errors

### Week 10-11 Issues

**Problem:** Port 3000 already in use  
**Solution:** Change PORT in .env file

**Problem:** MongoDB connection error  
**Solution:** Use local MongoDB or skip DB for now (uses mock data)

**Problem:** CORS errors  
**Solution:** Ensure CORS is enabled in app.js

---

## Need Help?

- Check README.md in each week folder
- See WEEK12_SUMMARY.md for task details
- Review DEPLOYMENT.md for deployment help
- Use PRESENTATION.md for presentation prep

Happy coding! 🚀
