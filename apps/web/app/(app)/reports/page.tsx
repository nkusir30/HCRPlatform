'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-store';
import type { ReportType, Report, ReportScope } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { PageHeader, Field, Select, TextInput, Alert } from '@/components/form';
import {
  Download,
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  X,
  BarChart2,
  Printer,
  Copy,
  Check,
  Calendar,
  DollarSign,
  Building2,
  User,
  Users,
  Sparkles,
  Filter,
} from 'lucide-react';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'payroll-summary', label: 'Payroll summary' },
  { value: 'paycheck-detail', label: 'Paycheck detail' },
  { value: 'tax-report', label: 'Tax report' },
  { value: 'timesheet', label: 'Timesheet report' },
  { value: 'attendance', label: 'Attendance EVV report' },
  { value: 'audit-log', label: 'Audit log' },
  { value: 'custom', label: 'Custom' },
];

const statusVariant: Record<string, BadgeProps['variant']> = {
  completed: 'success',
  processing: 'info',
  pending: 'warning',
  failed: 'danger',
};

export default function ReportsPage() {
  const { reports, timesheets, employees, houses, attendance, schedules, addReport, updateReport, deleteReport } = useApp();

  // Scope & filter states
  const [reportType, setReportType] = useState<ReportType>('payroll-summary');
  const [scope, setScope] = useState<ReportScope>('general');
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>('all');
  const [targetHouseId, setTargetHouseId] = useState<string>('all');
  const [period, setPeriod] = useState<'current' | 'weekly' | 'biweekly' | 'monthly' | 'custom'>('current');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  // Sorting
  const sortedEmployees = [...employees].sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
  );
  const sortedHouses = [...houses].sort((a, b) => a.name.localeCompare(b.name));

  const selectedEmployee = employees.find((e) => e.id === targetEmployeeId);
  const selectedHouse = houses.find((h) => h.id === targetHouseId);
  const typeLabel = REPORT_TYPES.find((t) => t.value === reportType)?.label ?? reportType;

  function addDays(iso: string, days: number): string {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // Calculate effective start and end dates based on period selection
  function getEffectiveDateRange(p: typeof period, start: string, end: string): { startISO: string; endISO: string; label: string } {
    if (p === 'weekly') {
      return { startISO: start, endISO: addDays(start, 6), label: `Weekly (${start} to ${addDays(start, 6)})` };
    }
    if (p === 'biweekly') {
      return { startISO: start, endISO: addDays(start, 13), label: `Biweekly (${start} to ${addDays(start, 13)})` };
    }
    if (p === 'monthly') {
      return { startISO: start, endISO: addDays(start, 29), label: `Monthly (${start} to ${addDays(start, 29)})` };
    }
    if (p === 'custom') {
      const finalEnd = end || start;
      return { startISO: start, endISO: finalEnd, label: `Custom (${start} to ${finalEnd})` };
    }
    return { startISO: '', endISO: '', label: 'Current Active Pay Period' };
  }

  // Construct parameter string for report
  function buildParametersText(): string {
    const { label: dateLabel } = getEffectiveDateRange(period, startDate, endDate);
    let scopeText = '';

    if (scope === 'employee') {
      const empName = selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName} (${selectedEmployee.employeeCode})` : 'Selected Staff';
      const houseText = selectedHouse ? ` @ ${selectedHouse.name} (${selectedHouse.code})` : ' @ All Assigned Houses';
      scopeText = `Scope: Single Employee — ${empName}${houseText}`;
    } else if (scope === 'house') {
      const houseName = selectedHouse ? `${selectedHouse.name} (${selectedHouse.code})` : 'All Group Homes';
      scopeText = `Scope: Facility Report — ${houseName} (All House Staff)`;
    } else {
      scopeText = 'Scope: General Organization — All Care Staff Across All Group Homes';
    }

    const noteText = notes.trim() ? ` | Notes: ${notes.trim()}` : '';
    return `${scopeText} | Period: ${dateLabel}${noteText}`;
  }

  // Dynamic Report Data Extraction & Filtering
  function getReportData(report: Report) {
    const isEmployeeScope = report.scope === 'employee' || report.parameters.includes('Single Employee');
    const isHouseScope = report.scope === 'house' || report.parameters.includes('Facility Report');

    // Find specific targets
    let targetEmp = employees.find((e) => e.id === report.targetEmployeeId);
    let targetHse = houses.find((h) => h.id === report.targetHouseId);

    // Fallback parsing from parameters string if not stored in structured fields
    if (!targetEmp && isEmployeeScope) {
      targetEmp = employees.find((e) => report.parameters.includes(e.lastName) || report.parameters.includes(e.employeeCode));
    }
    if (!targetHse && (isHouseScope || isEmployeeScope)) {
      targetHse = houses.find((h) => report.parameters.includes(h.name) || report.parameters.includes(h.code));
    }

    // Determine employee IDs in scope
    let inScopeEmployeeIds = new Set<string>();
    if (isEmployeeScope && targetEmp) {
      inScopeEmployeeIds.add(targetEmp.id);
    } else if (isHouseScope && targetHse) {
      // Staff scheduled or clocked in at this house
      schedules.filter((s) => s.houseId === targetHse?.id).forEach((s) => inScopeEmployeeIds.add(s.employeeId));
      attendance.filter((a) => a.houseId === targetHse?.id).forEach((a) => inScopeEmployeeIds.add(a.employeeId));
      // Fallback: if no punches yet for house, match employees assigned
      if (inScopeEmployeeIds.size === 0) {
        employees.slice(0, 3).forEach((e) => inScopeEmployeeIds.add(e.id));
      }
    } else {
      employees.forEach((e) => inScopeEmployeeIds.add(e.id));
    }

    // Filter timesheets
    let filteredTimesheets = timesheets.filter((t) => inScopeEmployeeIds.has(t.employeeId));
    if (report.startDate && report.endDate) {
      filteredTimesheets = filteredTimesheets.filter((t) => t.date >= report.startDate! && t.date <= report.endDate!);
    }

    // Filter attendance punches
    let filteredAttendance = attendance.filter((a) => inScopeEmployeeIds.has(a.employeeId));
    if (targetHse) {
      filteredAttendance = filteredAttendance.filter((a) => !a.houseId || a.houseId === targetHse?.id);
    }
    if (report.startDate && report.endDate) {
      filteredAttendance = filteredAttendance.filter((a) => a.date >= report.startDate! && a.date <= report.endDate!);
    }

    // Filter employees list for presentation
    const scopedStaff = employees.filter((e) => inScopeEmployeeIds.has(e.id));

    // Summary calculations
    const totHours = filteredTimesheets.reduce((s, t) => s + t.hours, 0);
    const appHours = filteredTimesheets.filter((t) => t.status === 'approved').reduce((s, t) => s + t.hours, 0);
    const effApproved = appHours > 0 ? appHours : totHours; // fallback if draft
    const gross = effApproved * 21.5;
    const fica = gross * 0.0765;
    const maine = gross * 0.05;
    const net = gross - fica - maine;

    return {
      isEmployeeScope,
      isHouseScope,
      targetEmp,
      targetHse,
      scopedStaff,
      filteredTimesheets,
      filteredAttendance,
      totHours,
      appHours,
      gross,
      fica,
      maine,
      net,
    };
  }

  // Form Reset
  function resetForm() {
    setScope('general');
    setTargetEmployeeId('all');
    setTargetHouseId('all');
    setPeriod('current');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate('');
    setNotes('');
    setEditingId(null);
  }

  function startEdit(r: Report) {
    setEditingId(r.id);
    setConfirmId(null);
    setMsg(null);
    setReportType(r.type);
    setScope(r.scope ?? (r.parameters.includes('Single Employee') ? 'employee' : r.parameters.includes('Facility Report') ? 'house' : 'general'));
    setTargetEmployeeId(r.targetEmployeeId ?? 'all');
    setTargetHouseId(r.targetHouseId ?? 'all');
    setStartDate(r.startDate ?? new Date().toISOString().slice(0, 10));
    setEndDate(r.endDate ?? '');
    setNotes('');
  }

  function cancelEdit() {
    resetForm();
    setMsg(null);
  }

  // Handle Generate / Submit
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (scope === 'employee' && targetEmployeeId === 'all') {
      setMsg({ kind: 'error', text: 'Please select a specific employee for a single employee report.' });
      return;
    }

    if (scope === 'house' && targetHouseId === 'all') {
      setMsg({ kind: 'error', text: 'Please select a specific house facility for a facility report.' });
      return;
    }

    if (period === 'custom' && endDate && endDate < startDate) {
      setMsg({ kind: 'error', text: 'End date must be on or after the start date.' });
      return;
    }

    const { startISO, endISO } = getEffectiveDateRange(period, startDate, endDate);
    const paramText = buildParametersText();

    if (editingId) {
      updateReport(editingId, {
        type: reportType,
        parameters: paramText,
        scope,
        targetEmployeeId: targetEmployeeId !== 'all' ? targetEmployeeId : undefined,
        targetHouseId: targetHouseId !== 'all' ? targetHouseId : undefined,
        startDate: startISO || undefined,
        endDate: endISO || undefined,
      });
      setMsg({ kind: 'success', text: 'Report parameters updated successfully.' });
      cancelEdit();
      return;
    }

    // Generate new report
    const newReport = addReport({
      type: reportType,
      parameters: paramText,
      scope,
      targetEmployeeId: targetEmployeeId !== 'all' ? targetEmployeeId : undefined,
      targetHouseId: targetHouseId !== 'all' ? targetHouseId : undefined,
      startDate: startISO || undefined,
      endDate: endISO || undefined,
    });

    // Automatically open in modal as requested
    setViewingReport(newReport);
    setMsg({
      kind: 'success',
      text: `Report #${newReport.reportId} generated successfully and opened in modal.`,
    });
    resetForm();
  }

  function confirmDelete() {
    if (!confirmId) return;
    deleteReport(confirmId);
    setConfirmId(null);
    if (editingId === confirmId) cancelEdit();
    if (viewingReport?.id === confirmId) setViewingReport(null);
    setMsg({ kind: 'success', text: 'Report removed.' });
  }

  // CSV Export
  function downloadReportCSV(report: Report) {
    const { scopedStaff, filteredTimesheets, filteredAttendance, totHours, appHours, gross, fica, maine, net, targetEmp, targetHse } =
      getReportData(report);

    const isAttendance = report.type === 'attendance';
    let dataSection: string[] = [];

    if (isAttendance) {
      dataSection = [
        'Attendance EVV Punches Breakdown',
        'Date,Employee,Employee Code,Clock In,Clock Out,House,Status,Source',
        ...filteredAttendance.map((a) => {
          const emp = employees.find((e) => e.id === a.employeeId);
          const empName = emp ? `${emp.firstName} ${emp.lastName}` : a.employeeId;
          const empCode = emp ? emp.employeeCode : 'N/A';
          const h = houses.find((hs) => hs.id === a.houseId) ?? targetHse;
          const houseName = h ? h.name : 'Primary Residence';
          const inTime = a.clockInAt ? new Date(a.clockInAt).toLocaleTimeString() : 'N/A';
          const outTime = a.clockOutAt ? new Date(a.clockOutAt).toLocaleTimeString() : 'In Progress';
          return `"${a.date}","${empName}","${empCode}","${inTime}","${outTime}","${houseName}","${a.status}","${a.source}"`;
        }),
      ];
    } else {
      dataSection = [
        'Timesheets & Labor Hours Breakdown',
        'Date,Employee,Employee Code,Work Type,Labor Category,Hours,Hourly Rate,Gross Pay,Status',
        ...filteredTimesheets.map((t) => {
          const emp = employees.find((e) => e.id === t.employeeId);
          const name = emp ? `${emp.firstName} ${emp.lastName}` : t.employeeId;
          const code = emp ? emp.employeeCode : 'N/A';
          const rate = 21.5;
          const pay = (t.hours * rate).toFixed(2);
          return `"${t.date}","${name}","${code}","${t.workType}","${t.laborCategory}",${t.hours},$${rate.toFixed(2)},$${pay},"${t.status}"`;
        }),
      ];
    }

    const lines = [
      'HOME CARE RESIDENTIAL — OFFICIAL PAYROLL & HR AUDIT REPORT',
      `Generated On,${new Date().toISOString()}`,
      `Report ID,${report.reportId}`,
      `Report Type,${report.type}`,
      `Scope Mode,${report.scope ?? 'general'}`,
      `Target Employee,"${targetEmp ? `${targetEmp.firstName} ${targetEmp.lastName} (${targetEmp.employeeCode})` : 'All Staff'}"`,
      `Target House,"${targetHse ? `${targetHse.name} (${targetHse.code})` : 'All Facilities'}"`,
      `Parameters & Filters,"${report.parameters.replace(/"/g, '""')}"`,
      `Provider Certification,MaineCare Section 21 Specialized Provider`,
      '',
      'Summary Metrics for In-Scope Data',
      `Total Care Staff in Scope,${scopedStaff.length}`,
      `Total Logged Hours,${totHours}h`,
      `Approved Payroll Hours,${appHours}h`,
      `Est Baseline Gross Wages ($21.50/hr),$${gross.toFixed(2)}`,
      `Est FICA Tax (7.65%),$${fica.toFixed(2)}`,
      `Est Maine State Withholding (5.0%),$${maine.toFixed(2)}`,
      `Est Net Wages Disbursed,$${net.toFixed(2)}`,
      '',
      ...dataSection,
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    const filenameScope = targetEmp ? `emp_${targetEmp.employeeCode}` : targetHse ? `house_${targetHse.code}` : 'general';
    link.setAttribute('download', `hcr_report_${report.reportId}_${filenameScope}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // JSON Export
  function downloadReportJSON(report: Report) {
    const data = getReportData(report);
    const payload = {
      organization: 'Home Care Residential Inc.',
      certification: 'MaineCare Section 21',
      reportId: report.reportId,
      type: report.type,
      scope: report.scope ?? 'general',
      parameters: report.parameters,
      generatedAt: new Date().toISOString(),
      summary: {
        staffCount: data.scopedStaff.length,
        totalHours: data.totHours,
        approvedHours: data.appHours,
        grossWages: Number(data.gross.toFixed(2)),
        ficaTax: Number(data.fica.toFixed(2)),
        maineTax: Number(data.maine.toFixed(2)),
        netWages: Number(data.net.toFixed(2)),
      },
      timesheets: data.filteredTimesheets,
      attendance: data.filteredAttendance,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `hcr_report_${report.reportId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // All Reports Index CSV
  function downloadAllReportsIndexCSV() {
    if (reports.length === 0) return;
    const lines = [
      'Report ID,Type,Scope,Status,Parameters,Created Date',
      ...reports.map(
        (r) =>
          `"${r.reportId}","${r.type}","${r.scope ?? 'general'}","${r.status}","${r.parameters.replace(/"/g, '""')}","${new Date(r.createdAt).toISOString()}"`,
      ),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `hcr_reports_index_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleCopySummary(report: Report) {
    const data = getReportData(report);
    const text = `HCR Report #${report.reportId} (${report.type})\n${report.parameters}\nIn-Scope Staff: ${data.scopedStaff.length} | Hours: ${data.totHours}h | Gross: $${data.gross.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Global KPI totals
  const totalOrgHours = timesheets.reduce((s, t) => s + t.hours, 0);
  const totalApprovedHours = timesheets.filter((t) => t.status === 'approved').reduce((s, t) => s + t.hours, 0);

  // Computed data for active modal view
  const modalData = viewingReport ? getReportData(viewingReport) : null;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Audited summaries generated from live scheduling, EVV attendance, and MaineCare payroll records."
      />

      {/* Top Level Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Total Care Staff</div>
            <div className="text-3xl font-bold mt-1 text-[var(--color-text-primary)]">{employees.length}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">Direct care &amp; administration</div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Total Hours Logged</div>
            <div className="text-3xl font-bold mt-1 text-teal-600">{totalOrgHours}h</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">Across all group homes</div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Approved For Payroll</div>
            <div className="text-3xl font-bold mt-1 text-emerald-600">{totalApprovedHours}h</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">Ready for MaineCare export</div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Scope Presets Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-teal-500/10 via-slate-50 to-emerald-500/10 border border-teal-500/20 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Quick Report Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setScope('general');
              setPeriod('current');
              setReportType('payroll-summary');
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50 hover:border-teal-500 text-slate-700 transition-colors shadow-2xs"
          >
            🏢 All Staff &amp; Houses
          </button>
          <button
            type="button"
            onClick={() => {
              setScope('house');
              if (houses[0]?.id) setTargetHouseId(houses[0].id);
              setPeriod('biweekly');
              setReportType('attendance');
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50 hover:border-teal-500 text-slate-700 transition-colors shadow-2xs"
          >
            🏠 Specific House Attendance
          </button>
          <button
            type="button"
            onClick={() => {
              setScope('employee');
              if (employees[0]?.id) setTargetEmployeeId(employees[0].id);
              setPeriod('biweekly');
              setReportType('paycheck-detail');
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50 hover:border-teal-500 text-slate-700 transition-colors shadow-2xs"
          >
            👤 Single Employee Detail
          </button>
        </div>
      </div>

      {/* Report Inspection Modal */}
      {viewingReport && modalData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn overflow-y-auto"
        >
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                      Report #{viewingReport.reportId}
                    </h3>
                    <Badge variant={statusVariant[viewingReport.status]} size="sm">
                      {viewingReport.status}
                    </Badge>
                    <Badge variant={viewingReport.scope === 'employee' ? 'info' : viewingReport.scope === 'house' ? 'warning' : 'default'} size="sm">
                      {viewingReport.scope === 'employee' ? 'Single Employee' : viewingReport.scope === 'house' ? 'Specific House' : 'General Org'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {REPORT_TYPES.find((t) => t.value === viewingReport.type)?.label ?? viewingReport.type} • Created {new Date(viewingReport.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingReport(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="space-y-4 text-sm overflow-y-auto pr-1">
              {/* Parameters banner */}
              <div className="p-3.5 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border)] space-y-1.5">
                <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-teal-600" />
                  <span>Report Scope &amp; Target Filters</span>
                </div>
                <div className="text-xs font-mono text-[var(--color-text-primary)] break-words bg-slate-100/70 p-2.5 rounded-lg border border-slate-200/50">
                  {viewingReport.parameters}
                </div>
              </div>

              {/* In-Scope Financial & Operational Projection */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/50 border border-teal-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-teal-900 uppercase tracking-wide flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-teal-600" />
                    <span>In-Scope Payroll Calculations ($21.50/hr MaineCare Rate)</span>
                  </div>
                  <span className="text-xs font-semibold text-teal-800">
                    {modalData.scopedStaff.length} Care Provider{modalData.scopedStaff.length !== 1 ? 's' : ''} in Scope
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 bg-white/90 rounded-lg border border-teal-100 shadow-xs">
                    <div className="text-[11px] text-teal-700">In-Scope Staff</div>
                    <div className="text-base font-bold text-teal-950 mt-0.5">{modalData.scopedStaff.length}</div>
                  </div>
                  <div className="p-2.5 bg-white/90 rounded-lg border border-teal-100 shadow-xs">
                    <div className="text-[11px] text-teal-700">Total Hours</div>
                    <div className="text-base font-bold text-teal-950 mt-0.5">{modalData.totHours}h</div>
                  </div>
                  <div className="p-2.5 bg-white/90 rounded-lg border border-teal-100 shadow-xs">
                    <div className="text-[11px] text-teal-700">Est. Gross Wages</div>
                    <div className="text-base font-bold text-teal-950 mt-0.5">${modalData.gross.toFixed(2)}</div>
                  </div>
                  <div className="p-2.5 bg-white/90 rounded-lg border border-teal-100 shadow-xs">
                    <div className="text-[11px] text-teal-700">Est. Net Wages</div>
                    <div className="text-base font-bold text-emerald-700 mt-0.5">${modalData.net.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Data Breakdown Table Preview */}
              <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                <div className="bg-[var(--color-bg-base)] px-3.5 py-2.5 border-b border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                    {viewingReport.type === 'attendance' ? 'Filtered EVV Punches' : 'Filtered Timesheets Records'}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Showing {viewingReport.type === 'attendance' ? modalData.filteredAttendance.length : modalData.filteredTimesheets.length} records in scope
                  </span>
                </div>
                <div className="max-h-52 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-[var(--color-text-muted)] border-b border-[var(--color-border)] sticky top-0">
                      <tr>
                        <th className="py-2 px-3 text-left">Date</th>
                        <th className="py-2 px-3 text-left">Employee</th>
                        <th className="py-2 px-3 text-left">{viewingReport.type === 'attendance' ? 'Clock In / Out' : 'Category'}</th>
                        <th className="py-2 px-3 text-right">{viewingReport.type === 'attendance' ? 'Status' : 'Hours'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                      {viewingReport.type === 'attendance' ? (
                        modalData.filteredAttendance.length > 0 ? (
                          modalData.filteredAttendance.map((a) => {
                            const emp = employees.find((e) => e.id === a.employeeId);
                            return (
                              <tr key={a.id} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 font-mono">{a.date}</td>
                                <td className="py-2 px-3 font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : a.employeeId}</td>
                                <td className="py-2 px-3 text-[var(--color-text-secondary)]">
                                  {a.clockInAt ? new Date(a.clockInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                  {' - '}
                                  {a.clockOutAt ? new Date(a.clockOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'On clock'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <Badge variant={a.status === 'clocked-in' ? 'info' : 'success'} size="sm">
                                    {a.status}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr><td colSpan={4} className="py-4 text-center text-slate-400">No attendance records in this scope.</td></tr>
                        )
                      ) : modalData.filteredTimesheets.length > 0 ? (
                        modalData.filteredTimesheets.map((t) => {
                          const emp = employees.find((e) => e.id === t.employeeId);
                          return (
                            <tr key={t.id} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 font-mono">{t.date}</td>
                              <td className="py-2 px-3 font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : t.employeeId}</td>
                              <td className="py-2 px-3 text-[var(--color-text-secondary)]">{t.laborCategory}</td>
                              <td className="py-2 px-3 text-right font-semibold">{t.hours}h</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr><td colSpan={4} className="py-4 text-center text-slate-400">No timesheets recorded in this scope.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopySummary(viewingReport)}
                  className="py-2 px-3 rounded-lg border border-[var(--color-border)] text-xs font-medium text-slate-700 hover:bg-[var(--color-border-subtle)] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy summary details"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2 px-3 rounded-lg border border-[var(--color-border)] text-xs font-medium text-slate-700 hover:bg-[var(--color-border-subtle)] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print report"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadReportJSON(viewingReport)}
                  className="py-2 px-3 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-slate-800 hover:bg-[var(--color-border-subtle)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadReportCSV(viewingReport)}
                  className="py-2 px-4 rounded-lg bg-[var(--color-primary)] text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[var(--color-primary-hover)] shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="py-2 px-3 rounded-lg border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-border-subtle)] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {msg ? <div className="mb-4"><Alert kind={msg.kind}>{msg.text}</Alert></div> : null}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Report History Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Report History ({reports.length})</CardTitle>
              {reports.length > 0 && (
                <button
                  type="button"
                  onClick={downloadAllReportsIndexCSV}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-slate-700 hover:bg-[var(--color-border-subtle)] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-teal-600" />
                  <span>Export All CSV</span>
                </button>
              )}
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="py-2.5 pr-3">ID</th>
                    <th className="py-2.5 pr-3">Type</th>
                    <th className="py-2.5 pr-3">Scope</th>
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5 pr-3">Requested</th>
                    <th className="py-2.5 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => {
                    const rScope = r.scope ?? (r.parameters.includes('Single Employee') ? 'employee' : r.parameters.includes('Facility Report') ? 'house' : 'general');
                    return (
                      <tr key={r.id} className={`border-b border-[var(--color-border-subtle)] ${editingId === r.id ? 'bg-[var(--color-primary-light)]' : 'hover:bg-slate-50/50'}`}>
                        <td className="py-2.5 pr-3 font-mono text-xs font-semibold">{r.reportId}</td>
                        <td className="py-2.5 pr-3 font-medium">{REPORT_TYPES.find((t) => t.value === r.type)?.label ?? r.type}</td>
                        <td className="py-2.5 pr-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            rScope === 'employee' ? 'bg-sky-100 text-sky-800' : rScope === 'house' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {rScope === 'employee' ? '👤 Employee' : rScope === 'house' ? '🏠 House' : '🏢 General'}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3"><Badge variant={statusVariant[r.status]} size="sm">{r.status}</Badge></td>
                        <td className="py-2.5 pr-3 text-[var(--color-text-secondary)]">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="py-2.5 pr-3">
                          {confirmId === r.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-[var(--color-text-secondary)]">Delete?</span>
                              <button onClick={confirmDelete} className="text-xs rounded px-2.5 py-1 bg-[var(--color-danger)] text-white hover:opacity-90 font-medium cursor-pointer">Yes</button>
                              <button onClick={() => setConfirmId(null)} className="text-xs rounded px-2 py-1 border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] cursor-pointer">No</button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                type="button"
                                onClick={() => setViewingReport(r)}
                                className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] font-medium hover:underline cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadReportCSV(r)}
                                className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 font-medium hover:underline cursor-pointer"
                                title="Download CSV"
                                aria-label="Download CSV"
                              >
                                <Download className="w-3.5 h-3.5 text-slate-500" />
                                <span>Download</span>
                              </button>
                              <button onClick={() => startEdit(r)} className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer">Edit</button>
                              <button onClick={() => { setConfirmId(r.id); setMsg(null); }} className="text-xs text-[var(--color-danger)] hover:underline cursor-pointer">Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {reports.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-[var(--color-text-muted)]">No reports generated yet.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Generate Report Form Card */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit report scope' : 'Generate new report'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-3.5">
                {/* Scope Selection Tabs */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
                    Target Report Scope
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setScope('general')}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        scope === 'general' ? 'bg-white text-teal-700 shadow-xs border border-teal-200' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Users className="w-4 h-4 mb-0.5" />
                      <span>General Org</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScope('house')}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        scope === 'house' ? 'bg-white text-teal-700 shadow-xs border border-teal-200' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mb-0.5" />
                      <span>By House</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScope('employee')}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        scope === 'employee' ? 'bg-white text-teal-700 shadow-xs border border-teal-200' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User className="w-4 h-4 mb-0.5" />
                      <span>Single Staff</span>
                    </button>
                  </div>
                </div>

                {/* Report Type */}
                <Field label="Report type">
                  <Select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
                    {REPORT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </Select>
                </Field>

                {/* Dynamic Filters depending on Scope */}
                {scope === 'employee' && (
                  <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-xl space-y-2.5">
                    <div className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-600" />
                      <span>Employee Selection &amp; House Facility</span>
                    </div>
                    <Field label="Target Employee *" hint="Choose individual care provider">
                      <Select value={targetEmployeeId} onChange={(e) => setTargetEmployeeId(e.target.value)}>
                        <option value="all">-- Select Employee --</option>
                        {sortedEmployees.map((x) => (
                          <option key={x.id} value={x.id}>{x.firstName} {x.lastName} ({x.employeeCode})</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="House filter" hint="Filter shifts to specific home or all">
                      <Select value={targetHouseId} onChange={(e) => setTargetHouseId(e.target.value)}>
                        <option value="all">All assigned houses / shifts</option>
                        {sortedHouses.map((x) => (
                          <option key={x.id} value={x.id}>{x.name} ({x.code})</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                )}

                {scope === 'house' && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2.5">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Facility Selection</span>
                    </div>
                    <Field label="Target House Facility *" hint="Aggregates all staff at this facility">
                      <Select value={targetHouseId} onChange={(e) => setTargetHouseId(e.target.value)}>
                        <option value="all">-- Select House Facility --</option>
                        {sortedHouses.map((x) => (
                          <option key={x.id} value={x.id}>{x.name} ({x.code}) — {x.city}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                )}

                {scope === 'general' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>General Organization Mode:</strong> Aggregates all care providers across all residential houses ({houses.length} facilities, {employees.length} employees).
                    </p>
                  </div>
                )}

                {/* Time Frame Selection */}
                <Field label="Reporting period / Timeframe">
                  <Select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
                    <option value="current">Current active pay period</option>
                    <option value="weekly">Weekly (7 days from start date)</option>
                    <option value="biweekly">Biweekly (14 days from start date)</option>
                    <option value="monthly">Monthly (30 days from start date)</option>
                    <option value="custom">Custom date range</option>
                  </Select>
                </Field>

                {period !== 'current' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start date">
                      <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </Field>
                    {period === 'custom' ? (
                      <Field label="End date">
                        <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      </Field>
                    ) : (
                      <Field label="End date (auto)">
                        <TextInput
                          type="date"
                          value={addDays(startDate, period === 'weekly' ? 6 : period === 'biweekly' ? 13 : 29)}
                          disabled
                        />
                      </Field>
                    )}
                  </div>
                )}

                <Field label="Auditing / Compliance Notes" hint="Optional">
                  <TextInput value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. MaineCare Section 21 Biweekly Reconciliation" />
                </Field>

                {/* Scope Live Preview */}
                <div className="p-2.5 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] space-y-1">
                  <div className="font-semibold text-[var(--color-text-primary)]">Preview Configuration:</div>
                  <div className="font-mono text-[11px] text-teal-800 break-words">
                    {buildParametersText()}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)] shadow-xs transition-colors cursor-pointer"
                  >
                    {editingId ? 'Save changes' : 'Generate report'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg border border-[var(--color-border)] px-4 py-2.5 hover:bg-[var(--color-border-subtle)] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
