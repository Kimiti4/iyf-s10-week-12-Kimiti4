# J-026 Domain Model

## Audit Reference

| Field        | Value                                                                 |
|--------------|-----------------------------------------------------------------------|
| Audit ID     | J-026                                                                 |
| Product      | TaskFlow – Team Task & Project Management SaaS                        |
| See Also     | [J026_REQUIREMENTS.md](J026_REQUIREMENTS.md), [J026_ARCHITECTURE.md](J026_ARCHITECTURE.md) |

---

## 1. Entity Overview

| Entity         | Description                                        | Table Name     |
|----------------|----------------------------------------------------|----------------|
| User           | Registered user with email and profile             | `users`        |
| Organization   | Top-level team/workspace container                 | `organizations`|
| Membership     | Links a user to an organization with a role        | `memberships`  |
| Project        | A project within an organization                   | `projects`     |
| Task           | A unit of work within a project                    | `tasks`        |
| Label          | A colored tag for categorizing tasks               | `labels`       |
| TaskLabel      | Junction table linking tasks to labels             | `task_labels`  |
| Activity       | Audit log entry for project events                 | `activities`   |
| Invitation     | Pending org invite for unregistered users          | `invitations`  |

---

## 2. Entity Definitions

### 2.1 User

| Column     | Type                     | Constraints                        | Description                |
|------------|--------------------------|------------------------------------|----------------------------|
| `id`       | UUID (PK)                | `DEFAULT gen_random_uuid()`       | Unique identifier          |
| `email`    | VARCHAR(255)             | `UNIQUE, NOT NULL`                | Login email (case-insensitive) |
| `password` | VARCHAR(255)             | `NOT NULL`                        | Bcrypt hashed password     |
| `name`     | VARCHAR(100)             | `NOT NULL`                        | Display name               |
| `avatar`   | TEXT                     | `NULL`                            | Avatar URL                 |
| `created_at` | TIMESTAMPTZ           | `DEFAULT now()`                   | Account creation time      |
| `updated_at` | TIMESTAMPTZ           | `DEFAULT now()`                   | Last profile update        |

---

### 2.2 Organization

| Column        | Type                     | Constraints                        | Description                |
|---------------|--------------------------|------------------------------------|----------------------------|
| `id`          | UUID (PK)                | `DEFAULT gen_random_uuid()`       | Unique identifier          |
| `name`        | VARCHAR(100)             | `NOT NULL`                        | Organization name          |
| `description` | TEXT                     | `NULL`                            | Optional description       |
| `owner_id`    | UUID (FK → users.id)    | `NOT NULL`                        | Creator/owner              |
| `created_at`  | TIMESTAMPTZ              | `DEFAULT now()`                   | Creation timestamp         |
| `updated_at`  | TIMESTAMPTZ              | `DEFAULT now()`                   | Last update timestamp      |

---

### 2.3 Membership

| Column           | Type                     | Constraints                        | Description                |
|------------------|--------------------------|------------------------------------|----------------------------|
| `id`             | UUID (PK)                | `DEFAULT gen_random_uuid()`       | Unique identifier          |
| `user_id`        | UUID (FK → users.id)    | `NOT NULL`                        | Member user                |
| `organization_id`| UUID (FK → organizations.id) | `NOT NULL`                   | Parent organization        |
| `role`           | VARCHAR(20)              | `NOT NULL, DEFAULT 'member'`      | `owner`, `admin`, `member`, `viewer` |
| `created_at`     | TIMESTAMPTZ              | `DEFAULT now()`                   | Membership created         |

**Constraints:**
- `UNIQUE(user_id, organization_id)` – one membership per user per org

---

### 2.4 Project

| Column           | Type                     | Constraints                        | Description                |
|------------------|--------------------------|------------------------------------|----------------------------|
| `id`             | UUID (PK)                | `DEFAULT gen_random_uuid()`       | Unique identifier          |
| `organization_id`| UUID (FK → organizations.id) | `NOT NULL`                   | Parent organization        |
| `name`           | VARCHAR(120)             | `NOT NULL`                        | Project name               |
| `description`    | TEXT                     | `NULL`                            | Optional description       |
| `status`         | VARCHAR(20)              | `NOT NULL, DEFAULT 'active'`      | `active` or `archived`     |
| `start_date`     | DATE                     | `NULL`                            | Optional planned start     |
| `end_date`       | DATE                     | `NULL`                            | Optional planned end       |
| `created_by`     | UUID (FK → users.id)    | `NOT NULL`                        | Creator                    |
| `created_at`     | TIMESTAMPTZ              | `DEFAULT now()`                   | Creation timestamp         |
| `updated_at`     | TIMESTAMPTZ              | `DEFAULT now()`                   | Last update timestamp      |

---

### 2.5 Task

| Column           | Type                     | Constraints                        | Description                |
|------------------|--------------------------|------------------------------------|----------------------------|
| `id`             | UUID (PK)                | `DEFAULT gen_random_uuid()`       | Unique identifier          |
| `project_id`     | UUID (FK → projects.id) | `NOT NULL`                        | Parent project             |
| `title`          | VARCHAR(200)             | `NOT NULL`                        | Task title                 |
| `description`    | TEXT                     | `NULL`                            | Detailed description       |
| `status`         | VARCHAR(20)              | `NOT NULL, DEFAULT 'todo'`        | `todo`, `in_progress`, `in_review`, `done` |
| `priority`       | VARCHAR(10)              | `NOT NULL, DEFAULT 'medium'`      | `low`, `medium`, `high`, `critical` |
| `assignee_id`    | UUID (FK → users.id)    | `NULL`                            | Assigned user (nullable)   |
| `due_date`       | DATE                     | `NULL`                            | Optional due date          |
| `created_by`     | UUID (FK → users.id)    | `NOT NULL`                        | Task creator               |
| `created_at`     | TIMESTAMPTZ              | `DEFAULT now()`                   | Creation timestamp         |
| `updated_at`     | TIMESTAMPTZ              | `DEFAULT now()`                   | Last update timestamp      |

**Constraints:**
- `CHECK(status IN ('todo', 'in_progress', 'in_review', 'done'))`
- `CHECK(priority IN ('low', 'medium', 'high', 'critical'))`

---

### 2.6 Label

| Column           | Type                     | Constraints                        | Description                |
|------------------|--------------------------|------------------------------------|----------------------------|
| `id`             | UUID (PK)                | `DEFAULT gen_random_uuid()`       | Unique identifier          |
| `project_id`     | UUID (FK → projects.id) | `NOT NULL`                        | Parent project             |
| `name`           | VARCHAR(50)              | `NOT NULL`                        | Label display name         |
| `color`          | VARCHAR(7)               | `NOT NULL`                        | Hex color code (e.g. `#FF5733`) |
| `created_at`     | TIMESTAMPTZ              | `DEFAULT now()`                   | Creation timestamp         |

**Constraints:**
- `UNIQUE(project_id, name)` – unique label name per project

---

### 2.7 TaskLabel (Junction)

| Column     | Type                     | Constraints                        | Description          |
|------------|--------------------------|------------------------------------|----------------------|
| `task_id`  | UUID (FK → tasks.id)    | `NOT NULL`                        | Task reference       |
| `label_id` | UUID (FK → labels.id)   | `NOT NULL`                        | Label reference      |

**Constraints:**
- `PRIMARY KEY(task_id, label_id)` – composite PK
- `ON DELETE CASCADE` on both foreign keys

---

### 2.8 Activity

| Column           | Type                     | Constraints                        | Description                |
|------------------|--------------------------|------------------------------------|----------------------------|
| `id`             | UUID (PK)                | `DEFAULT gen_random_uuid()`       | Unique identifier          |
| `project_id`     | UUID (FK → projects.id) | `NOT NULL`                        | Parent project             |
| `user_id`        | UUID (FK → users.id)    | `NOT NULL`                        | User who performed action  |
| `action`         | VARCHAR(50)              | `NOT NULL`                        | Event type (see below)     |
| `entity_type`    | VARCHAR(30)              | `NOT NULL`                        | `task`, `project`, `member`, `label` |
| `entity_id`      | UUID                     | `NOT NULL`                        | ID of affected entity      |
| `details`        | JSONB                    | `NULL`                            | Additional event metadata  |
| `created_at`     | TIMESTAMPTZ              | `DEFAULT now()`                   | Event timestamp            |

**Action Types:**
- `task.created`, `task.updated`, `task.status_changed`, `task.assigned`, `task.label_added`, `task.label_removed`, `task.deleted`
- `project.created`, `project.updated`, `project.archived`, `project.deleted`
- `member.added`, `member.role_changed`, `member.removed`
- `label.created`, `label.deleted`

---

### 2.9 Invitation

| Column           | Type                     | Constraints                        | Description                |
|------------------|--------------------------|------------------------------------|----------------------------|
| `id`             | UUID (PK)                | `DEFAULT gen_random_uuid()`       | Unique identifier          |
| `organization_id`| UUID (FK → organizations.id) | `NOT NULL`                   | Target organization        |
| `email`          | VARCHAR(255)             | `NOT NULL`                        | Invitee email              |
| `role`           | VARCHAR(20)              | `NOT NULL, DEFAULT 'member'`      | Assigned role               |
| `invited_by`     | UUID (FK → users.id)    | `NOT NULL`                        | Who sent the invite        |
| `status`         | VARCHAR(20)              | `NOT NULL, DEFAULT 'pending'`     | `pending`, `accepted`, `expired` |
| `created_at`     | TIMESTAMPTZ              | `DEFAULT now()`                   | Invitation created         |
| `expires_at`     | TIMESTAMPTZ              | `NOT NULL`                        | Expiration (7 days default) |

**Constraints:**
- `UNIQUE(organization_id, email)` – one pending invite per email per org

---

## 3. Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│     User     │──────<│    Membership     │>──────│ Organization │
│              │       │                  │       │              │
│ id (PK)      │       │ user_id (FK)     │       │ id (PK)      │
│ email        │       │ organization_id  │       │ name         │
│ password     │       │ role             │       │ owner_id(FK) │
│ name         │       └──────────────────┘       │ description  │
│ avatar       │                                   └──────┬───────┘
│ created_at   │                                          │
│ updated_at   │                                          │
└──────┬───────┘                                          │
       │                                                  │
       │  ┌───────────────────────────────────────────────┘
       │  │
       │  │  ┌──────────────┐
       │  │  │   Project    │
       │  │  │              │
       │  └─>│ id (PK)      │
       │     │ org_id (FK)  │
       │     │ name         │
       │     │ status       │
       │     │ created_by   │<─── User
       │     └──────┬───────┘
       │            │
       │            │  ┌──────────────┐
       │            │  │    Task      │
       │            │  │              │
       │            └─>│ id (PK)      │
       │               │ project_id   │
       │               │ title        │
       │               │ status       │
       │               │ priority     │
       │               │ assignee_id  │<─── User
       │               │ created_by   │<─── User
       │               └──┬───┬───────┘
       │                  │   │
       │                  │   │  ┌──────────────┐
       │                  │   │  │  TaskLabel   │
       │                  │   │  │              │
       │                  │   └─>│ task_id (FK) │
       │                  │     │ label_id(FK) │
       │                  │     └──────┬───────┘
       │                  │            │
       │                  │     ┌──────┴───────┐
       │                  │     │    Label     │
       │                  │     │              │
       │                  │     │ id (PK)      │
       │                  │     │ project_id   │
       │                  │     │ name         │
       │                  │     │ color        │
       │                  │     └──────────────┘
       │                  │
       │            ┌─────┴────────┐
       │            │  Activity    │
       │            │              │
       └───────────>│ id (PK)      │
                    │ project_id   │
                    │ user_id      │
                    │ action       │
                    │ entity_type  │
                    │ entity_id    │
                    │ details      │
                    │ created_at   │
                    └──────────────┘
```

---

## 4. Key Relationships

| Relationship            | Type          | Description                              |
|-------------------------|---------------|------------------------------------------|
| User → Membership       | One-to-Many   | A user can belong to many organizations  |
| Organization → Membership | One-to-Many | An org has many members                   |
| Organization → Project  | One-to-Many   | An org contains many projects             |
| Project → Task          | One-to-Many   | A project has many tasks                  |
| User → Task (assignee)  | One-to-Many   | A user can be assigned many tasks         |
| Project → Label         | One-to-Many   | A project has many labels                 |
| Task ↔ Label            | Many-to-Many  | Tasks and labels via TaskLabel junction   |
| Project → Activity      | One-to-Many   | A project has many activity records       |
| User → Activity         | One-to-Many   | A user generates many activity events     |
| Organization → Invitation | One-to-Many | An org has many pending invitations       |

---

## 5. Cascade Rules

| Parent Entity   | Child Entity   | Delete Action        |
|-----------------|----------------|----------------------|
| Organization    | Membership     | CASCADE              |
| Organization    | Project        | CASCADE              |
| Project         | Task           | CASCADE              |
| Project         | Label          | CASCADE              |
| Project         | Activity       | CASCADE              |
| Task            | TaskLabel      | CASCADE              |
| Label           | TaskLabel      | CASCADE              |
| User            | Membership     | CASCADE              |
| User            | Task (assignee)| SET NULL             |
| User            | Task (creator) | RESTRICT / keep record |
| User            | Activity       | CASCADE              |

---

## 6. Indexes

| Table        | Index Name                          | Columns              | Purpose                    |
|--------------|-------------------------------------|----------------------|----------------------------|
| users        | `idx_users_email`                   | `email`              | Login lookup (unique)      |
| memberships  | `idx_memberships_user_org`          | `user_id, org_id`    | Membership check           |
| memberships  | `idx_memberships_org`               | `organization_id`    | Org member listing         |
| projects     | `idx_projects_org`                  | `organization_id`    | Org project listing        |
| tasks        | `idx_tasks_project`                 | `project_id`         | Project task listing       |
| tasks        | `idx_tasks_assignee`                | `assignee_id`        | User task queries          |
| tasks        | `idx_tasks_status`                  | `status`             | Status-based filtering     |
| tasks        | `idx_tasks_priority`                | `priority`           | Priority filtering         |
| labels       | `idx_labels_project`                | `project_id`         | Project label listing      |
| task_labels  | `idx_task_labels_task`              | `task_id`            | Task label lookup          |
| task_labels  | `idx_task_labels_label`             | `label_id`           | Label task lookup          |
| activities   | `idx_activities_project`            | `project_id, created_at` | Project activity feed  |
| invitations  | `idx_invitations_org_email`         | `organization_id, email` | Invite uniqueness      |
