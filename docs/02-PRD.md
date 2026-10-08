# PRD — HCR Platform

## 1. Sitemap (decoded, 20 artifacts)
`/login` | `/companies` portal | `/home` | `/jobs` (138-row shifts) |
`/open_shifts` | `/timesheets` hub (4 cards) → `POST /employee {payroll|timesheet}`,
`POST /employees_not_submitted`, `POST /reports/staff` |
`/approved_timesheets` → `POST /get_timesheet_approved` |
`/programs` (+create) | `/payrolls` → `POST /getPayroll`, `POST /employee_jobs` |
`/users` | `/holidays` | `/reports/*` STUB | `/certificates` (+create).
`GET /download_timesheet`, `GET /download_schedule`, `POST /send_mails`,
`POST /duplicatePayroll`, approve/disapprove AJAX.

## 2. Timesheet state machine
DRAFT → ACCEPTED (owner-only, attested:true, totalsHash match, 409 if repeat)
→ APPROVED (manager/admin) | DISAPPROVED (reason REQUIRED)
→ APPROVED locks entries; corrections via adjustment entry; disapprove-after-approve
revokes signed URL + audit + notify. Zero-week confirm, <50%-of-scheduled confirm.

## 3. Scheduling rules
14-day periods (Week One Sun-Sat + Week Two Sun-Sat). 3 templates/house/day.
RT = weekly ≤40h (#a2faa2), OT = >40h (#ff8787), All = RT+OT (#a2c7fa).
Attributed-vs-baseline variance flagged (legacy over-attributes e.g. 672 vs 168).
Duplicate period, delete-all (confirm), per-day +Add Job.

## 4. Roles matrix
dsp: own sheets accept. house_manager: house schedule + accept queue.
program_manager: multi-house + export. admin: users/holidays/certs + reminders.
super_admin/owner: all + companies + periods + delete-all. Area Director flag:
cross-house approve.

## 5. Acceptance criteria (parity)
Grid renders both weeks always; server-computed hours; totals bar teal;
funnel widget Submitted x/108 → Accepted y → Approved z; exports carry HCR
logo header + tagline footer; every export → audit_logs; no dead cards.
