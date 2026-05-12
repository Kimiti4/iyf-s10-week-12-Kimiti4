# 👑 Create & Login to Your Founder Account

## 🎯 What Makes Your Founder Account Unique

Your founder account has **exclusive features** that regular users don't have:

### 🔹 **Exclusive Founder Perks:**
- ✅ **Diamond Verification Badge** 💎 (highest tier)
- ✅ **Golden Glow Animation** on your avatar
- ✅ **Crown Avatar Icon** 👑 (instead of regular animals)
- ✅ **3-Factor MFA Security** (TOTP + Email + SMS)
- ✅ **Admin Dashboard Access** - Full platform control
- ✅ **Special Founder Tag** in all your posts
- ✅ **Priority Support Badge** 
- ✅ **Access to All Analytics** and metrics

---

##  Step 1: Create Your Founder Account

### Option A: Automated Script (Recommended)

```bash
# Navigate to project root
cd "c:\Users\user\New folder (4)\iyf-s10-week-12-Kimiti4"

# Run the founder creation script
node CREATE_YOUR_FOUNDER_ACCOUNT.js
```

**What the script does:**
- Creates account with username: `kimiti4`
- Sets up heavy 3-factor MFA
- Generates 10 backup codes
- Assigns diamond verification badge
- Sets up golden avatar icon

### Option B: Manual API Call

If you prefer to use the API directly:

```bash
curl -X POST https://your-backend-url/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "snooz3",
    "email": "kimiti.kariuki75@gmail.com",
    "password": "#gunzNroz3z_6G1GWY#",
    "role": "founder",
    "isFounder": true,
    "profile": {
      "bio": "snooz3 - Platform Founder",
      "avatarIcon": "👑"
    }
  }'
```

---

##  Step 2: MFA Setup (Required for Founder)

After creating the account, you'll see:

```
🔐 YOUR MFA Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Method 1: TOTP (Authenticator App)
   Secret: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   
   Backup Codes:
   1. A1B2C3D4
   2. E5F6G7H8
   ...
```

### Setup Google Authenticator:
1. Install Google Authenticator or Authy on your phone
2. Scan the QR code or manually enter the secret
3. Save all 10 backup codes in a secure location (password manager)
4. **Never share these codes!**

---

## 🚀 Step 3: Login as Founder

### Web Interface:
1. Go to: `http://localhost:5173/login` (local) or your Vercel URL
2. Enter email and password
3. You'll see the **MFA verification screen**
4. Enter code from Google Authenticator OR use backup code
5. Click "Verify & Login"
6. You'll be redirected to the **Founder Dashboard**

### Founder Dashboard URL:
- Local: `http://localhost:5173/admin/founder`
- Production: `https://your-vercel-url.vercel.app/admin/founder`

---

##  What You'll See as Founder

### 1. **Founder Profile Page**
- Golden glowing avatar with crown 👑
- Diamond verification badge
- "Founder" tag on all posts
- Special animated border around your profile

### 2. **Admin Dashboard Features**
```
📊 Platform Statistics
   - Total Users, Posts, Comments
   - Real-time active users
   - Growth metrics

 User Management
   - View all users
   - Verify users manually
   - Manage verification badges

🎨 Content Moderation
   - Review reported posts
   - Manage trending hashtags
   - Feature special content

📈 Analytics
   - Platform engagement metrics
   - User activity trends
   - Organization performance
```

### 3. **Special Founder UI Elements**
- Golden border around your posts
- Special "Founder" badge next to your name
- Crown emoji on your profile
- Animated glow effect on hover
- Priority placement in feeds

---

## 🔒 Security Best Practices for Founder Account

### 1. **Password Security**
```javascript
// Change the default password immediately
// Minimum requirements:
- 12+ characters
- Mix of uppercase, lowercase, numbers, symbols
- Never reuse passwords
```

### 2. **Backup Codes**
- Print and store in a secure location
- Save in password manager
- Keep offline backup (printed)
- **Each code can only be used ONCE**

### 3. **MFA Methods**
- ✅ TOTP (Google Authenticator) - PRIMARY
- ✅ Email verification - SECONDARY
- ✅ SMS verification - TERTIARY (add phone number)
- 🔄 Consider adding hardware key (YubiKey)

### 4. **Account Recovery**
If you lose access:
1. Use one of the 10 backup codes
2. Each backup code expires after use
3. Generate new backup codes in settings
4. Contact platform support with proof of identity

---

## 🎨 Customizing Your Founder Profile

### Update Your Bio:
```javascript
// Via API
PUT /api/users/:userId/profile
{
  "bio": "Your custom bio",
  "location": {
    "county": "Nairobi",
    "settlement": "Westlands"
  },
  "skills": ["Full Stack Dev", "Community Building"],
  "avatarIcon": ""  // Keep the crown!
}
```

### Upload Custom Avatar:
1. Go to Profile Settings
2. Click "Upload Avatar"
3. Choose high-quality image (recommended: 500x500px)
4. The system will show both your avatar AND the crown icon

---

## 🚨 Troubleshooting

### Can't Login?
- Check MFA codes - ensure time is synced on authenticator app
- Use backup codes if authenticator isn't working
- Verify email/password are correct

### Lost All Backup Codes?
1. Contact support with identity proof
2. Reset MFA through email verification
3. Generate new backup codes immediately

### MFA Not Showing?
- Clear browser cache
- Try incognito mode
- Check if account has `isFounder: true` in database

### No Founder Badge?
- Verify `role: 'founder'` in database
- Check `verification.badgeLevel: 'diamond'`
- Clear cache and refresh

---

## 📞 Support

If you need help with your founder account:

1. **Self-Service:** Check `/admin/founder/settings`
2. **Documentation:** Read `CREATE_YOUR_FOUNDER_ACCOUNT.js`
3. **Email:** Send details to your registered email
4. **Database:** Direct MongoDB access if needed

---

## 🎉 Quick Start Checklist

- [ ] Run `CREATE_YOUR_FOUNDER_ACCOUNT.js`
- [ ] Save all 10 backup codes
- [ ] Setup Google Authenticator
- [ ] Change default password
- [ ] Login at `/login` with MFA
- [ ] Explore founder dashboard at `/admin/founder`
- [ ] Customize your profile
- [ ] Add phone number for SMS verification
- [ ] Test all MFA methods
- [ ] Create your first founder post

---

**Welcome to your Founder Account! 👑**

You now have the highest level of access and security on the JamiiLink platform.
