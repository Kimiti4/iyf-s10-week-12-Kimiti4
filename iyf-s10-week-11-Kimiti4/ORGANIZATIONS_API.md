# 🏢 JamiiLink Multi-Tenant Organization System - API Documentation

## Overview

JamiiLink now supports **multi-tenant organizations**, allowing schools, estates, churches, NGOs, SMEs, and communities to have their own isolated workspaces with custom branding, member management, and analytics.

---

## 📋 Table of Contents

1. [Organization Model](#organization-model)
2. [Membership & Roles](#membership--roles)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Examples](#examples)

---

## 🏗️ Organization Model

### Organization Types
- `school` - Educational institutions
- `university` - Higher education
- `estate` - Residential communities
- `church` - Religious organizations
- `ngo` - Non-profit organizations
- `sme` - Small/medium enterprises
- `coworking` - Shared workspaces
- `community` - General communities
- `youth_group` - Youth organizations
- `professional` - Professional associations

### Subscription Plans
- **Free** - Up to 100 members, 500MB storage
- **Pro** - Up to 1,000 members, 5GB storage, analytics
- **Enterprise** - Unlimited members, custom features, dedicated support

---

## 👥 Membership & Roles

### Role Hierarchy

| Role | Permissions |
|------|-------------|
| **Owner** | Full control, billing, transfer ownership |
| **Admin** | Manage members, settings, moderation, view analytics |
| **Moderator** | Moderate content, approve posts |
| **Member** | Post, comment, participate |

### Permission Matrix

| Permission | Owner | Admin | Moderator | Member |
|-----------|-------|-------|-----------|--------|
| Create Posts | ✅ | ✅ | ✅ | ✅ |
| Comment | ✅ | ✅ | ✅ | ✅ |
| Moderate Content | ✅ | ✅ | ✅ | ❌ |
| Manage Members | ✅ | ✅ | ❌ | ❌ |
| Manage Settings | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ❌ | ❌ |
| Manage Billing | ✅ | ❌ | ❌ | ❌ |

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api/organizations
```

---

## 📝 Organization Management

### 1. Create Organization
**POST** `/api/organizations`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Strathmore University",
  "slug": "strathmore",
  "type": "university",
  "description": "Leading university in Nairobi",
  "contact": {
    "email": "info@strathmore.edu",
    "phone": "+254700000000",
    "address": {
      "city": "Nairobi",
      "county": "Nairobi"
    }
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "organization": {
      "_id": "...",
      "name": "Strathmore University",
      "slug": "strathmore",
      "type": "university",
      "owner": "...",
      "admins": ["..."],
      "plan": "free",
      "settings": {...},
      "createdAt": "..."
    },
    "message": "Organization created successfully"
  }
}
```

---

### 2. Get All Organizations
**GET** `/api/organizations?type=university&county=Nairobi&page=1&limit=10`

**Query Parameters:**
- `type` - Filter by organization type
- `county` - Filter by location
- `search` - Search by name/description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "total": 50,
  "pages": 5,
  "currentPage": 1,
  "data": [...]
}
```

---

### 3. Get Single Organization
**GET** `/api/organizations/:slug`

**Example:** `/api/organizations/strathmore`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Strathmore University",
    "slug": "strathmore",
    "type": "university",
    "description": "...",
    "branding": {
      "logo": "...",
      "primaryColor": "#3b82f6"
    },
    "stats": {
      "memberCount": 1250,
      "postCount": 342
    },
    "owner": {...}
  }
}
```

---

### 4. Update Organization
**PUT** `/api/organizations/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Body (only include fields to update):**
```json
{
  "description": "Updated description",
  "branding": {
    "primaryColor": "#ec4899"
  },
  "settings": {
    "allowPublicJoin": true
  }
}
```

**Access:** Admin or Owner only

---

### 5. Delete (Archive) Organization
**DELETE** `/api/organizations/:id`

**Access:** Owner only

**Note:** Organizations are archived, not deleted, to preserve data integrity.

---

### 6. Get My Organizations
**GET** `/api/organizations/my`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "name": "Strathmore University",
      "slug": "strathmore",
      "membershipRole": "admin",
      "membershipId": "..."
    }
  ]
}
```

---

## 👤 Membership Management

### 7. Join Organization
**POST** `/api/organizations/:id/join`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "membership": {...},
    "message": "Successfully joined organization"
  }
}
```

**Note:** If `requireApproval` is enabled, status will be "pending" until approved by admin.

---

### 8. Leave Organization
**POST** `/api/organizations/:id/leave`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Access:** Members only (Owner must transfer ownership first)

---

### 9. Get Organization Members
**GET** `/api/organizations/:id/members?role=admin&page=1&limit=50`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `role` - Filter by role (owner, admin, moderator, member)
- `page` - Page number
- `limit` - Items per page

**Access:** Members only

---

### 10. Update Member Role
**PUT** `/api/organizations/:id/members/:userId`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "role": "admin"
}
```

**Access:** Admin or Owner only

---

### 11. Approve Pending Member
**POST** `/api/organizations/:id/members/:userId/approve`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Access:** Admin or Owner only

---

### 12. Remove/Ban Member
**DELETE** `/api/organizations/:id/members/:userId?ban=true`

**Query Parameters:**
- `ban=true` - Ban member (can't rejoin)
- `ban=false` or omit - Just remove membership

**Access:** Admin or Owner only

---

## 🔐 Ownership & Advanced Features

### 13. Transfer Ownership
**POST** `/api/organizations/:id/transfer`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "newOwnerId": "user_id_here"
}
```

**Access:** Owner only

**Note:** New owner must be a member first. Old owner becomes admin.

---

### 14. Get Organization Analytics
**GET** `/api/organizations/:id/analytics`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalMembers": 1250,
      "newMembersLast7Days": 45,
      "newMembersLast30Days": 180,
      "posts": 342
    },
    "membersByRole": {
      "owner": 1,
      "admin": 5,
      "moderator": 12,
      "member": 1232
    },
    "subscription": {
      "plan": "pro",
      "status": "active",
      "periodEnd": "2026-06-01T00:00:00.000Z"
    }
  }
}
```

**Access:** Admin or Owner only

---

## 🔑 Authentication

All protected endpoints require JWT authentication:

1. **Login** to get token:
   ```
   POST /api/users/login
   ```

2. **Include token** in requests:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

---

## 💡 Usage Examples

### Example 1: Create a School Community

```bash
curl -X POST http://localhost:3000/api/organizations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nairobi Primary School",
    "slug": "nairobi-primary",
    "type": "school",
    "description": "Community for parents and teachers",
    "contact": {
      "email": "info@nairobiprimary.ac.ke",
      "address": {
        "city": "Nairobi",
        "county": "Nairobi"
      }
    }
  }'
```

### Example 2: Join an Organization

```bash
curl -X POST http://localhost:3000/api/organizations/ORG_ID/join \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 3: Promote Member to Admin

```bash
curl -X PUT http://localhost:3000/api/organizations/ORG_ID/members/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### Example 4: Get Analytics Dashboard

```bash
curl http://localhost:3000/api/organizations/ORG_ID/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚀 Next Steps

### Frontend Integration

1. **Organization Switcher** - Allow users to switch between their organizations
2. **Admin Dashboard** - Build UI for member management, analytics, settings
3. **Join Flow** - Create organization discovery and join request UI
4. **Branding** - Apply organization colors/logo to the interface

### Backend Enhancements

1. **Stripe Integration** - Implement subscription billing
2. **Custom Domains** - Support `org.jamiilink.com` subdomains
3. **Email Notifications** - Send invites, approvals, activity updates
4. **Audit Logs** - Track all admin actions for compliance

---

## 📊 Database Schema Summary

### Collections

1. **organizations** - Organization details, settings, branding
2. **memberships** - User-role mappings within organizations
3. **users** - Updated with `organizations` array and `currentOrganization`
4. **posts** - Updated with `organization` field for filtering

---

## 🔒 Security Notes

- Only owners can delete/transfer organizations
- Admins cannot modify other admins without owner permission
- Members can only view member lists (not edit)
- All mutations are logged with timestamps
- Rate limiting recommended for join requests

---

## 📞 Support

For questions or issues:
- GitHub Issues: https://github.com/Kimiti4/iyf-s10-week-12-Kimiti4
- Email: support@jamiilink.com
