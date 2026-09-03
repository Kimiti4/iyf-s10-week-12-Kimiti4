# J-027 Deployment Configuration Files

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Vercel    │      │   Render    │      │  Supabase   │
│  Frontend   │─────▶│  Backend    │─────▶│  Postgres   │
│  (React)    │      │  (Express)  │      │  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
```

---

## Files Requiring Manual Configuration

### 1. Frontend: Vercel Environment Variables

**File:** `products/taskflow/frontend/vercel.json` (already created)
**Set in:** Vercel Dashboard → Project → Settings → Environment Variables

| Variable | Value | Scope |
|---|---|---|
| `VITE_API_URL` | `https://taskflow-api.onrender.com/api/tf` | Production, Preview |

**Build settings (Vercel auto-detects from vercel.json):**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Root Directory: `products/taskflow/frontend`

**Manual step:** After first deploy, copy the Vercel URL and set it as `CORS_ORIGIN` in Render.

---

### 2. Backend: Render Environment Variables

**File:** `products/taskflow/backend/render.yaml` (already created)
**Set in:** Render Dashboard → Service → Environment → Environment Variables

| Variable | Example Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Auto-set by Render |
| `PORT` | `10000` | Auto-set by Render |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` | **MANUAL** — from Supabase |
| `JWT_SECRET` | (random 32+ char string) | **MANUAL** — generate with `openssl rand -base64 32` |
| `CORS_ORIGIN` | `https://taskflow-frontend.vercel.app` | **MANUAL** — from Vercel URL |
| `SUPABASE_URL` | `https://xxx.supabase.co` | **MANUAL** — from Supabase project |
| `SUPABASE_KEY` | (anon or service key) | **MANUAL** — from Supabase project |

**Build settings (Render reads from render.yaml):**
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: `products/taskflow/backend`
- Health Check Path: `/api/tf/health`

**Manual step:** After Render deploys, get the service URL and set it as `VITE_API_URL` in Vercel.

---

### 3. Database: Supabase

**File:** `products/taskflow/backend/src/db/schema.sql` (already exists)

**Manual steps in Supabase Dashboard:**
1. Create new project
2. Go to SQL Editor
3. Paste and run `products/taskflow/backend/src/db/schema.sql`
4. Go to Project Settings → Database → Connection String (URI mode)
5. Copy the connection string → paste as `DATABASE_URL` in Render
6. Go to Project Settings → API
7. Copy Project URL → paste as `SUPABASE_URL` in Render
8. Copy anon key → paste as `SUPABASE_KEY` in Render

**Optional:** Run `products/taskflow/backend/src/db/seed.sql` for demo data.

---

## Deployment Order

```
Step 1: Supabase (create project + run schema.sql)
        ↓ produces DATABASE_URL, SUPABASE_URL, SUPABASE_KEY

Step 2: Render (deploy backend)
        ↓ uses DATABASE_URL, SUPABASE_URL, SUPABASE_KEY
        → produce backend URL

Step 3: Vercel (deploy frontend)
        ↓ uses VITE_API_URL = backend URL
        → produce frontend URL

Step 4: Render (update CORS_ORIGIN)
        ↓ uses CORS_ORIGIN = frontend URL
        → redeploy

Step 5: Verify
        → npm run j027:preflight (should be READY)
        → npm run j027:deploy
        → npm run j027:verify
        → npm run j027:certify
```

---

## Build & Output Settings Summary

### Frontend (Vercel)
| Setting | Value |
|---|---|
| Root Directory | `products/taskflow/frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node Version | 18+ |
| Framework | Vite (auto-detected) |

### Backend (Render)
| Setting | Value |
|---|---|
| Root Directory | `products/taskflow/backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check | `/api/tf/health` |
| Node Version | 18+ |
| Plan | Starter (free tier OK) |

### Database (Supabase)
| Setting | Value |
|---|---|
| Engine | PostgreSQL 15 |
| Region | Same as Render (for low latency) |
| Connection Pooling | Transaction mode (port 6543) for serverless |
| Direct Connection | Session mode (port 5432) for migrations |

---

## File Checklist

### Auto-created (no manual edit needed)
- [x] `products/taskflow/frontend/.env.example`
- [x] `products/taskflow/frontend/vercel.json`
- [x] `products/taskflow/backend/render.yaml`
- [x] `products/taskflow/backend/.env.example`
- [x] `products/taskflow/backend/src/db/schema.sql`
- [x] `products/taskflow/backend/src/db/seed.sql`
- [x] `products/taskflow/deployment/deployment-contract.json`

### Files YOU must manually fill (secrets only)
- [ ] **Supabase Dashboard** → copy `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_KEY` → paste into Render
- [ ] **Render Dashboard** → paste `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `SUPABASE_URL`, `SUPABASE_KEY`
- [ ] **Vercel Dashboard** → set `VITE_API_URL` to Render backend URL

### Files that auto-generate (don't commit)
- [ ] `.env` (local dev only — never commit)
- [ ] `.env.production` (local only — never commit)

---

## Quick Reference: Where to Put Each Secret

```
┌─────────────────┬──────────────────────────────────────────────────┐
│ Secret          │ Where to set it                                  │
├─────────────────┼──────────────────────────────────────────────────┤
│ DATABASE_URL    │ Render env vars (from Supabase)                 │
│ JWT_SECRET      │ Render env vars (generate locally)              │
│ CORS_ORIGIN     │ Render env vars (from Vercel URL)               │
│ SUPABASE_URL    │ Render env vars (from Supabase)                 │
│ SUPABASE_KEY    │ Render env vars (from Supabase)                 │
│ VITE_API_URL    │ Vercel env vars (from Render URL)               │
└─────────────────┴──────────────────────────────────────────────────┘
```

**Rule: Never put secrets in vercel.json, render.yaml, or any committed file.**
