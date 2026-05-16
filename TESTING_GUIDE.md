# 🧪 Testing Guide - New Features

## Quick Test Checklist

### 1. **Test Sidebar Navigation**

#### Steps:
1. Open browser: http://localhost:5174
2. Login with your founder account:
   - Email: `kimiti.kariuki75@gmail.com`
   - Password: `#gunzNroz3z_6G1GWY#`

3. **Check sidebar appears on left side**
   - Should be fixed position
   - Width: 260px
   - Gradient white background
   
4. **Test navigation sections**:
   - [ ] Main section (Feed, Reels, Events, Alerts)
   - [ ] Community section (Tiannara AI, Marketplace, Groups)
   - [ ] Personal section (Profile, Settings, Messages)
   - [ ] Admin section (Founder Dashboard) - only for founders

5. **Test interactions**:
   - [ ] Click each nav item - should navigate
   - [ ] Hover over items - should show blue highlight
   - [ ] Active route - should have blue gradient background
   - [ ] Check message badge shows "3"
   
6. **Test user card at bottom**:
   - [ ] Shows your avatar (👑 for founder)
   - [ ] Shows username "Snooz3"
   - [ ] Shows role "founder"
   - [ ] Click logout button (🚪) - should log out

---

### 2. **Test Settings Page**

#### Access:
- Click "⚙️ Settings" in navbar OR
- Click "Settings" in sidebar personal section
- URL: http://localhost:5174/settings

#### Profile Tab:
1. [ ] Avatar selector shows 12 emoji options
2. [ ] Click different avatars - should highlight selected
3. [ ] Fill in name, username, email fields
4. [ ] Type in bio textarea
5. [ ] Enter location and phone
6. [ ] Click "Save Changes" - should show success message
7. [ ] Message disappears after 3 seconds

#### Security Tab:
1. [ ] Change password form appears
2. [ ] Enter current password
3. [ ] Enter new password (min 8 chars)
4. [ ] Enter confirm password (must match)
5. [ ] Click "Update Password" - should succeed if matches
6. [ ] Check "Two-Factor Authentication" section exists
7. [ ] Check "Active Sessions" shows current device

#### Privacy Tab:
1. [ ] All 5 privacy toggles visible
2. [ ] Toggle each switch - should animate smoothly
3. [ ] Click "Save Privacy Settings" - should show success
4. [ ] Toggles maintain state after save

#### Notifications Tab:
1. [ ] All 6 notification toggles visible
2. [ ] Toggle each switch
3. [ ] Click "Save Notification Settings"
4. [ ] Success message appears

#### Appearance Tab:
1. [ ] Theme dropdown (Light/Dark/Auto)
2. [ ] Language dropdown (English/Swahili)
3. [ ] Font size dropdown (Small/Medium/Large)
4. [ ] Compact mode toggle
5. [ ] Click "Save Appearance" - success message

#### Data & Storage Tab:
1. [ ] Storage usage bar shows (35% filled)
2. [ ] "Download My Data" button visible
3. [ ] "Delete Account" button (red)
4. [ ] Danger zone warning card visible
5. [ ] "Permanently Delete Account" button

---

### 3. **Test Responsive Design**

#### Desktop (>768px):
- [ ] Sidebar visible on left
- [ ] Main content has left margin
- [ ] All tabs in settings visible
- [ ] Form rows display side-by-side

#### Mobile (<768px):
- [ ] Sidebar hidden by default
- [ ] Settings tabs scroll horizontally
- [ ] Form rows stack vertically
- [ ] Buttons full width

---

### 4. **Test Animations & Effects**

#### Sidebar:
- [ ] Nav items slide right on hover (4px)
- [ ] Active icon bounces
- [ ] Badge pulses
- [ ] User card lifts on hover
- [ ] Logout button rotates on hover

#### Settings:
- [ ] Alert messages slide in from top
- [ ] Tab content fades in
- [ ] Toggle switches slide smoothly
- [ ] Storage bar animates
- [ ] Buttons lift on hover

---

### 5. **Test Error Handling**

#### Password Change:
1. Enter mismatched passwords
2. Click update
3. Should show error: "New passwords do not match"

#### Form Validation:
1. Leave required fields empty
2. Try to submit
3. Browser should prevent submission

---

### 6. **Browser Console Check**

Open DevTools (F12) and check:
- [ ] No JavaScript errors
- [ ] No CSS warnings
- [ ] Network tab shows no failed requests
- [ ] Console is clean

---

## 🐛 Known Issues & Fixes

### Issue 1: Sidebar overlaps content
**Fix**: Add to `App.css`:
```css
.main-content.with-sidebar {
  margin-left: 260px;
  padding: 2rem;
}
```

### Issue 2: Settings page not found
**Cause**: Route not registered
**Fix**: Ensure App.jsx includes:
```jsx
<Route path="/settings" element={
  <ProtectedRoute>
    <SettingsPage />
  </ProtectedRoute>
} />
```

### Issue 3: Styles not loading
**Fix**: Restart dev server:
```bash
# In frontend terminal
Ctrl+C
npm run dev
```

---

## ✅ Success Criteria

You should see:
1. ✅ Modern sidebar with smooth animations
2. ✅ Professional settings page with 6 tabs
3. ✅ All toggles and forms working
4. ✅ Success/error messages appearing
5. ✅ Responsive layout on mobile/desktop
6. ✅ No console errors
7. ✅ Smooth transitions throughout

---

## 📸 Screenshot Checklist

Capture screenshots of:
1. [ ] Sidebar (all sections visible)
2. [ ] Settings - Profile tab
3. [ ] Settings - Security tab
4. [ ] Settings - Privacy tab (toggles)
5. [ ] Settings - Notifications tab
6. [ ] Settings - Appearance tab
7. [ ] Settings - Data tab (danger zone)
8. [ ] Mobile view (responsive)
9. [ ] Dark mode (if enabled)

---

## 🎯 Next Actions After Testing

If everything works:
1. Commit changes to Git
2. Push to GitHub
3. Vercel will auto-deploy
4. Test on production URL

If issues found:
1. Note the specific problem
2. Check browser console for errors
3. Review component code
4. Fix and retest

---

**Expected Time**: 15-20 minutes for full testing
**Difficulty**: Easy - all features are UI-based
