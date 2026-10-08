# BRD — HCR DSP Scheduling Platform (PAYWEBSERV rebuild)

## 1. Purpose
Replace PAYWEBSERV Laravel monolith with modern multi-tenant SaaS for DSP
scheduling, timesheet lifecycle, compliance vault, and (greenfield) payroll/HR.

## 2. Customers & users
- Buyer: agency owners (Home Care Residential + sister agencies LEGENDS, CHARITY CARE).
- Personas: owner(super_admin owner) > super_admin > admin > program_manager >
  house_manager > dsp; Area Director = orthogonal flag (can approve across houses).

## 3. Scope: parity (must-have)
Companies portal (join-by-code), dashboard (Staff/Programs widgets),
shifts CRUD + open-shift claim, pay-period grid (Week One/Two × 3 shifts),
timesheet DRAFT→ACCEPTED→APPROVED/DISAPPROVED, non-submitter table + reminders,
users/holidays/certificates CRUD, schedule/timesheet file exports.

## 4. Scope: superiority (greenfield)
Real Reports (GET-based), payroll tax engine + W-2/1099 + direct deposit,
ATS + Maine background checks, benefits/open enrollment, e-signature,
AI assistant/chatbot/doc intelligence, analytics + overtime + coverage-variance.

## 5. Non-functionals
Multi-tenant row isolation (company_id everywhere), RBAC, audit_logs on every
mutation + export, 80%+ test coverage, WCAG 2.2 AA, E.164 phones, RFC email
validation, idempotent mutations, queued mail (SES/Postmark), signed file URLs.

## 6. Gaps fixed from legacy (evidence)
Reports stub (POST /reports/* → redirect+flash) → real GET reports.
Approval reversible + no reason → lock on APPROVED + reason-required disapprove.
Native alert() → toasts. Sequential IDs → opaque publicIds. No attestation →
checkbox + snapshot hash + ip/ua. Bulk send_mails no confirm → preview+confirm.
Malformed emails/phones → validation + verification.
