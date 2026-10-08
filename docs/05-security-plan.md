# Security Plan
RBAC (6 roles + area_director flag), tenant isolation (company_id on every row,
RLS), opaque publicIds, cookie-session + CSRF header (or short-TTL JWT),
bcrypt/argon2, E.164 + RFC-email validation, server-computed hours, snapshot
hashing on accept/approve, APPROVED lock + adjustment entries, signed expiring
file URLs, audit_logs (actor/action/snapshot/ip/ua) on mutations + exports,
rate limits, idempotency keys, queued mail w/ SPF/DKIM, SOC2/HIPAA/GDPR-ready
PII handling, Maine payroll compliance hooks (greenfield engine).
