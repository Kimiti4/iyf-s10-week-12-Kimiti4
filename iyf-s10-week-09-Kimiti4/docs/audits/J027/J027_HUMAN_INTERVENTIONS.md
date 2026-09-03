# J-027 Human Interventions

| # | Timestamp | Reason | Action | Credentials involved? | Automatable later? |
|---|-----------|--------|--------|----------------------|--------------------|
| 1 | 2026-09-03 | PROVIDER_AUTHORIZATION | Vercel account must be connected for frontend deployment | yes (outside repo) | partial |
| 2 | 2026-09-03 | PROVIDER_AUTHORIZATION | Railway account must be connected for backend deployment | yes (outside repo) | partial |
| 3 | 2026-09-03 | DATABASE_PROVISIONING | Supabase project must be created and schema deployed | yes (dashboard) | yes (via API) |
| 4 | 2026-09-03 | SECRETS_CONFIGURATION | DATABASE_URL, JWT_SECRET, CORS_ORIGIN must be set in Railway | yes (secrets) | no (by design) |

Rule: record action and reason only. Never record secret values.
