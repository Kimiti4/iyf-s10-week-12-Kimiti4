# 🔑 Quick Reference: Create Verified Users & Organizations

## Prerequisites
- Backend deployed to Railway (or running locally)
- Admin account created and logged in
- Postman or curl installed

---

## Step 1: Get Admin Token

### Using curl:
```bash
curl -X POST https://your-app.railway.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jamiilink.ke",
    "password": "Admin123!@#"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Save the token!** You'll need it for all verification requests.

---

## Step 2: Verify a User

### Method A: During User Creation (Recommended)

When creating a user via admin panel, include verification data:

```bash
curl -X POST https://your-app.railway.app/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "user",
    "verification": {
      "isVerified": true,
      "badgeLevel": "gold",
      "verificationType": "document",
      "verificationNotes": "Verified partner"
    }
  }'
```

### Method B: Verify Existing User

First, get the user ID from `/api/users` endpoint, then:

```bash
curl -X POST https://your-app.railway.app/api/verification/users/{USER_ID}/verify \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "badgeLevel": "silver",
    "verificationType": "email",
    "verificationNotes": "Email verified on signup"
  }'
```

**User Badge Levels:**
- `bronze` - Basic identity verification
- `silver` - Email + phone verified
- `gold` - Document verification
- `platinum` - Premium member
- `diamond` - Top-tier VIP

---

## Step 3: Verify an Organization

### Method A: During Organization Creation

```bash
curl -X POST https://your-app.railway.app/api/organizations \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "University of Nairobi",
    "slug": "uon",
    "type": "university",
    "description": "Kenya premier university",
    "verification": {
      "isVerified": true,
      "badgeLevel": "official",
      "verificationType": "educational_institution",
      "badgeColor": "#1e40af",
      "badgeGradient": {
        "start": "#1e40af",
        "end": "#3b82f6"
      }
    }
  }'
```

### Method B: Verify Existing Organization

```bash
curl -X POST https://your-app.railway.app/api/verification/organizations/{ORG_ID}/verify \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "badgeLevel": "partner",
    "verificationType": "business_license",
    "badgeColor": "#7c3aed",
    "badgeGradient": {
      "start": "#7c3aed",
      "end": "#a78bfa"
    }
  }'
```

**Organization Badge Levels:**
- `verified` - Basic verification (blue checkmark)
- `premium` - Premium organization (green)
- `partner` - Official partner (purple with animated border)
- `official` - Government/educational institution (red-orange pulse)

---

## Step 4: Verify Badge is Working

### Check User Badge:
```bash
curl https://your-app.railway.app/api/verification/users/{USER_ID}/badge
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "isVerified": true,
    "badgeLevel": "gold",
    "icon": "🥇",
    "color": "#FFD700",
    "gradient": "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
    "label": "Gold Member",
    "description": "Document verified"
  }
}
```

### Check Organization Badge:
```bash
curl https://your-app.railway.app/api/verification/organizations/{ORG_ID}/badge
```

---

## Step 5: Test in Frontend

1. **Navigate to user profile:**
   ```
   https://your-app.vercel.app/profile/{USER_ID}
   ```
   Should see badge next to username

2. **Navigate to organization page:**
   ```
   https://your-app.vercel.app/org/{SLUG}
   ```
   Should see badge in header

3. **View posts by verified user:**
   - Badge should appear next to author name in post cards

---

## 🎨 Badge Configuration Reference

### User Badges

| Level | Icon | Color | Gradient | Meaning |
|-------|------|-------|----------|---------|
| Bronze | 🥉 | #CD7F32 | Bronze → Dark Bronze | Identity verified |
| Silver | 🥈 | #C0C0C0 | Silver → Gray | Email + phone verified |
| Gold | 🥇 | #FFD700 | Gold → Orange | Document verified |
| Platinum | 💎 | #E5E4E2 | White → Purple | Premium member |
| Diamond | 👑 | Rainbow | Multi-color | VIP/Top contributor |

### Organization Badges

| Level | Icon | Color | Gradient | Meaning |
|-------|------|-------|----------|---------|
| Verified | ✓ | #3b82f6 | Blue gradient | Basic verification |
| Premium | ⭐ | #10b981 | Green gradient | Premium org |
| Partner | 🤝 | #7c3aed | Purple + border | Official partner |
| Official | 🏛️ | #ef4444 | Red-orange pulse | Gov/Educational |

---

## 🐛 Troubleshooting

### Problem: "Unauthorized" Error
**Solution:** Ensure you're using a valid admin token. Tokens expire after 24 hours.

### Problem: Badge Not Showing in UI
**Checklist:**
1. User/org has `verification.isVerified === true`
2. Frontend is fetching latest data (hard refresh)
3. VerificationBadge component is imported correctly
4. No console errors

### Problem: Wrong Badge Color
**Solution:** Clear browser cache. CSS gradients may be cached.

### Problem: Animations Not Working
**Check:**
- Browser supports CSS animations (all modern browsers do)
- No `prefers-reduced-motion` setting enabled
- GPU acceleration available

---

## 📋 Batch Verification Script

For verifying multiple users at once, use this Node.js script:

```javascript
const ADMIN_TOKEN = 'your_admin_token_here';
const API_URL = 'https://your-app.railway.app/api';

const USERS_TO_VERIFY = [
  { userId: '64f1a2b3c4d5e6f7g8h9i0j1', level: 'gold' },
  { userId: '64f1a2b3c4d5e6f7g8h9i0j2', level: 'silver' },
  // Add more...
];

async function verifyUsers() {
  for (const user of USERS_TO_VERIFY) {
    try {
      const response = await fetch(`${API_URL}/verification/users/${user.userId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          badgeLevel: user.level,
          verificationType: 'manual',
          verificationNotes: 'Batch verification'
        })
      });
      
      if (response.ok) {
        console.log(`✓ Verified user ${user.userId} as ${user.level}`);
      } else {
        console.error(`✗ Failed to verify user ${user.userId}`);
      }
    } catch (error) {
      console.error(`Error verifying user ${user.userId}:`, error);
    }
  }
}

verifyUsers();
```

Run with:
```bash
node batch-verify.js
```

---

## ✅ Verification Checklist

Before going live:
- [ ] Admin token obtained and saved securely
- [ ] At least 3 test users verified (different levels)
- [ ] At least 2 test organizations verified (different levels)
- [ ] Badges visible on desktop browser
- [ ] Badges visible on mobile browser
- [ ] Animations working smoothly
- [ ] Tooltip/label text readable
- [ ] Colors match design specifications
- [ ] No console errors
- [ ] Performance acceptable (< 100ms badge render time)

---

## 🎯 Example: First Verified Accounts Setup

Here's exactly what to do after deployment:

### 1. Create Admin Account (via signup page)
```
Email: admin@jamiilink.ke
Password: [Choose strong password]
Username: JamiiLink Admin
```

### 2. Promote to Admin (via MongoDB Compass or mongosh)
```javascript
// In MongoDB
db.users.updateOne(
  { email: "admin@jamiilink.ke" },
  { $set: { role: "admin" } }
)
```

### 3. Login and Get Token
```bash
curl -X POST https://your-app.railway.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jamiilink.ke","password":"YOUR_PASSWORD"}'
```

### 4. Verify First Organization
```bash
# Get org ID first
curl https://your-app.railway.app/api/organizations?slug=uon

# Then verify it
curl -X POST https://your-app.railway.app/api/verification/organizations/{ORG_ID}/verify \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "badgeLevel": "official",
    "verificationType": "educational_institution"
  }'
```

### 5. Verify First User
```bash
# Get user ID
curl https://your-app.railway.app/api/users/me \
  -H "Authorization: Bearer USER_TOKEN"

# Verify them
curl -X POST https://your-app.railway.app/api/verification/users/{USER_ID}/verify \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "badgeLevel": "diamond",
    "verificationType": "manual"
  }'
```

### 6. Celebrate! 🎉
Visit your site and see those beautiful badges in action!

---

## 📞 Need Help?

If you encounter issues:
1. Check backend logs on Railway dashboard
2. Check frontend console for errors
3. Verify API endpoints are responding
4. Test with Postman first, then integrate into frontend

Good luck! Your unique badge system is ready to impress users! 🏆
