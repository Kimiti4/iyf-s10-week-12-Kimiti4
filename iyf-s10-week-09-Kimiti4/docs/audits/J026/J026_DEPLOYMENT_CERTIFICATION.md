# J-026 Deployment Certification

## Audit Reference

| Field        | Value                                                                 |
|--------------|-----------------------------------------------------------------------|
| Audit ID     | J-026                                                                 |
| Product      | TaskFlow – Team Task & Project Management SaaS                        |
| See Also     | [J026_ARCHITECTURE.md](J026_ARCHITECTURE.md), [J026_SECURITY_BASELINE.md](J026_SECURITY_BASELINE.md) |

---

## 1. Deployment Summary

| Component       | Target Platform | Status                              |
|-----------------|-----------------|--------------------------------------|
| Frontend        | Vercel          | BUILD VERIFIED (deployment pending) |
| Backend         | Railway         | BUILD VERIFIED (deployment pending) |
| Database        | Supabase Postgres | Infrastructure setup pending       |

---

## 2. Frontend Deployment

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Build Tool            | Vite                                                                  |
| Build Command         | `npm run build`                                                       |
| Output Directory      | `dist/`                                                               |
| Target Platform       | Vercel                                                                |
| SPA Routing           | All routes serve `index.html` (Vite default)                         |
| Environment Variables | None required (API URL configured at runtime)                        |

### Build Verification

```bash
cd frontend
npm run build
# Output: dist/ directory created with index.html, assets/
```

| Check                             | Status |
|-----------------------------------|--------|
| `npm run build` succeeds          | PASS   |
| `dist/index.html` generated       | PASS   |
| `dist/assets/` contains JS/CSS    | PASS   |
| No build warnings                  | PASS   |

---

## 3. Backend Deployment

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Runtime               | Node.js 20.x                                                         |
| Framework             | Express.js                                                            |
| Entry Point           | `server.js`                                                           |
| Target Platform       | Railway                                                               |
| Port                  | Dynamic (`process.env.PORT`, default 3000)                           |

### Build Verification

```bash
cd backend
npm install
node server.js
# Server starts on port 3000
```

| Check                             | Status |
|-----------------------------------|--------|
| `npm install` succeeds            | PASS   |
| `node server.js` starts server    | PASS   |
| API responds at `/api/tf/`        | PASS   |
| Health check endpoint available   | PASS   |

---

## 4. Database

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Provider              | Supabase                                                              |
| Engine                | PostgreSQL                                                            |
| Schema Management     | Supabase Dashboard / SQL Editor                                      |
| Migrations            | Manual (Supabase SQL scripts)                                        |

### Required Tables

| Table                  | Description                                  |
|------------------------|----------------------------------------------|
| `users`                | User accounts (id, email, name, password_hash, created_at) |
| `organizations`        | Organizations (id, name, description, owner_id) |
| `organization_members` | Membership (user_id, org_id, role)           |
| `projects`             | Projects (id, org_id, name, status)          |
| `tasks`                | Tasks (id, project_id, title, status, priority, assignee_id) |
| `labels`               | Labels (id, project_id, name, color)         |
| `task_labels`          | Task-label associations (task_id, label_id)  |
| `activities`           | Activity log (id, project_id, user_id, action, entity_type, entity_id, details) |

---

## 5. Environment Variables

### 5.1 Backend Environment Variables

| Variable          | Required | Description                              | Example                              |
|-------------------|----------|------------------------------------------|--------------------------------------|
| `DATABASE_URL`    | Yes      | Supabase Postgres connection string      | `postgresql://user:pass@host:5432/db`|
| `JWT_SECRET`      | Yes      | Secret key for JWT signing               | `your-256-bit-secret`               |
| `CORS_ORIGIN`     | Yes      | Allowed frontend origin                  | `https://taskflow.vercel.app`        |
| `NODE_ENV`        | Yes      | Environment mode                         | `production`                         |
| `PORT`            | No       | Server port (default: 3000)              | `3000`                               |

### 5.2 Frontend Environment Variables

| Variable            | Required | Description                              | Example                              |
|---------------------|----------|------------------------------------------|--------------------------------------|
| `VITE_API_URL`      | Yes      | Backend API base URL                     | `https://taskflow-api.railway.app`   |

---

## 6. `.env.example`

```env
# Backend (.env)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
JWT_SECRET=your-256-bit-secret-here
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
PORT=3000

# Frontend (.env)
VITE_API_URL=http://localhost:3000/api/tf
```

---

## 7. Deployment Steps

### 7.1 Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set build command: `cd frontend && npm install && npm run build`
3. Set output directory: `frontend/dist`
4. Add environment variable: `VITE_API_URL=https://taskflow-api.railway.app`
5. Deploy

### 7.2 Backend (Railway)

1. Connect GitHub repository to Railway
2. Set root directory: `backend`
3. Add environment variables (see §5.1)
4. Railway auto-detects Node.js and runs `npm install && node server.js`
5. Deploy

### 7.3 Database (Supabase)

1. Create new Supabase project
2. Run SQL scripts to create tables
3. Copy connection string to `DATABASE_URL` env var
4. Configure Row Level Security (RLS) policies

---

## 8. Acceptance Criteria

| # | Criterion                                            | Status |
|---|------------------------------------------------------|--------|
| 1 | Frontend builds to `dist/` via `npm run build`       | PASS   |
| 2 | Backend starts via `node server.js`                  | PASS   |
| 3 | Database schema defined (Supabase Postgres)          | PASS   |
| 4 | All environment variables documented in `.env.example`| PASS  |
| 5 | Deployment targets identified (Vercel, Railway, Supabase) | PASS |
| 6 | Build verified for both frontend and backend         | PASS   |

---

## 9. Status

**BUILD VERIFIED** — Both frontend and backend build successfully. Deployment pending human infrastructure setup (Supabase project creation, Vercel/Railway account configuration, environment variable provisioning).
