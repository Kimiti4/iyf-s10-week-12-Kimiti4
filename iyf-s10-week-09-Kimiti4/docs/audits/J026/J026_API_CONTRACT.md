# J-026 API Contract

## Audit Reference

| Field        | Value                                                                 |
|--------------|-----------------------------------------------------------------------|
| Audit ID     | J-026                                                                 |
| Product      | TaskFlow – Team Task & Project Management SaaS                        |
| See Also     | [J026_ARCHITECTURE.md](J026_ARCHITECTURE.md), [J026_REQUIREMENTS.md](J026_REQUIREMENTS.md) |

---

## 1. General Information

| Property          | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| Base URL          | `/api/tf`                                                             |
| Content Type      | `application/json`                                                    |
| Auth              | Bearer JWT in `Authorization` header (except public routes)           |
| Date Format       | ISO 8601 (UTC)                                                        |
| ID Format         | UUID v4                                                                |

---

## 2. Authentication Endpoints

### 2.1 POST `/api/tf/auth/register`

**Description:** Register a new user account.

| Req Field         | Type     | Required | Validation                                    |
|-------------------|----------|----------|-----------------------------------------------|
| `email`           | string   | Yes      | Valid email format, max 255 chars              |
| `password`        | string   | Yes      | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit |
| `name`            | string   | Yes      | 1–100 characters                              |

**Response 201:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "createdAt": "2026-09-03T12:00:00.000Z"
  }
}
```

**Error 409:**
```json
{
  "error": "Email already registered"
}
```

**Error 400:**
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "password", "message": "Must be at least 8 characters" }
  ]
}
```

---

### 2.2 POST `/api/tf/auth/login`

**Description:** Authenticate and receive a JWT.

| Req Field     | Type     | Required | Validation          |
|---------------|----------|----------|---------------------|
| `email`       | string   | Yes      | Valid email format  |
| `password`    | string   | Yes      | Non-empty string    |

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "name": "Alice Johnson"
  }
}
```

**Error 401:**
```json
{
  "error": "Invalid email or password"
}
```

---

### 2.3 GET `/api/tf/auth/me`

**Description:** Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "avatar": null,
    "createdAt": "2026-09-03T12:00:00.000Z"
  }
}
```

**Error 401:**
```json
{
  "error": "Invalid or expired token"
}
```

---

## 3. Organization Endpoints

### 3.1 POST `/api/tf/organizations`

**Description:** Create a new organization.

| Req Field     | Type     | Required | Validation          |
|---------------|----------|----------|---------------------|
| `name`        | string   | Yes      | 1–100 characters    |
| `description` | string   | No       | Max 500 characters  |

**Response 201:**
```json
{
  "organization": {
    "id": "org-uuid-1",
    "name": "Acme Corp",
    "description": "Our team workspace",
    "ownerId": "user-uuid-1",
    "createdAt": "2026-09-03T12:00:00.000Z"
  }
}
```

---

### 3.2 GET `/api/tf/organizations`

**Description:** List all organizations the authenticated user belongs to.

**Response 200:**
```json
{
  "organizations": [
    {
      "id": "org-uuid-1",
      "name": "Acme Corp",
      "role": "owner",
      "memberCount": 5,
      "createdAt": "2026-09-03T12:00:00.000Z"
    }
  ]
}
```

---

### 3.3 GET `/api/tf/organizations/:orgId`

**Description:** Get organization details.

**Response 200:**
```json
{
  "organization": {
    "id": "org-uuid-1",
    "name": "Acme Corp",
    "description": "Our team workspace",
    "ownerId": "user-uuid-1",
    "memberCount": 5,
    "projectCount": 3,
    "createdAt": "2026-09-03T12:00:00.000Z"
  }
}
```

---

### 3.4 PATCH `/api/tf/organizations/:orgId`

**Description:** Update organization details. Owner/admin only.

| Req Field     | Type     | Required | Validation          |
|---------------|----------|----------|---------------------|
| `name`        | string   | No       | 1–100 characters    |
| `description` | string   | No       | Max 500 characters  |

**Response 200:**
```json
{
  "organization": { ... }
}
```

---

### 3.5 POST `/api/tf/organizations/:orgId/members`

**Description:** Invite a member to the organization.

| Req Field | Type     | Required | Validation                          |
|-----------|----------|----------|-------------------------------------|
| `email`   | string   | Yes      | Valid email format                  |
| `role`    | string   | No       | `admin`, `member` (default), `viewer` |

**Response 201:**
```json
{
  "membership": {
    "id": "mem-uuid-1",
    "userId": "user-uuid-2",
    "email": "bob@example.com",
    "role": "member",
    "createdAt": "2026-09-03T12:00:00.000Z"
  }
}
```

**Response 201 (invitation created for unregistered user):**
```json
{
  "invitation": {
    "id": "inv-uuid-1",
    "email": "charlie@example.com",
    "role": "member",
    "expiresAt": "2026-09-10T12:00:00.000Z"
  }
}
```

---

### 3.6 GET `/api/tf/organizations/:orgId/members`

**Description:** List all members of an organization.

**Response 200:**
```json
{
  "members": [
    {
      "id": "mem-uuid-1",
      "userId": "user-uuid-1",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "owner",
      "joinedAt": "2026-09-03T12:00:00.000Z"
    }
  ]
}
```

---

### 3.7 PATCH `/api/tf/organizations/:orgId/members/:userId`

**Description:** Update a member's role. Owner/admin only.

| Req Field | Type     | Required | Validation                              |
|-----------|----------|----------|-----------------------------------------|
| `role`    | string   | Yes      | `owner`, `admin`, `member`, `viewer`    |

**Response 200:**
```json
{
  "membership": {
    "id": "mem-uuid-1",
    "userId": "user-uuid-2",
    "role": "admin"
  }
}
```

---

### 3.8 DELETE `/api/tf/organizations/:orgId/members/:userId`

**Description:** Remove a member from the organization. Owner/admin only.

**Response 204:** No Content

---

## 4. Project Endpoints

### 4.1 POST `/api/tf/organizations/:orgId/projects`

**Description:** Create a new project within an organization.

| Req Field     | Type     | Required | Validation             |
|---------------|----------|----------|------------------------|
| `name`        | string   | Yes      | 1–120 characters       |
| `description` | string   | No       | Max 2000 characters    |
| `startDate`   | string   | No       | ISO date (YYYY-MM-DD)  |
| `endDate`     | string   | No       | ISO date (YYYY-MM-DD)  |

**Response 201:**
```json
{
  "project": {
    "id": "proj-uuid-1",
    "organizationId": "org-uuid-1",
    "name": "Website Redesign",
    "description": "Complete overhaul of the marketing site",
    "status": "active",
    "startDate": "2026-09-01",
    "endDate": "2026-12-31",
    "createdBy": "user-uuid-1",
    "createdAt": "2026-09-03T12:00:00.000Z"
  }
}
```

---

### 4.2 GET `/api/tf/organizations/:orgId/projects`

**Description:** List all projects in an organization.

**Query Parameters:**
| Param    | Type   | Required | Description                         |
|----------|--------|----------|-------------------------------------|
| `status` | string | No       | `active` (default), `archived`, `all` |

**Response 200:**
```json
{
  "projects": [
    {
      "id": "proj-uuid-1",
      "name": "Website Redesign",
      "status": "active",
      "taskCount": 12,
      "memberCount": 4,
      "createdAt": "2026-09-03T12:00:00.000Z"
    }
  ]
}
```

---

### 4.3 GET `/api/tf/organizations/:orgId/projects/:projectId`

**Description:** Get project details.

**Response 200:**
```json
{
  "project": {
    "id": "proj-uuid-1",
    "organizationId": "org-uuid-1",
    "name": "Website Redesign",
    "description": "Complete overhaul of the marketing site",
    "status": "active",
    "startDate": "2026-09-01",
    "endDate": "2026-12-31",
    "createdBy": "user-uuid-1",
    "createdAt": "2026-09-03T12:00:00.000Z",
    "updatedAt": "2026-09-03T12:00:00.000Z"
  }
}
```

---

### 4.4 PATCH `/api/tf/organizations/:orgId/projects/:projectId`

**Description:** Update project details. Creator, owner, or admin only.

| Req Field     | Type     | Required | Validation             |
|---------------|----------|----------|------------------------|
| `name`        | string   | No       | 1–120 characters       |
| `description` | string   | No       | Max 2000 characters    |
| `status`      | string   | No       | `active`, `archived`   |
| `startDate`   | string   | No       | ISO date               |
| `endDate`     | string   | No       | ISO date               |

**Response 200:**
```json
{
  "project": { ... }
}
```

---

### 4.5 DELETE `/api/tf/organizations/:orgId/projects/:projectId`

**Description:** Permanently delete a project. Owner/admin only.

**Response 204:** No Content

---

## 5. Task Endpoints

### 5.1 POST `/api/tf/organizations/:orgId/projects/:projectId/tasks`

**Description:** Create a new task in a project.

| Req Field     | Type     | Required | Validation              |
|---------------|----------|----------|-------------------------|
| `title`       | string   | Yes      | 1–200 characters        |
| `description` | string   | No       | Max 5000 characters     |
| `priority`    | string   | No       | `low`, `medium` (default), `high`, `critical` |
| `assigneeId`  | string   | No       | Valid user UUID         |
| `dueDate`     | string   | No       | ISO date                |

**Response 201:**
```json
{
  "task": {
    "id": "task-uuid-1",
    "projectId": "proj-uuid-1",
    "title": "Design landing page mockup",
    "description": "Create high-fidelity mockup in Figma",
    "status": "todo",
    "priority": "high",
    "assigneeId": "user-uuid-2",
    "dueDate": "2026-09-15",
    "createdBy": "user-uuid-1",
    "createdAt": "2026-09-03T12:00:00.000Z",
    "labels": []
  }
}
```

---

### 5.2 GET `/api/tf/organizations/:orgId/projects/:projectId/tasks`

**Description:** List all tasks in a project.

**Query Parameters:**
| Param        | Type   | Required | Description                           |
|--------------|--------|----------|---------------------------------------|
| `status`     | string | No       | Filter by status                      |
| `priority`   | string | No       | Filter by priority                    |
| `assigneeId` | string | No       | Filter by assignee                    |
| `labelId`    | string | No       | Filter by label                       |
| `search`     | string | No       | Search in title and description       |
| `sortBy`     | string | No       | `created_at` (default), `updated_at`, `priority`, `due_date` |
| `sortOrder`  | string | No       | `asc` (default), `desc`               |

**Response 200:**
```json
{
  "tasks": [
    {
      "id": "task-uuid-1",
      "title": "Design landing page mockup",
      "status": "todo",
      "priority": "high",
      "assigneeId": "user-uuid-2",
      "assigneeName": "Bob Smith",
      "dueDate": "2026-09-15",
      "labels": [
        { "id": "label-uuid-1", "name": "Design", "color": "#FF5733" }
      ],
      "createdAt": "2026-09-03T12:00:00.000Z"
    }
  ]
}
```

---

### 5.3 GET `/api/tf/organizations/:orgId/projects/:projectId/tasks/:taskId`

**Description:** Get task details.

**Response 200:**
```json
{
  "task": {
    "id": "task-uuid-1",
    "projectId": "proj-uuid-1",
    "title": "Design landing page mockup",
    "description": "Create high-fidelity mockup in Figma",
    "status": "todo",
    "priority": "high",
    "assigneeId": "user-uuid-2",
    "assigneeName": "Bob Smith",
    "dueDate": "2026-09-15",
    "createdBy": "user-uuid-1",
    "createdByName": "Alice Johnson",
    "labels": [
      { "id": "label-uuid-1", "name": "Design", "color": "#FF5733" }
    ],
    "createdAt": "2026-09-03T12:00:00.000Z",
    "updatedAt": "2026-09-03T12:00:00.000Z"
  }
}
```

---

### 5.4 PATCH `/api/tf/organizations/:orgId/projects/:projectId/tasks/:taskId`

**Description:** Update task details (partial update).

| Req Field     | Type     | Required | Validation              |
|---------------|----------|----------|-------------------------|
| `title`       | string   | No       | 1–200 characters        |
| `description` | string   | No       | Max 5000 characters     |
| `status`      | string   | No       | `todo`, `in_progress`, `in_review`, `done` |
| `priority`    | string   | No       | `low`, `medium`, `high`, `critical` |
| `assigneeId`  | string   | No       | Valid user UUID or `null` |
| `dueDate`     | string   | No       | ISO date or `null`      |

**Response 200:**
```json
{
  "task": { ... }
}
```

---

### 5.5 DELETE `/api/tf/organizations/:orgId/projects/:projectId/tasks/:taskId`

**Description:** Delete a task.

**Response 204:** No Content

---

## 6. Label Endpoints

### 6.1 POST `/api/tf/organizations/:orgId/projects/:projectId/labels`

**Description:** Create a label for a project.

| Req Field | Type     | Required | Validation                |
|-----------|----------|----------|---------------------------|
| `name`    | string   | Yes      | 1–50 characters           |
| `color`   | string   | Yes      | Valid hex color (e.g. `#FF5733`) |

**Response 201:**
```json
{
  "label": {
    "id": "label-uuid-1",
    "projectId": "proj-uuid-1",
    "name": "Design",
    "color": "#FF5733",
    "createdAt": "2026-09-03T12:00:00.000Z"
  }
}
```

---

### 6.2 GET `/api/tf/organizations/:orgId/projects/:projectId/labels`

**Description:** List all labels in a project.

**Response 200:**
```json
{
  "labels": [
    {
      "id": "label-uuid-1",
      "name": "Design",
      "color": "#FF5733",
      "taskCount": 5
    }
  ]
}
```

---

### 6.3 PATCH `/api/tf/organizations/:orgId/projects/:projectId/labels/:labelId`

**Description:** Update a label.

| Req Field | Type     | Required | Validation                |
|-----------|----------|----------|---------------------------|
| `name`    | string   | No       | 1–50 characters           |
| `color`   | string   | No       | Valid hex color           |

**Response 200:**
```json
{
  "label": { ... }
}
```

---

### 6.4 DELETE `/api/tf/organizations/:orgId/projects/:projectId/labels/:labelId`

**Description:** Delete a label. Removes all task-label associations.

**Response 204:** No Content

---

## 7. Task-Label Endpoints

### 7.1 POST `/api/tf/organizations/:orgId/projects/:projectId/tasks/:taskId/labels`

**Description:** Assign a label to a task.

| Req Field | Type     | Required | Validation      |
|-----------|----------|----------|-----------------|
| `labelId` | string   | Yes      | Valid label UUID |

**Response 201:**
```json
{
  "taskLabel": {
    "taskId": "task-uuid-1",
    "labelId": "label-uuid-1"
  }
}
```

**Error 409:**
```json
{
  "error": "Label already assigned to this task"
}
```

---

### 7.2 DELETE `/api/tf/organizations/:orgId/projects/:projectId/tasks/:taskId/labels/:labelId`

**Description:** Remove a label from a task.

**Response 204:** No Content

---

## 8. Activity Endpoints

### 8.1 GET `/api/tf/organizations/:orgId/projects/:projectId/activity`

**Description:** List activity for a project (paginated).

**Query Parameters:**
| Param    | Type   | Required | Description                |
|----------|--------|----------|----------------------------|
| `page`   | number | No       | Page number (default: 1)   |
| `limit`  | number | No       | Items per page (default: 50, max: 100) |

**Response 200:**
```json
{
  "activities": [
    {
      "id": "act-uuid-1",
      "projectId": "proj-uuid-1",
      "userId": "user-uuid-1",
      "userName": "Alice Johnson",
      "action": "task.created",
      "entityType": "task",
      "entityId": "task-uuid-1",
      "details": {
        "title": "Design landing page mockup"
      },
      "createdAt": "2026-09-03T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  }
}
```

---

## 9. Search Endpoints

### 9.1 GET `/api/tf/organizations/:orgId/search`

**Description:** Search tasks across all projects in an organization.

**Query Parameters:**
| Param   | Type   | Required | Description              |
|---------|--------|----------|--------------------------|
| `q`     | string | Yes      | Search query (min 2 chars) |
| `limit` | number | No       | Max results (default: 20) |

**Response 200:**
```json
{
  "results": [
    {
      "taskId": "task-uuid-1",
      "title": "Design landing page mockup",
      "projectId": "proj-uuid-1",
      "projectName": "Website Redesign",
      "status": "todo",
      "priority": "high",
      "assigneeName": "Bob Smith",
      "matchField": "title",
      "matchSnippet": "...<mark>Design</mark> landing page mockup..."
    }
  ],
  "total": 3
}
```

---

### 9.2 GET `/api/tf/organizations/:orgId/projects/:projectId/tasks` (with filters)

**Description:** Same as 5.2 but supports filtering. See §5.2 for parameters.

---

## 10. Dashboard Endpoints

### 10.1 GET `/api/tf/dashboard`

**Description:** Get dashboard statistics for the authenticated user.

**Response 200:**
```json
{
  "stats": {
    "totalProjects": 5,
    "totalTasks": 42,
    "tasksByStatus": {
      "todo": 12,
      "in_progress": 8,
      "in_review": 5,
      "done": 17
    },
    "myAssignedTasks": 8,
    "overdueTasks": 2
  }
}
```

---

### 10.2 GET `/api/tf/dashboard/activity`

**Description:** Get the 20 most recent activity events across user's projects.

**Response 200:**
```json
{
  "activities": [
    {
      "id": "act-uuid-1",
      "projectId": "proj-uuid-1",
      "projectName": "Website Redesign",
      "userId": "user-uuid-2",
      "userName": "Bob Smith",
      "action": "task.status_changed",
      "entityType": "task",
      "entityId": "task-uuid-1",
      "details": {
        "title": "Design landing page mockup",
        "from": "todo",
        "to": "in_progress"
      },
      "createdAt": "2026-09-03T12:00:00.000Z"
    }
  ]
}
```

---

## 11. Error Response Format (All Endpoints)

All error responses follow this structure:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {}
}
```

### Common Error Codes

| HTTP Status | Code                | Description                          |
|-------------|---------------------|--------------------------------------|
| 400         | `VALIDATION_ERROR`  | Request body validation failed       |
| 401         | `UNAUTHORIZED`      | Missing or invalid JWT               |
| 403         | `FORBIDDEN`         | Insufficient permissions             |
| 404         | `NOT_FOUND`         | Resource not found                   |
| 409         | `CONFLICT`          | Duplicate resource                   |
| 500         | `INTERNAL_ERROR`    | Unexpected server error              |
