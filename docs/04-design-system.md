# Design System — HCR tokens (legacy-preserved, normalized)

Legacy palette (from HTML): teal totals `#0a97a0`, program pill `#379df0`,
brown download `#593E31`, RT green `#a2faa2`, OT red `#ff8787`, All blue `#a2c7fa`,
week colors #578278/#808080/#548BB8, period blue `#3b8eea`, program green `#28a745`.
Brand: HCR logo header + "A place to feel at home" footer on all exports.

## Tailwind theme (apps/web/tailwind.config.ts)
colors: { hcr: { teal:'#0a97a0', pill:'#379df0', brown:'#593E31', rt:'#a2faa2',
ot:'#ff8787', all:'#a2c7fa', period:'#3b8eea', program:'#28a745' } }
font: Open Sans 400/600 (legacy Google font, preserved).
Components: ShadCN Button/Card/Table/Dialog/Toast(Sonner replacing alert()),
TimesheetGrid (CSS grid, sticky day headers — replaces 4-deep nested tables),
StatusPill (DRAFT/ACCEPTED/APPROVED/DISAPPROVED), TotalsBar, FunnelWidget,
LifecycleCard(status-driven, never 3-hidden-divs).
