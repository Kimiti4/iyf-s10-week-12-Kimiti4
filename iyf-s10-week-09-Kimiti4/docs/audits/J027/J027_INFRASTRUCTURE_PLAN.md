# J-027 Infrastructure Plan

## Deployment Architecture

```
                    ┌─────────────┐
                    │   Vercel     │
                    │  (Frontend)  │
                    │  React SPA   │
                    └──────┬──────┘
                           │ HTTPS
                           ▼
                    ┌─────────────┐
                    │  Railway     │
                    │  (Backend)   │
                    │  Express.js  │
                    └──────┬──────┘
                           │ SQL
                           ▼
                    ┌─────────────┐
                    │  Supabase    │
                    │  (Database)  │
                    │  PostgreSQL  │
                    └─────────────┘
```

## Required Accounts

| Provider | Purpose | CLI Required |
|---|---|---|
| Vercel | Frontend hosting | Optional (git-push auto-deploy) |
| Railway | Backend hosting | Optional (git-push auto-deploy) |
| Supabase | PostgreSQL database | No (dashboard for schema) |

## Environment Variables

### Backend (Railway)
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `JWT_SECRET` — Random 32+ char string for JWT signing
- `CORS_ORIGIN` — Frontend URL (e.g., `https://taskflow.vercel.app`)
- `PORT` — Set automatically by Railway
- `NODE_ENV` — `production`

### Frontend (Vercel)
- `VITE_API_URL` — Backend URL + `/api/tf` (e.g., `https://taskflow-backend.up.railway.app/api/tf`)

## Deployment Steps

1. Create Supabase project, run `schema.sql`
2. Deploy backend to Railway with env vars
3. Deploy frontend to Vercel with `VITE_API_URL`
4. Set CORS_ORIGIN on backend to match frontend URL
5. Verify health endpoint
6. Run J-027 verification suite
