# JamiiLink — Production Certification Checklist

This checklist is intentionally separate from automated CI. CI proves repository-level behavior; this checklist records what must be verified against the actual production environment.

## Automated gates

- [x] Frontend dependency installation
- [x] Frontend production build
- [x] Browser E2E/UI suite
- [x] Accessibility/Lighthouse checks
- [x] Backend dependency installation
- [x] PostgreSQL test service
- [x] Database migrations
- [x] Backend API contract/authorization tests
- [x] Rate-limiter tests
- [x] Backend startup
- [x] Live backend health check

## Production environment gates

- [ ] Frontend deployed URL confirmed
- [ ] Backend deployed URL confirmed
- [ ] Frontend `VITE_API_URL` points to the production API
- [ ] Backend `CORS_ORIGIN` exactly matches the production frontend origin
- [ ] Production `DATABASE_URL` is configured without exposing credentials in logs or source
- [ ] Strong production `JWT_SECRET` configured and not reused from development/CI
- [ ] Authentication tested against the real production database
- [ ] Authorization tested with two distinct users
- [ ] Post CRUD tested end-to-end against production persistence
- [ ] Search tested against persisted production data
- [ ] Profile/history flows tested
- [ ] Upload flow tested if enabled
- [ ] Alerts/verification flow tested if enabled
- [ ] Socket.IO tested if realtime is a release requirement
- [ ] Email/SMS integrations tested if enabled
- [ ] Error responses do not expose secrets, SQL, stack traces, or credentials
- [ ] Production logs/monitoring confirmed
- [ ] Rollback procedure confirmed

## Certification rule

Do not mark JamiiLink **production certified** merely because the frontend Playwright suite is green. Production certification requires the automated gates above plus successful environment-specific production gates for the features included in the release.
