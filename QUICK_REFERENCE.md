# 🚀 JamiiLink Admin Dashboard - Quick Reference

## Live Links
- **Frontend**: https://jamii-link-ke.vercel.app
- **Admin Dashboard**: https://jamii-link-ke.vercel.app/admin
- **Backend API**: (Deploy to Railway/Render)

---

## Quick Start (3 Steps)

### 1. Start Backend
```bash
cd iyf-s10-week-11-Kimiti4
npm run dev
# Server runs on http://localhost:3000
```

### 2. Start Frontend
```bash
cd iyf-s10-week-09-Kimiti4
npm run dev
# App runs on http://localhost:5173
```

### 3. Access Dashboard
1. Open http://localhost:5173
2. Login with your credentials
3. Click "Admin" button in navbar
4. Or go directly to http://localhost:5173/admin

---

## Key Features

✅ Create organizations  
✅ Manage members & roles  
✅ View analytics stats  
✅ Update branding/colors  
✅ Archive organizations  

---

## API Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Get my orgs | GET | `/api/organizations/my` |
| Create org | POST | `/api/organizations` |
| Update org | PUT | `/api/organizations/:id` |
| Delete org | DELETE | `/api/organizations/:id` |
| Get members | GET | `/api/organizations/:id/members` |
| Update role | PUT | `/api/organizations/memberships/:id/role` |

---

## File Locations

**Frontend:**
- Component: `iyf-s10-week-09-Kimiti4/src/enhanced/pages/AdminDashboard.jsx`
- Styles: `iyf-s10-week-09-Kimiti4/src/enhanced/pages/AdminDashboard.css`
- Route: `iyf-s10-week-09-Kimiti4/src/App.jsx` (line ~70)

**Backend:**
- Models: `iyf-s10-week-11-Kimiti4/src/models/Organization.js`
- Controller: `iyf-s10-week-11-Kimiti4/src/controllers/organizationsController.js`
- Routes: `iyf-s10-week-11-Kimiti4/src/routes/organizations.js`

---

## Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000/api
```

**Backend (.env):**
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/jamiilink
JWT_SECRET=your_secret_key
```

---

## Common Tasks

### Create First Organization
1. Go to `/admin`
2. Click "Create Organization"
3. Fill form:
   - Name: Your Community Name
   - Slug: your-community-name
   - Type: Select type
   - Description: Brief description
4. Click "Create Organization"

### Add Members
Members join via invitation or approval workflow (future feature).

### Change Member Role
1. Go to "Members" tab
2. Find member in table
3. Change role dropdown
4. Auto-saves immediately

### Update Branding
1. Click organization card
2. Goes to "Settings" tab
3. Change colors with pickers
4. Click "Save Changes"

---

## Troubleshooting

**Problem**: Can't see Admin button  
**Solution**: Must be logged in first

**Problem**: "Failed to fetch organizations"  
**Solution**: Check backend is running on port 3000

**Problem**: CORS error  
**Solution**: Add frontend URL to backend CORS whitelist

**Problem**: Token expired  
**Solution**: Logout and login again

---

## Documentation

- **Full Guide**: [ADMIN_DASHBOARD_GUIDE.md](ADMIN_DASHBOARD_GUIDE.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Summary**: [ADMIN_DASHBOARD_SUMMARY.md](ADMIN_DASHBOARD_SUMMARY.md)
- **API Reference**: `iyf-s10-week-11-Kimiti4/ORGANIZATIONS_API.md`

---

## Tech Stack

**Frontend:**
- React 18
- React Router v6
- Framer Motion (animations)
- React Icons
- Vite (build tool)

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- REST API

---

## Next Steps

1. ✅ Build Admin Dashboard UI ← YOU ARE HERE
2. ⏳ Deploy backend to Railway/Render
3. ⏳ Configure production environment
4. ⏳ Test on live deployment
5. ⏳ Add advanced features (charts, search, etc.)

---

**Need Help?** Check the full documentation or review browser console for errors.
