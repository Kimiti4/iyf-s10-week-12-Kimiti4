# 🚀 Quick Start Guide - JamiiLink KE

## Step 1: Create YOUR Founder Account

### Run the API Script:
```bash
cd "c:\Users\user\New folder (4)\iyf-s10-week-12-Kimiti4\iyf-s10-week-11-Kimiti4"
node ../CREATE_FOUNDER_ACCOUNT_API.js
```

This will create your account with:
- **Username**: kimiti4
- **Email**: amos.kimiti@jamiilink.ke
- **Badge**: Diamond 💎
- **Avatar**: Crown 👑
- **MFA**: 3-Factor Authentication enabled

---

## Step 2: Login to Your Account

1. Open browser: http://localhost:5173/login
2. Enter credentials:
   - Email: `amos.kimiti@jamiilink.ke`
   - Password: `Kimiti@2026!Founder#MFA`
3. Complete MFA verification (if prompted)
4. You'll be redirected to founder dashboard

---

## Step 3: Access Founder Dashboard

Navigate to: http://localhost:5173/admin/founder

**Available Features:**
- ✅ Platform analytics
- ✅ User management
- ✅ Emergency alert creation
- ✅ Content moderation tools
- ✅ System settings
- ✅ Verification badge management

---

## Step 4: Explore Unique Features

### 🤖 Tiannara AI Assistant
- Navigate to `/tiannara` or find it in the sidebar
- Try mental health support chat
- Test fact-checking with sample claims
- See content moderation in action

### 🎉 Community Events
- Go to `/events`
- Click "+ Create Event"
- Fill in event details
- Publish and share with community

### 🚨 Emergency Alerts
- Only founders can create alerts
- Go to `/alerts`
- Click "+ Create Alert"
- Select type, severity, location
- Broadcast to affected areas

### 😊 Set Your Mood
- Click mood indicator in header
- Choose how you're feeling
- Share with community
- See celebration animation

### 💯 Check Your Badges
- Visit your profile
- See earned achievements
- Track progress to next badge
- Show off your Diamond badge! 💎

### ❤️ React to Posts
- Double-click or hover on like button
- Choose emoji reaction
- See real-time counts
- View who reacted

### 📊 View Polls
- Find poll posts in feed
- Vote on options
- See animated results
- Track total votes

### #️⃣ Trending Hashtags
- Check sidebar widget
- See live trending topics
- Click to filter by hashtag
- Watch trends update every 5 minutes

---

## Step 5: Security Best Practices

### Change Your Password
1. Go to Settings → Security
2. Change from default password
3. Use strong, unique password

### Setup MFA Authenticator
1. Download Google Authenticator or Authy
2. Scan QR code in Settings → MFA
3. Save backup codes securely
4. Test login with MFA

### Save Backup Codes
- Store in secure password manager
- Print and keep in safe place
- Never share with anyone
- Use only for emergency access

---

## Step 6: Deploy to Production

### Backend (Railway):
```bash
cd iyf-s10-week-11-Kimiti4
railway login
railway up
```

### Frontend (Vercel):
- Already connected to GitHub
- Auto-deploys on push
- Check: https://vercel.com/dashboard

---

## 🎯 Feature Checklist

Try each feature:

- [ ] Create founder account
- [ ] Login with MFA
- [ ] Access founder dashboard
- [ ] Chat with Tiannara AI
- [ ] Test mental health support
- [ ] Verify a claim (fact-check)
- [ ] Create a community event
- [ ] Send an emergency alert
- [ ] Set your mood
- [ ] React to a post
- [ ] Vote on a poll
- [ ] Check trending hashtags
- [ ] View your badges
- [ ] Update profile settings
- [ ] Change password
- [ ] Setup MFA authenticator

---

## 🆘 Troubleshooting

### Can't Create Founder Account?
- Make sure backend is running: `npm run dev`
- Check MongoDB connection
- Verify port 3000 is available

### Can't Login?
- Confirm email: amos.kimiti@jamiilink.ke
- Check password: Kimiti@2026!Founder#MFA
- Clear browser cache
- Try incognito mode

### MFA Not Working?
- Check system time (must be accurate)
- Re-scan QR code in authenticator app
- Use backup codes if locked out
- Contact support (you!)

### Features Not Showing?
- Hard refresh browser (Ctrl+Shift+R)
- Clear localStorage
- Check console for errors
- Verify all components imported

---

## 📞 Support

Since you're the founder, you ARE the support! 😄

But seriously:
- Check logs in Railway dashboard
- Monitor Vercel deployment status
- Review GitHub issues
- Test locally before deploying

---

## 🎉 You're All Set!

You now have:
✅ Unique founder account with diamond badge
✅ Tiannara AI for mental health & fact-checking
✅ Community events system
✅ Emergency alerts broadcasting
✅ Gamification with badges
✅ Social reactions & polls
✅ Trending hashtags
✅ Fun emoji avatars
✅ Heavy MFA security

**Go build something amazing for Kenya!** 🇰🇪
