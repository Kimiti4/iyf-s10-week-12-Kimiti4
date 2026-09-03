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

| Variable | Where to get it in Supabase Dashboard |
|---|---|
| `DATABASE_URL` | **Connect** → **Connection string** → **URI** |
| `SUPABASE_URL` | **Settings → API Keys** → **Project URL** (or **Connect**) |
| `SUPABASE_KEY` | **Settings → API Keys** → **Secret key** (`sb_secret_...`) |
| `JWT_SECRET` | Generate locally: `openssl rand -base64 32` |
| `CORS_ORIGIN` | Your Vercel URL (e.g., `https://taskflow-frontend.vercel.app`) |

**IMPORTANT: Which Supabase key to use?**

The backend runs **server-side** and needs to perform operations on behalf of users. Per Supabase's current recommendations:

- **Backend/server code** → use the **Secret key** (`sb_secret_...`)
  - Found in: **Settings → API Keys**
  - This key has elevated privileges and bypasses Row Level Security
  - **Never expose this to the browser**
- **Frontend/browser code** → use the **Publishable key** (`sb_publishable_...`)
  - This key respects RLS and is safe for browser use
  - TaskFlow's backend acts as the trusted server, so it needs the Secret key

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
2. Go to **SQL Editor**
3. Paste and run `products/taskflow/backend/src/db/schema.sql`
4. Click **Connect** (top of dashboard)
5. **Connection string** section → select **URI** → copy → this is `DATABASE_URL`
6. Go to **Settings → API Keys**
7. Copy **Project URL** → this is `SUPABASE_URL`
8. Copy **Secret key** (`sb_secret_...`) → this is `SUPABASE_KEY`
   - **Do NOT use the Publishable key for the backend** — it respects RLS and will fail most operations
9. Paste all three into Render env vars

**Optional:** Run `products/taskflow/backend/src/db/seed.sql` for demo data.

**Note:** Supabase now recommends the newer **Publishable key** and **Secret key** instead of the legacy `anon` and `service_role` keys. The new keys are prefixed `sb_publishable_` and `sb_secret_` respectively.

---

## Deployment Order

```
Step 1: Supabase (create project + run schema.sql)
        ↓ produces DATABASE_URL, SUPABASE_URL, SUPABASE_KEY (Secret)

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

### Where to get each value (your references are correct)

| Secret | Supabase location | Render var name |
|---|---|---|
| `DATABASE_URL` | **Connect** → **Connection string** → **URI** | `DATABASE_URL` |
| `SUPABASE_URL` | **Settings → API Keys** → **Project URL** | `SUPABASE_URL` |
| `SUPABASE_KEY` | **Settings → API Keys** → **Secret key** (`sb_secret_...`) | `SUPABASE_KEY` |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` | `JWT_SECRET` |
| `CORS_ORIGIN` | Your Vercel URL | `CORS_ORIGIN` |
| `VITE_API_URL` | Your Render URL | (set in Vercel, not Render) |

### Files that auto-generate (don't commit)
- [ ] `.env` (local dev only — never commit)
- [ ] `.env.production` (local only — never commit)

---

## Quick Reference: Where to Put Each Secret

```
┌─────────────────┬──────────────────────────────────────────────────┐
│ Secret          │ Where to set it                                  │
├─────────────────┼──────────────────────────────────────────────────┤
│ DATABASE_URL    │ Render env vars (from Supabase Connect → URI)   │
│ SUPABASE_URL    │ Render env vars (from Supabase Settings → API)  │
│ SUPABASE_KEY    │ Render env vars (Secret key sb_secret_...)       │
│ JWT_SECRET      │ Render env vars (generate locally)              │
│ CORS_ORIGIN     │ Render env vars (from Vercel URL)               │
│ VITE_API_URL    │ Vercel env vars (from Render URL)               │
└─────────────────┴──────────────────────────────────────────────────┘
```

**Rule: Never put secrets in vercel.json, render.yaml, or any committed file.**

---

## Verification After Deployment

```bash
# Set verification URLs in your environment
export TASKFLOW_FRONTEND_URL=https://your-app.vercel.app
export TASKFLOW_BACKEND_URL=https://taskflow-api.onrender.com

# Run the J-027 suite
npm run j027:preflight   # should be READY (not BLOCKED)
npm run j027:verify      # smoke + API contract + authz + security
npm run j027:certify     # gate-matrix.txt with all gates
```

Expected gate-matrix.txt result after successful deployment:
- G04, G05: PASS (env vars + DB configured)
- G06, G07: PASS (backend + frontend deployed)
- G08–G15: PASS (live verification suites pass)
- G16–G19: PASS (already passing locally)
- G22: PASS (production journeys pass)

**Verdict:** `CERTIFIED` or `CERTIFIED_WITH_WARNINGS` (if any non-critical issues remain)
