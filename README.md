# HCR Platform — PAYWEBSERV Rebuild (Home Care Residential)

Production-grade DSP shift-scheduling + timesheet + HR SaaS rebuild.
Reverse-engineered from https://www.paywebserv.com (20 HTML artifacts, Oct 2026).

> Critical finding: PAYWEBSERV is NOT a payroll tax engine. It is a
> Laravel/Blade monolith for DSP scheduling + timesheet acceptance/approval
> for residential group homes. This rebuild preserves that core 1:1, then
> adds greenfield payroll/tax/HR/ATS/benefits/e-signature/AI modules.

## Monorepo layout

```
hcr-platform/
  README.md (this file = Executive Summary)
  docs/01-BRD.md
  docs/02-PRD.md
  docs/03-sitemap-userflows.md
  docs/04-design-system.md
  docs/05-security-plan.md
  docs/06-infrastructure-plan.md
  docs/07-roadmap-sprint-cost.md
  docs/08-deployment-maintenance.md
  prisma/schema.prisma (PostgreSQL, full ER)
  api/openapi.yaml (OpenAPI 3.0)
  apps/web/ (Next.js 15 + React + TS + Tailwind + ShadCN)
  apps/api/ (NestJS + Prisma + Redis + BullMQ)
  docker/, terraform/, .github/workflows/
```

## Tenant in scope
Home Care Residential, LLC — 1 Cumberland Place Suite 312, Bangor ME 04401 —
(207) 730-9712 / (207) 591-0392 — info@hcrmaine.com —
"A place to feel at home" / "Your life. Your choices. Your home." / "PERSON FIRST. ALWAYS."
108 active staff, 5 programs (2739 Hermon, 274 Garland st, 10 cherry Ln, 283 NEWBURGH, 29 Sunbury Ave).
3 shifts/day: S1 12:00AM-7:59AM, S2 8:00AM-3:59PM, S3 4:00PM-11:59PM. 14-day pay periods.

## Core loop (parity)
Schedule (getPayroll period×house) → work → DRAFT timesheet → ACCEPTED (employee + attestation)
→ APPROVED/DISAPPROVED (manager/admin, reason-required disapprove) → APPROVED locks + signed file URL.
Missing: 55/108 never-submitted in period 1175 → enforcement + funnel widget.

## Quick start
See docs/08-deployment-maintenance.md. `docker compose up` for web+api+db+redis.
