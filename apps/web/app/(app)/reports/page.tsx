'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-store';
import type { ReportType, Report } from '@/lib/types';
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
  FileSpreadsheet,
  Calendar,
  UserCheck,
  DollarSign,
} from 'lucide-react';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'payroll-summary', label: 'Payroll summary' },
  { value: 'paycheck-detail', label: 'Paycheck detail' },
  { value: 'tax-report', label: 'Tax report' },
  { value: 'timesheet', label: 'Timesheet report' },
  { value: 'attendance', label: 'Attendance report' },
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
  const { reports, timesheets, employees, houses, attendance, addReport, updateReport, deleteReport } = useApp();
  const [reportType, setReportType] = useState<ReportType>('payroll-summary');
  const [parameters, setParameters] = useState('');
  const [employeeId, setEmployeeId] = useState('all');
  const [houseId, setHouseId] = useState('all');
  const [period, setPeriod] = useState<'current' | 'weekly' | 'biweekly' | 'custom'>('current');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const useStructured = reportType === 'timesheet' || reportType === 'attendance';
  const typeLabel = REPORT_TYPES.find((t) => t.value === reportType)?.label ?? reportType;

  const sortedEmployees = [...employees].sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
  );
  const employee = employees.find((x) => x.id === employeeId);
  const house = houses.find((x) => x.id === houseId);

  function addDays(iso: string, days: number): string {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function previewParams(): string {
    if (!useStructured) return parameters.trim() || 'Current period, all employees';
    const who = employee ? `${employee.firstName} ${employee.lastName} (${employee.employeeCode})` : 'All employees';
    const where = house ? `${house.name} (${house.code})` : 'All houses';
    const when =
      period === 'current'
        ? 'Current period'
        : period === 'weekly'
          ? `Weekly, ${startDate} to ${addDays(startDate, 6)}`
          : period === 'biweekly'
            ? `Biweekly, ${startDate} to ${addDays(startDate, 13)}`
            : `Custom, ${startDate} to ${endDate || startDate}`;
    const extra = notes.trim() ? ` — ${notes.trim()}` : '';
    return `${typeLabel}: ${who}; ${where}; ${when}${extra}`;
  }

  const totalHours = timesheets.reduce((s, t) => s + t.hours, 0);
  const approvedHours = timesheets.filter((t) => t.status === 'approved').reduce((s, t) => s + t.hours, 0);
  const grossWages = approvedHours * 21.5;
  const ficaTax = grossWages * 0.0765;
  const maineTax = grossWages * 0.05;
  const netWages = grossWages - ficaTax - maineTax;

  function resetStructured() {
    setEmployeeId('all');
    setHouseId('all');
    setPeriod('current');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate('');
    setNotes('');
  }

  function startEdit(r: Report) {
    setEditingId(r.id);
    setConfirmId(null);
    setMsg(null);
    setReportType(r.type);
    setParameters(r.parameters);
    resetStructured();
  }

  function cancelEdit() {
    setEditingId(null);
    setMsg(null);
    setReportType('payroll-summary');
    setParameters('');
    resetStructured();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (useStructured && !editingId) {
      if (period === 'custom' && endDate && endDate < startDate) {
        setMsg({ kind: 'error', text: 'End date must be on or after the start date.' });
        return;
      }
      const newReport = addReport({ type: reportType, parameters: previewParams() });
      setViewingReport(newReport);
      setMsg({ kind: 'success', text: `Report #${newReport.reportId} generated successfully and opened in modal.` });
      resetStructured();
      return;
    }
    const params = parameters.trim() || 'Current period, all employees';
    if (editingId) {
      updateReport(editingId, { type: reportType, parameters: params });
      setMsg({ kind: 'success', text: 'Report updated.' });
      cancelEdit();
      return;
    }
    const newReport = addReport({ type: reportType, parameters: params });
    setViewingReport(newReport);
    setMsg({ kind: 'success', text: `Report #${newReport.reportId} generated successfully and opened in modal.` });
    setParameters('');
  }

  function confirmDelete() {
    if (!confirmId) return;
    deleteReport(confirmId);
    setConfirmId(null);
    if (editingId === confirmId) cancelEdit();
    if (viewingReport?.id === confirmId) setViewingReport(null);
    setMsg({ kind: 'success', text: 'Report removed.' });
  }

  function downloadReportCSV(report: Report) {
    const isAttendance = report.type === 'attendance';
    const isTimesheet = report.type === 'timesheet';

    let dataSection: string[] = [];

    if (isAttendance) {
      dataSection = [
        'Attendance Punches Breakdown',
        'Date,Employee,Employee Code,Clock In,Clock Out,House,Status,Source',
        ...attendance.map((a) => {
          const emp = employees.find((e) => e.id === a.employeeId);
          const empName = emp ? `${emp.firstName} ${emp.lastName}` : a.employeeId;
          const empCode = emp ? emp.employeeCode : 'N/A';
          const h = houses.find((hs) => hs.id === a.houseId);
          const houseName = h ? h.name : 'Primary Home';
          const inTime = a.clockInAt ? new Date(a.clockInAt).toLocaleTimeString() : 'N/A';
          const outTime = a.clockOutAt ? new Date(a.clockOutAt).toLocaleTimeString() : 'In Progress';
          return `"${a.date}","${empName}","${empCode}","${inTime}","${outTime}","${houseName}","${a.status}","${a.source}"`;
        }),
      ];
    } else {
      dataSection = [
        'Timesheets & Payroll Breakdown',
        'Date,Employee,Employee Code,Work Type,Labor Category,Hours,Hourly Rate,Gross Pay,Status',
        ...timesheets.map((t) => {
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
      'HOME CARE RESIDENTIAL — OFFICIAL PAYROLL & AUDIT REPORT',
      `Generated On,${new Date().toISOString()}`,
      `Report ID,${report.reportId}`,
      `Report Type,${report.type}`,
      `Status,${report.status}`,
      `Scope & Parameters,"${report.parameters.replace(/"/g, '""')}"`,
      `Provider Certification,MaineCare Section 21 Specialized Provider`,
      '',
      'Summary Metrics',
      `Total Organization Staff,${employees.length}`,
      `Total Logged Hours,${totalHours}h`,
      `Approved Payroll Hours,${approvedHours}h`,
      `Est Baseline Gross Wages ($21.50/hr),$${grossWages.toFixed(2)}`,
      `Est FICA Tax (7.65%),$${ficaTax.toFixed(2)}`,
      `Est Maine State Withholding (5.0%),$${maineTax.toFixed(2)}`,
      `Est Net Payroll Disbursements,$${netWages.toFixed(2)}`,
      '',
      ...dataSection,
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `hcr_report_${report.reportId}_${report.type}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadReportJSON(report: Report) {
    const payload = {
      organization: 'Home Care Residential Inc.',
      certification: 'MaineCare Section 21',
      generatedAt: new Date().toISOString(),
      report: {
        id: report.id,
        reportId: report.reportId,
        type: report.type,
        status: report.status,
        parameters: report.parameters,
        createdAt: report.createdAt,
      },
      metrics: {
        totalStaff: employees.length,
        totalHours,
        approvedHours,
        grossWages: Number(grossWages.toFixed(2)),
        ficaTax: Number(ficaTax.toFixed(2)),
        maineTax: Number(maineTax.toFixed(2)),
        netWages: Number(netWages.toFixed(2)),
      },
      timesheets: timesheets.map((t) => {
        const emp = employees.find((e) => e.id === t.employeeId);
        return {
          id: t.id,
          date: t.date,
          employee: emp ? `${emp.firstName} ${emp.lastName}` : t.employeeId,
          employeeCode: emp ? emp.employeeCode : null,
          hours: t.hours,
          laborCategory: t.laborCategory,
          status: t.status,
        };
      }),
      attendance: attendance.map((a) => {
        const emp = employees.find((e) => e.id === a.employeeId);
        return {
          id: a.id,
          date: a.date,
          employee: emp ? `${emp.firstName} ${emp.lastName}` : a.employeeId,
          clockInAt: a.clockInAt,
          clockOutAt: a.clockOutAt,
          status: a.status,
          source: a.source,
        };
      }),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `hcr_report_${report.reportId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadAllReportsIndexCSV() {
    if (reports.length === 0) return;
    const lines = [
      'Report ID,Type,Status,Parameters,Created Date',
      ...reports.map(
        (r) =>
          `"${r.reportId}","${r.type}","${r.status}","${r.parameters.replace(/"/g, '""')}","${new Date(r.createdAt).toISOString()}"`,
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
    const text = `Report ${report.reportId} (${report.type})\nStatus: ${report.status}\nParameters: ${report.parameters}\nStaff: ${employees.length} | Approved Hours: ${approvedHours}h | Gross: $${grossWages.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function printReport() {
    window.print();
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Audited summaries generated from live scheduling, EVV attendance, and payroll data."
      />

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
            <div className="text-3xl font-bold mt-1 text-teal-600">{totalHours}h</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">Across all group homes</div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Approved For Payroll</div>
            <div className="text-3xl font-bold mt-1 text-emerald-600">{approvedHours}h</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">Ready for MaineCare export</div>
          </CardContent>
        </Card>
      </section>

      {/* Report Details Modal */}
      {viewingReport && (
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
              <div className="p-3.5 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border)] space-y-1">
                <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Scope &amp; Parameters
                </div>
                <div className="text-xs font-mono text-[var(--color-text-primary)] break-words bg-slate-100/70 p-2 rounded-lg border border-slate-200/50">
                  {viewingReport.parameters}
                </div>
              </div>

              {/* Live Financial & Operational Projection */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/50 border border-teal-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-teal-900 uppercase tracking-wide flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-teal-600" />
                    <span>MaineCare Section 21 Payroll Projection</span>
                  </div>
                  <span className="text-xs font-mono text-teal-700 font-medium">Rate: $21.50/hr baseline</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 bg-white/90 rounded-lg border border-teal-100 shadow-xs">
                    <div className="text-[11px] text-teal-700">Total Staff</div>
                    <div className="text-base font-bold text-teal-950 mt-0.5">{employees.length}</div>
                  </div>
                  <div className="p-2.5 bg-white/90 rounded-lg border border-teal-100 shadow-xs">
                    <div className="text-[11px] text-teal-700">Approved Hours</div>
                    <div className="text-base font-bold text-teal-950 mt-0.5">{approvedHours}h</div>
                  </div>
                  <div className="p-2.5 bg-white/90 rounded-lg border border-teal-100 shadow-xs">
                    <div className="text-[11px] text-teal-700">Est. Gross Pay</div>
                    <div className="text-base font-bold text-teal-950 mt-0.5">${grossWages.toFixed(2)}</div>
                  </div>
                  <div className="p-2.5 bg-white/90 rounded-lg border border-teal-100 shadow-xs">
                    <div className="text-[11px] text-teal-700">Est. Net Wages</div>
                    <div className="text-base font-bold text-emerald-700 mt-0.5">${netWages.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Data Breakdown Table Preview */}
              <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                <div className="bg-[var(--color-bg-base)] px-3.5 py-2.5 border-b border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                    {viewingReport.type === 'attendance' ? 'Attendance EVV Punches' : 'Timesheets Records Preview'}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Showing top {viewingReport.type === 'attendance' ? Math.min(5, attendance.length) : Math.min(5, timesheets.length)} items
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto">
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
                        attendance.slice(0, 5).map((a) => {
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
                        timesheets.slice(0, 5).map((t) => {
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
                  className="py-2 px-3 rounded-lg border border-[var(--color-border)] text-xs font-medium text-slate-700 hover:bg-[var(--color-border-subtle)] flex items-center gap-1.5 transition-colors"
                  title="Copy summary details"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={printReport}
                  className="py-2 px-3 rounded-lg border border-[var(--color-border)] text-xs font-medium text-slate-700 hover:bg-[var(--color-border-subtle)] flex items-center gap-1.5 transition-colors"
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
                  className="py-2 px-3 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-slate-800 hover:bg-[var(--color-border-subtle)] flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadReportCSV(viewingReport)}
                  className="py-2 px-4 rounded-lg bg-[var(--color-primary)] text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[var(--color-primary-hover)] shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="py-2 px-3 rounded-lg border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-border-subtle)]"
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
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Report History ({reports.length})</CardTitle>
              {reports.length > 0 && (
                <button
                  type="button"
                  onClick={downloadAllReportsIndexCSV}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-slate-700 hover:bg-[var(--color-border-subtle)] transition-colors"
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
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5 pr-3">Requested</th>
                    <th className="py-2.5 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className={`border-b border-[var(--color-border-subtle)] ${editingId === r.id ? 'bg-[var(--color-primary-light)]' : 'hover:bg-slate-50/50'}`}>
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold">{r.reportId}</td>
                      <td className="py-2.5 pr-3 font-medium">{REPORT_TYPES.find((t) => t.value === r.type)?.label ?? r.type}</td>
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
                  ))}
                  {reports.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-[var(--color-text-muted)]">No reports generated yet.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit report parameters' : 'Generate new report'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-3">
                <Field label="Report type">
                  <Select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
                    {REPORT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </Select>
                </Field>
                {useStructured && !editingId ? (
                  <>
                    <Field label="Employee filter" hint="Specific staff or entire roster">
                      <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                        <option value="all">All employees</option>
                        {sortedEmployees.map((x) => (
                          <option key={x.id} value={x.id}>{x.firstName} {x.lastName} ({x.employeeCode})</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="House filter" hint="Specific residence or all houses">
                      <Select value={houseId} onChange={(e) => setHouseId(e.target.value)}>
                        <option value="all">All houses</option>
                        {houses.map((x) => (
                          <option key={x.id} value={x.id}>{x.name} ({x.code})</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Reporting period">
                      <Select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
                        <option value="current">Current active period</option>
                        <option value="weekly">Weekly (7 days from start)</option>
                        <option value="biweekly">Biweekly (14 days from start)</option>
                        <option value="custom">Custom date range</option>
                      </Select>
                    </Field>
                    {period !== 'current' ? (
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
                            <TextInput type="date" value={addDays(startDate, period === 'weekly' ? 6 : 13)} disabled />
                          </Field>
                        )}
                      </div>
                    ) : null}
                    <Field label="Auditing notes" hint="Optional">
                      <TextInput value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Section 21 MaineCare audit" />
                    </Field>
                    <p className="text-xs text-[var(--color-text-secondary)] rounded-lg bg-[var(--color-border-subtle)] px-3 py-2 border border-[var(--color-border)]">
                      Preview: {previewParams()}
                    </p>
                  </>
                ) : (
                  <Field label="Parameters" hint="Defaults to current period, all care staff">
                    <TextInput value={parameters} onChange={(e) => setParameters(e.target.value)} placeholder="e.g. Period 2026-10-01 to 2026-10-15" />
                  </Field>
                )}
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 rounded-lg bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)] shadow-xs transition-colors cursor-pointer">
                    {editingId ? 'Save changes' : 'Generate report'}
                  </button>
                  {editingId ? (
                    <button type="button" onClick={cancelEdit} className="rounded-lg border border-[var(--color-border)] px-4 py-2.5 hover:bg-[var(--color-border-subtle)] transition-colors cursor-pointer">
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
