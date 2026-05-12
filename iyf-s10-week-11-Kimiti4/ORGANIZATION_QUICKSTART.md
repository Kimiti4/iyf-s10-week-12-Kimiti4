# 🚀 Multi-Tenant Organization System - Quick Start Guide

## What's New?

JamiiLink now supports **multi-tenant organizations** - allowing schools, estates, churches, SMEs, and communities to have their own isolated workspaces with:

✅ Custom branding (logo, colors)  
✅ Role-based access control (Owner, Admin, Moderator, Member)  
✅ Member management & approval workflows  
✅ Organization-scoped content filtering  
✅ Analytics dashboard  
✅ Subscription plans (Free/Pro/Enterprise)  

---

## 📁 Files Created/Modified

### New Files
1. `src/models/Organization.js` - Organization schema
2. `src/models/Membership.js` - User membership & roles
3. `src/controllers/organizationsController.js` - Business logic
4. `src/routes/organizations.js` - API routes
5. `ORGANIZATIONS_API.md` - Complete API documentation

### Modified Files
1. `src/models/User.js` - Added organization references
2. `src/models/Post.js` - Added organization field
3. `src/routes/index.js` - Mounted organization routes
4. `server.js` - Updated startup messages

---

## 🧪 Testing the API

### 1. Start the Backend Server

```bash
cd iyf-s10-week-11-Kimiti4
npm run dev
```

Server will start on `http://localhost:3000`

---

### 2. Register a User (if you don't have one)

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

### 3. Login to Get JWT Token

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response.

---

### 4. Create Your First Organization

```bash
curl -X POST http://localhost:3000/api/organizations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Community",
    "slug": "test-community",
    "type": "community",
    "description": "My first test organization",
    "contact": {
      "email": "admin@test.com",
      "address": {
        "city": "Nairobi",
        "county": "Nairobi"
      }
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "organization": {
      "_id": "67890abcdef...",
      "name": "Test Community",
      "slug": "test-community",
      "type": "community",
      "owner": "user_id_here",
      "plan": "free",
      ...
    },
    "message": "Organization created successfully"
  }
}
```

---

### 5. Get All Organizations

```bash
curl http://localhost:3000/api/organizations
```

---

### 6. Get Your Organizations

```bash
curl http://localhost:3000/api/organizations/my \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 7. Join an Organization (as another user)

First, register/login as a different user, then:

```bash
curl -X POST http://localhost:3000/api/organizations/ORG_ID/join \
  -H "Authorization: Bearer OTHER_USER_TOKEN"
```

---

### 8. Promote Member to Admin

```bash
curl -X PUT http://localhost:3000/api/organizations/ORG_ID/members/USER_ID \
  -H "Authorization: Bearer OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

---

### 9. View Analytics

```bash
curl http://localhost:3000/api/organizations/ORG_ID/analytics \
  -H "Authorization: Bearer ADMIN_OR_OWNER_TOKEN"
```

---

## 🎯 Key Features Implemented

### ✅ Organization Management
- Create, read, update, archive organizations
- Unique slugs for URL routing
- Type-based categorization
- Contact information
- Branding settings

### ✅ Membership System
- 4-tier role hierarchy (Owner, Admin, Moderator, Member)
- Granular permissions per role
- Join requests with approval workflow
- Member removal/banning
- Ownership transfer

### ✅ Access Control
- JWT-based authentication
- Role-based authorization middleware
- Permission checking methods
- Organization-scoped data isolation

### ✅ Analytics
- Member counts by role
- Growth metrics (7-day, 30-day)
- Post statistics
- Subscription status

---

## 📊 Database Schema

### Organization Document
```javascript
{
  _id: ObjectId,
  name: "Strathmore University",
  slug: "strathmore",
  type: "university",
  description: "...",
  branding: {
    logo: "url",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6"
  },
  contact: {
    email: "...",
    phone: "...",
    address: {...}
  },
  plan: "free",
  subscription: {
    status: "active",
    currentPeriodEnd: Date
  },
  settings: {
    allowPublicJoin: false,
    requireApproval: true,
    maxMembers: 100
  },
  stats: {
    memberCount: 150,
    postCount: 42
  },
  owner: ObjectId (ref: User),
  admins: [ObjectId],
  status: "active",
  createdAt: Date,
  updatedAt: Date
}
```

### Membership Document
```javascript
{
  _id: ObjectId,
  organization: ObjectId (ref: Organization),
  user: ObjectId (ref: User),
  role: "admin",
  permissions: {
    canPost: true,
    canComment: true,
    canModerate: true,
    canManageMembers: true,
    canManageSettings: true,
    canViewAnalytics: true,
    canManageBilling: false
  },
  status: "active",
  joinedAt: Date,
  lastActiveAt: Date
}
```

---

## 🔐 Security Features

✅ Password hashing with bcrypt  
✅ JWT authentication  
✅ Role-based access control  
✅ Permission checking on all mutations  
✅ Owner-only operations (delete, transfer)  
✅ Input validation & sanitization  
✅ Compound unique indexes (prevent duplicate memberships)  

---

## 🚀 Next Steps

### Phase 1: Frontend Integration (Recommended Next)
1. Add organization switcher to navbar
2. Create organization creation form
3. Build admin dashboard UI
4. Implement join/approval flow
5. Filter posts by organization

### Phase 2: Advanced Features
1. Stripe subscription integration
2. Email notifications (invites, approvals)
3. Custom domain support (`org.jamiilink.com`)
4. Audit logging system
5. Bulk member import/export

### Phase 3: AI Layer (Tiannara v0.1)
1. Content moderation API
2. Recommendation engine
3. Behavioral analytics
4. Anomaly detection

---

## 📝 API Endpoints Summary

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/organizations` | Public | List all organizations |
| GET | `/api/organizations/:slug` | Public | Get single org |
| POST | `/api/organizations` | Auth | Create organization |
| PUT | `/api/organizations/:id` | Admin | Update organization |
| DELETE | `/api/organizations/:id` | Owner | Archive organization |
| GET | `/api/organizations/my` | Auth | Get my organizations |
| POST | `/api/organizations/:id/join` | Auth | Join organization |
| POST | `/api/organizations/:id/leave` | Auth | Leave organization |
| GET | `/api/organizations/:id/members` | Member | List members |
| PUT | `/api/organizations/:id/members/:userId` | Admin | Update role |
| POST | `/api/organizations/:id/members/:userId/approve` | Admin | Approve member |
| DELETE | `/api/organizations/:id/members/:userId` | Admin | Remove member |
| POST | `/api/organizations/:id/transfer` | Owner | Transfer ownership |
| GET | `/api/organizations/:id/analytics` | Admin | View analytics |

---

## 💡 Pro Tips

1. **Slug Uniqueness**: Slugs must be unique and URL-friendly (lowercase, hyphens)
2. **Owner Cannot Leave**: Must transfer ownership first
3. **Soft Deletes**: Organizations are archived, not deleted
4. **Permission Overrides**: Custom permissions can override role defaults
5. **Approval Workflow**: Enable `requireApproval` to vet new members

---

## 🐛 Troubleshooting

### Error: "Organization slug is already taken"
- Choose a different slug or check existing organizations

### Error: "Not authorized"
- Ensure you're using the correct JWT token
- Check your role in the organization

### Error: "User is not a member"
- Join the organization first before performing actions

### MongoDB Connection Issues
- Check `.env` file has correct `MONGODB_URI`
- Ensure MongoDB Atlas cluster is active

---

## 📞 Need Help?

- **API Docs**: See `ORGANIZATIONS_API.md` for detailed endpoint documentation
- **GitHub**: https://github.com/Kimiti4/iyf-s10-week-12-Kimiti4
- **Issues**: Open an issue for bugs or feature requests

---

## 🎉 Success!

You now have a fully functional multi-tenant organization system ready for:
- Schools & Universities
- Residential Estates
- Churches & NGOs
- SMEs & Coworking Spaces
- Youth Groups & Communities

**Next**: Integrate with frontend and start onboarding real organizations! 🚀
