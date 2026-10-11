// Hybrid sync: mirrors local store mutations to the HCR API (NestJS + Prisma
// Postgres) whenever the service is reachable. The browser store remains the
// source of truth for the UI — every function here is best-effort, never
// throws, and resolves to { ok, serverId?, error? } so a dead API degrades to
// "saved on this device" instead of breaking the form.
//
// Payload builders intentionally whitelist DTO fields: the API runs with
// forbidNonWhitelisted, so sending an extra key (e.g. local `id` or `status`)
// would 400 the whole request.
import { apiPost, apiPut, apiDelete } from './api';
import type { Employee, House, Report, Schedule, Timesheet } from './types';

export type SyncEntity = 'employee' | 'house' | 'schedule' | 'timesheet' | 'report';

export interface SyncResult {
  ok: boolean;
  serverId?: string;
  error?: string;
}

const SEGMENT: Record<SyncEntity, string> = {
  employee: 'employees',
  house: 'houses',
  schedule: 'schedules',
  timesheet: 'timesheets',
  report: 'reports',
};

function clean(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

function serverRowId(res: { ok: boolean; data: unknown }): string | undefined {
  if (!res.ok || !res.data || typeof res.data !== 'object') return undefined;
  const id = (res.data as { id?: unknown }).id;
  return typeof id === 'string' ? id : undefined;
}

function fail(e: unknown): SyncResult {
  return { ok: false, error: e instanceof Error ? e.message : 'network error' };
}

// ---------------------------------------------------------------------------
// Payload builders (local type -> API DTO; `rid` maps local ids to server ids)
// ---------------------------------------------------------------------------

export function employeeCreatePayload(e: Omit<Employee, 'id'>): Record<string, unknown> {
  return clean({
    companyId: e.companyId,
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    phone: e.phone,
    employeeCode: e.employeeCode,
    employmentStatus: e.employmentStatus,
    hireDate: e.hireDate,
    isActive: e.isActive,
  });
}

export function employeeUpdatePayload(e: Omit<Employee, 'id'>): Record<string, unknown> {
  return clean({
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    phone: e.phone,
    employeeCode: e.employeeCode,
    employmentStatus: e.employmentStatus,
    hireDate: e.hireDate,
    isActive: e.isActive,
  });
}

export function houseCreatePayload(h: Omit<House, 'id'>): Record<string, unknown> {
  return clean({
    companyId: h.companyId,
    name: h.name,
    code: h.code,
    address1: h.address1,
    address2: h.address2,
    city: h.city,
    state: h.state,
    postalCode: h.postalCode,
    country: h.country,
    phone: h.phone,
    email: h.email,
    managerName: h.managerName,
    managerPhone: h.managerPhone,
  });
}

export function houseUpdatePayload(h: Omit<House, 'id'>): Record<string, unknown> {
  // UpdateHouseDto has no companyId — sending it would be rejected.
  return clean({ ...houseCreatePayload(h), companyId: undefined });
}

export function schedulePayload(s: Omit<Schedule, 'id'>, rid: (id: string) => string): Record<string, unknown> {
  return clean({
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    breakDuration: s.breakDuration,
    comment: s.comment,
    scheduleType: s.scheduleType,
    payrollPeriodId: rid(s.payrollPeriodId),
    employeeId: rid(s.employeeId),
    houseId: rid(s.houseId),
  });
}

export function timesheetCreatePayload(t: Omit<Timesheet, 'id'>, rid: (id: string) => string): Record<string, unknown> {
  // CreateTimesheetDto has no `status` field (forbidNonWhitelisted) — status
  // changes go through the accept/approve endpoints only.
  return clean({
    companyId: t.companyId,
    employeeId: rid(t.employeeId),
    payrollPeriodId: rid(t.payrollPeriodId),
    date: t.date,
    workType: t.workType,
    laborCategory: t.laborCategory,
    hours: t.hours,
    notes: t.notes,
  });
}

export function timesheetUpdatePayload(t: Omit<Timesheet, 'id'>, rid: (id: string) => string): Record<string, unknown> {
  return clean({
    employeeId: rid(t.employeeId),
    payrollPeriodId: rid(t.payrollPeriodId),
    date: t.date,
    workType: t.workType,
    laborCategory: t.laborCategory,
    hours: t.hours,
    notes: t.notes,
  });
}

export function reportCreatePayload(
  r: Omit<Report, 'id' | 'reportId' | 'createdAt' | 'status'> & { reportId?: string; status?: Report['status'] },
): Record<string, unknown> {
  return clean({
    reportId: r.reportId,
    type: r.type,
    status: r.status,
    // CreateReportRequestDto.parameters is a JsonObject, not a string.
    parameters: { note: r.parameters },
  });
}

export function reportUpdatePayload(r: Pick<Report, 'type' | 'parameters'>): Record<string, unknown> {
  return clean({
    type: r.type,
    parameters: { note: r.parameters },
  });
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

export async function syncCreate(
  entity: SyncEntity,
  orgId: string,
  payload: Record<string, unknown>,
): Promise<SyncResult> {
  try {
    const res = await apiPost<unknown>(`/orgs/${encodeURIComponent(orgId)}/${SEGMENT[entity]}`, payload);
    if (!res.ok) return { ok: false, error: res.error ?? `HTTP ${res.status}` };
    return { ok: true, serverId: serverRowId(res) };
  } catch (e) {
    return fail(e);
  }
}

export async function syncUpdate(
  entity: SyncEntity,
  orgId: string,
  serverId: string,
  payload: Record<string, unknown>,
): Promise<SyncResult> {
  try {
    const res = await apiPut<unknown>(
      `/orgs/${encodeURIComponent(orgId)}/${SEGMENT[entity]}/${encodeURIComponent(serverId)}`,
      payload,
    );
    return res.ok ? { ok: true, serverId } : { ok: false, error: res.error ?? `HTTP ${res.status}` };
  } catch (e) {
    return fail(e);
  }
}

export async function syncDelete(entity: SyncEntity, orgId: string, serverId: string): Promise<SyncResult> {
  try {
    const res = await apiDelete(`/orgs/${encodeURIComponent(orgId)}/${SEGMENT[entity]}/${encodeURIComponent(serverId)}`);
    return res.ok ? { ok: true, serverId } : { ok: false, error: res.error ?? `HTTP ${res.status}` };
  } catch (e) {
    return fail(e);
  }
}

// Best-effort timesheet approval. The server enforces DRAFT -> ACCEPTED ->
// APPROVED, so approving a draft remotely may 409 — callers ignore failures.
export async function syncTimesheetApprove(orgId: string, serverId: string): Promise<SyncResult> {
  try {
    const res = await apiPost<unknown>(
      `/orgs/${encodeURIComponent(orgId)}/timesheets/${encodeURIComponent(serverId)}/approve`,
      {},
    );
    return res.ok ? { ok: true, serverId } : { ok: false, error: res.error ?? `HTTP ${res.status}` };
  } catch (e) {
    return fail(e);
  }
}
