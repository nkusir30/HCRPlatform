# Sitemap + User Flows (decoded 20 artifacts)
Routes: /login | /companies | /home | /jobs | /open_shifts | /timesheets
→ POST /employee{payroll|timesheet} | POST /employees_not_submitted |
POST /reports/staff | /approved_timesheets → POST /get_timesheet_approved |
/programs(+create) | /payrolls → POST /getPayroll + POST /employee_jobs |
/users | /holidays | /reports/* STUB | /certificates(+create).
Flows: (1) DSP accept: hub→own dossier→attest→Accept→toast+pill ACCEPTED.
(2) Manager approve: queue→other dossier→Approve/Disapprove(reason)→banner+download.
(3) Scheduler: periods→period×house grid→+Add Job/edit/delete/set-open/duplicate.
(4) Enforcement: missing table→preview→confirm→queued reminders→funnel updates.
