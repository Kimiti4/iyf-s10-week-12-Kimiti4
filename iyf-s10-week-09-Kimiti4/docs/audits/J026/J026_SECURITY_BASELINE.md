# J-026 Security Baseline

## Audit Reference

| Field        | Value                                                                 |
|--------------|-----------------------------------------------------------------------|
| Audit ID     | J-026                                                                 |
| Product      | TaskFlow – Team Task & Project Management SaaS                        |
| See Also     | [J026_ARCHITECTURE.md](J026_ARCHITECTURE.md), [J026_API_CONTRACT.md](J026_API_CONTRACT.md) |

---

## 1. Security Summary

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Status                | **BASELINE SECURITY VERIFICATION**                                   |
| Auth Mechanism        | JWT (JSON Web Tokens)                                                 |
| Password Hashing      | bcrypt (cost factor 10)                                              |
| Database              | Supabase Postgres (parameterized queries)                            |
| Secrets Management    | Environment variables (no client exposure)                           |

---

## 2. Authentication & Authorization

### 2.1 JWT Authentication

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Algorithm             | HS256 (HMAC-SHA256)                                                  |
| Expiry                | 24 hours                                                              |
| Storage               | Client localStorage (httpOnly cookie recommended for production)      |
| Refresh               | Not implemented (re-login required)                                  |
| Token Format          | `Bearer <token>` in `Authorization` header                           |

### 2.2 Password Hashing

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Algorithm             | bcrypt                                                                |
| Cost Factor           | 10                                                                    |
| Salt                  | Automatic (bcrypt-generated)                                         |
| Min Password Length   | 8 characters                                                          |
| Complexity            | 1 uppercase, 1 lowercase, 1 digit                                    |

### 2.3 Authorization

| Role        | Permissions                                                       |
|-------------|-------------------------------------------------------------------|
| Owner       | Full control: manage members, delete org, all CRUD                |
| Admin       | Manage members, create/edit projects, all task operations         |
| Member      | Create/edit tasks, view projects, limited label management        |
| Viewer      | Read-only access to projects and tasks                            |

Authorization is enforced on every endpoint via middleware that verifies the JWT and checks the user's role within the target organization.

---

## 3. Input Validation

| Endpoint Category       | Validation                                       | Status |
|-------------------------|--------------------------------------------------|--------|
| Auth endpoints          | Email format, password complexity, name length   | PASS   |
| Organization endpoints  | Name length, description length                  | PASS   |
| Project endpoints       | Name length, date format, status enum            | PASS   |
| Task endpoints          | Title length, priority enum, status enum         | PASS   |
| Label endpoints         | Name length, hex color format                    | PASS   |
| Search endpoints        | Min query length (2 chars), limit bounds         | PASS   |

All validation errors return HTTP 400 with structured error details (see [J026_API_CONTRACT.md](J026_API_CONTRACT.md) §11).

---

## 4. SQL Injection Prevention

| Mechanism                 | Implementation                                  | Status |
|---------------------------|--------------------------------------------------|--------|
| Parameterized queries     | Supabase client uses parameterized queries       | PASS   |
| ORM abstraction           | Supabase PostgREST (no raw SQL in app code)     | PASS   |
| Input sanitization        | Validation before query execution               | PASS   |
| No string concatenation   | Verified across all backend route files          | PASS   |

---

## 5. CORS Configuration

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Configurable          | Yes — via `CORS_ORIGIN` environment variable                         |
| Default               | `http://localhost:5173` (Vite dev server)                             |
| Production            | Set to deployed frontend domain                                       |
| Credentials           | Enabled (`credentials: true`)                                         |

---

## 6. Secrets Management

| Secret              | Stored In                | Client-Visible | Status |
|---------------------|--------------------------|----------------|--------|
| `DATABASE_URL`      | Backend env              | No             | PASS   |
| `JWT_SECRET`        | Backend env              | No             | PASS   |
| `CORS_ORIGIN`       | Backend env              | No             | PASS   |
| `SUPABASE_URL`      | Backend env              | No             | PASS   |
| `SUPABASE_KEY`      | Backend env              | No             | PASS   |

No secrets are embedded in the frontend bundle. The frontend communicates only with the backend API via HTTP.

---

## 7. Security Headers (Recommended for Production)

| Header                          | Recommended Value                              | Priority |
|---------------------------------|------------------------------------------------|----------|
| `Strict-Transport-Security`     | `max-age=31536000; includeSubDomains`          | High     |
| `X-Content-Type-Options`        | `nosniff`                                      | High     |
| `X-Frame-Options`              | `DENY`                                         | High     |
| `Content-Security-Policy`       | Restrictive policy for SPA                     | Medium   |
| `Referrer-Policy`              | `strict-origin-when-cross-origin`              | Medium   |

> **Note:** These headers should be configured at the hosting layer (Vercel/Railway) or via Express middleware before production deployment.

---

## 8. Rate Limiting

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Current Status        | Not implemented                                                       |
| Recommendation        | Implement rate limiting (e.g., `express-rate-limit`) before production |
| Suggested Limits      | Auth endpoints: 5 req/min; API endpoints: 100 req/min                |
| Impact                | Prevents brute-force attacks on login and API abuse                   |

---

## 9. Known Security Considerations

| Item                                          | Severity | Recommendation                              |
|-----------------------------------------------|----------|---------------------------------------------|
| Rate limiting not implemented                 | High     | Add `express-rate-limit` before production  |
| No CSRF protection                            | Medium   | Consider CSRF tokens for cookie-based auth  |
| JWT stored in localStorage                    | Medium   | Consider httpOnly cookies                   |
| No HTTPS enforcement                          | Medium   | Configure at hosting layer                  |
| No security headers                           | Low      | Add via Express middleware or hosting       |

---

## 10. Acceptance Criteria

| # | Criterion                                            | Status |
|---|------------------------------------------------------|--------|
| 1 | JWT authentication with 24h expiry                   | PASS   |
| 2 | bcrypt password hashing (cost 10)                    | PASS   |
| 3 | CORS configurable via environment                    | PASS   |
| 4 | Input validation on all endpoints                    | PASS   |
| 5 | SQL injection prevention (parameterized queries)     | PASS   |
| 6 | No secrets in client bundle                          | PASS   |
| 7 | Authorization enforced per-role                      | PASS   |
| 8 | Rate limiting recommended for production             | RECOMMENDED |

---

## 11. Status

**BASELINE SECURITY VERIFICATION** — Core security controls implemented. Rate limiting and security headers recommended before production deployment.
