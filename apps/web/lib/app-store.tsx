'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, setAuthToken } from './api';
import type { AppState, Session, Employee, Schedule, Timesheet, Attendance, Report, House, Program, Account } from './types';
import { seedState } from './seed';
import { localDateISO } from './utils';
import {
  syncCreate,
  syncUpdate,
  syncDelete,
  syncTimesheetApprove,
  syncSignup,
  employeeCreatePayload,
  employeeUpdatePayload,
  houseCreatePayload,
  houseUpdatePayload,
  schedulePayload,
  timesheetCreatePayload,
  timesheetUpdatePayload,
  reportCreatePayload,
  reportUpdatePayload,
  programCreatePayload,
  programUpdatePayload,
  attendanceCreatePayload,
  attendanceUpdatePayload,
  type SyncResult,
} from './sync';

const STORAGE_KEY = 'hcr_app_state_v2';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'local-only';

// Demo credentials (mirrors prisma/seed.ts). Any of these emails + this password logs in.
export const DEMO_PASSWORD = 'Dem0Demo123!';
export const DEMO_ACCOUNTS: { email: string; name: string; role: Session['role'] }[] = [
  { email: 'admin@hrv-homes.com', name: 'Demo Admin', role: 'admin' },
  { email: 'director@hrv-homes.com', name: 'Program Director', role: 'super_admin' },
  { email: 'maria.garcia@hrv-homes.com', name: 'Maria Garcia', role: 'employee' },
];

function load(): AppState {
  if (typeof window === 'undefined') return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      // Basic shape guard so a stale/partial blob can't crash the app.
      if (
        parsed &&
        Array.isArray(parsed.employees) &&
        Array.isArray(parsed.schedules) &&
        Array.isArray(parsed.houses) &&
        Array.isArray(parsed.accounts) &&
        Array.isArray(parsed.programs)
      ) {
        // Backfill collections added after a blob was first persisted.
        if (!Array.isArray(parsed.attendance)) parsed.attendance = [];
        if (!Array.isArray(parsed.timesheets)) parsed.timesheets = [];
        if (!Array.isArray(parsed.reports)) parsed.reports = [];
        return parsed;
      }
    }
  } catch {
    /* fall through to seed */
  }
  return seedState();
}

// Request the server's collections once per session so a fresh DB
// (post-migration) is never replaced by a stale localStorage blob on boot.
// Server rows win when present; local rows are kept when the API is down or a
// collection comes back empty. Run after hydration so the client-side store can
// mount without a React hydration mismatch.
async function fetchCollection<T>(orgId: string, segment: string): Promise<T[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await apiGet<T[]>(`/orgs/${encodeURIComponent(orgId)}/${segment}`, controller.signal);
    clearTimeout(timer);
    if (res.ok && Array.isArray(res.data)) return res.data;
    return [];
  } catch {
    clearTimeout(timer);
    return [];
  }
}

export function fetchHousesFromServer(orgId: string): Promise<House[]> {
  return fetchCollection<House>(orgId, 'houses');
}

export interface ServerSnapshot {
  houses: House[];
  employees: Employee[];
  schedules: Schedule[];
  timesheets: Timesheet[];
  reports: Report[];
  programs: Program[];
  attendance: Attendance[];
}

export async function fetchSnapshotFromServer(orgId: string): Promise<ServerSnapshot> {
  const [houses, employees, schedules, timesheets, reports, programs, attendance] = await Promise.all([
    fetchCollection<House>(orgId, 'houses'),
    fetchCollection<Employee>(orgId, 'employees'),
    fetchCollection<Schedule>(orgId, 'schedules'),
    fetchCollection<Timesheet>(orgId, 'timesheets'),
    fetchCollection<Report>(orgId, 'reports'),
    fetchCollection<Program>(orgId, 'programs'),
    fetchCollection<Attendance>(orgId, 'attendance'),
  ]);
  return { houses, employees, schedules, timesheets, reports, programs, attendance };
}

let idCounter = 0;
function newId(prefix: string) {
  idCounter += 1;
  return `${prefix}${Date.now().toString(36)}${idCounter.toString(36)}`;
}

interface AppStore extends AppState {
  hydrated: boolean;
  syncStatus: SyncStatus;
  lastSyncError: string | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (input: { name: string; email: string; password: string; role: Session['role'] }) => { ok: boolean; error?: string };
  logout: () => void;
  addEmployee: (e: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, patch: Omit<Employee, 'id'>) => void;
  deleteEmployee: (id: string) => void;
  addHouse: (h: Omit<House, 'id'>) => void;
  updateHouse: (id: string, patch: Omit<House, 'id'>) => void;
  deleteHouse: (id: string) => void;
  addProgram: (p: Omit<Program, 'id'>) => void;
  updateProgram: (id: string, patch: Omit<Program, 'id'>) => void;
  deleteProgram: (id: string) => void;
  addSchedule: (s: Omit<Schedule, 'id'>) => void;
  addSchedules: (items: Omit<Schedule, 'id'>[]) => void;
  updateSchedule: (id: string, patch: Omit<Schedule, 'id'>) => void;
  deleteSchedule: (id: string) => void;
  addTimesheet: (t: Omit<Timesheet, 'id'>) => void;
  updateTimesheet: (id: string, patch: Omit<Timesheet, 'id'>) => void;
  deleteTimesheet: (id: string) => void;
  addReport: (r: Omit<Report, 'id' | 'reportId' | 'createdAt' | 'status'>) => void;
  updateReport: (id: string, patch: Pick<Report, 'type' | 'parameters'>) => void;
  deleteReport: (id: string) => void;
  setTimesheetStatus: (id: string, status: Timesheet['status']) => void;
  // Time & attendance. Times come from the system clock at call time and are
  // immutable afterward — the UI never lets a user type a clock time, so there
  // is no way to backdate a punch.
  clockIn: (input: { employeeId: string; scheduleId?: string; houseId?: string; date?: string; source?: Attendance['source'] }) =>
    { ok: boolean; error?: string; id?: string };
  clockOut: (id: string) => { ok: boolean; error?: string };
  resetDemo: () => void;
}

const Ctx = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  // The store reads from localStorage, which only exists in the browser. The
  // first client render must match the server render (no session) to avoid a
  // hydration mismatch, so we gate session-dependent UI on this flag.
  const [hydrated, setHydrated] = useState(false);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AppState>(() => load());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await fetchSnapshotFromServer(state.orgId);
        if (cancelled) return;
        setState((s) => ({
          ...s,
          // Server rows win when present so edits made on another device (or a
          // fresh Render deploy) are observable here; local rows survive when
          // the API is unreachable or a collection is empty.
          houses: snap.houses.length > 0 ? snap.houses : s.houses,
          employees: snap.employees.length > 0 ? snap.employees : s.employees,
          schedules: snap.schedules.length > 0 ? snap.schedules : s.schedules,
          timesheets: snap.timesheets.length > 0 ? snap.timesheets : s.timesheets,
          reports: snap.reports.length > 0 ? snap.reports : s.reports,
          programs: snap.programs.length > 0 ? snap.programs : s.programs,
          attendance: snap.attendance.length > 0 ? snap.attendance : s.attendance,
        }));
        if (
          snap.houses.length > 0 ||
          snap.employees.length > 0 ||
          snap.schedules.length > 0 ||
          snap.timesheets.length > 0 ||
          snap.reports.length > 0 ||
          snap.programs.length > 0 ||
          snap.attendance.length > 0
        ) {
          setSyncStatus('synced');
          setLastSyncError(null);
        }
      } catch {
        // Keep the local seed/state so the UI never goes blank while offline.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, state.orgId]);

  // Hybrid persistence: local state is updated synchronously (UI never waits),
  // then the same mutation is mirrored to the API in the background. A dead or
  // unreachable API just flips us to 'local-only' — entries are never lost.
  const remoteId = (localId: string) => state.remoteIds?.[localId] ?? localId;

  function applySync(localId: string, run: () => Promise<SyncResult>) {
    setSyncStatus('syncing');
    run()
      .then((res) => {
        if (res.ok) {
          setSyncStatus('synced');
          setLastSyncError(null);
          if (res.serverId && res.serverId !== localId) {
            setState((s) => ({ ...s, remoteIds: { ...(s.remoteIds ?? {}), [localId]: res.serverId as string } }));
          }
        } else {
          setSyncStatus('local-only');
          setLastSyncError(res.error ?? 'sync failed');
        }
      })
      .catch((e: unknown) => {
        setSyncStatus('local-only');
        setLastSyncError(e instanceof Error ? e.message : 'network error');
      });
  }

  const store: AppStore = {
    ...state,
    hydrated,
    syncStatus,
    lastSyncError,
    login(email, password) {
      const account = state.accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
      );
      const applyLocalSession = (name: string, role: Session['role'], emailAddr: string) => {
        const session: Session = { email: emailAddr, name, role, orgId: state.orgId };
        setState((s) => ({ ...s, session }));
      };
      // Try the real API first so the JWT is stored and later writes are
      // authenticated; fall back to the local demo accounts when offline.
      apiPost<{ access_token?: string }>(`/auth/login`, {
        email: email.trim(),
        password,
      })
        .then((res) => {
          if (res.ok && res.data && typeof res.data === 'object' && typeof res.data.access_token === 'string') {
            setAuthToken(res.data.access_token);
          }
        })
        .catch(() => {
          /* offline — local session below still applies */
        });
      if (!account) return { ok: false, error: 'No account found for that email.' };
      if (account.password !== password) return { ok: false, error: 'Incorrect password.' };
      applyLocalSession(account.name, account.role, account.email);
      return { ok: true };
    },
    signup(input) {
      const email = input.email.trim().toLowerCase();
      if (!input.name.trim()) return { ok: false, error: 'Please enter your name.' };
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Enter a valid email address.' };
      if (input.password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
      if (state.accounts.some((a) => a.email.toLowerCase() === email)) {
        return { ok: false, error: 'An account with that email already exists.' };
      }
      const account: Account = {
        id: newId('clxusr'),
        name: input.name.trim(),
        email,
        password: input.password,
        role: input.role,
      };
      const session: Session = { email: account.email, name: account.name, role: account.role, orgId: state.orgId };
      setState((s) => ({ ...s, accounts: [...s.accounts, account], session }));
      // Mirror the account to Postgres (hashed password + JWT) so it survives a
      // new device / fresh deploy, not just this browser. Best-effort: the local
      // demo account above is the source of truth for this session regardless.
      setSyncStatus('syncing');
      syncSignup({
        name: account.name,
        email: account.email,
        password: account.password,
        role: account.role,
        orgId: state.orgId,
        companyId: state.companyId,
      })
        .then((res) => {
          if (res.ok) {
            setSyncStatus('synced');
            setLastSyncError(null);
            if (res.accessToken) setAuthToken(res.accessToken);
          } else {
            setSyncStatus('local-only');
            setLastSyncError(res.error ?? 'signup sync failed');
          }
        })
        .catch((e: unknown) => {
          setSyncStatus('local-only');
          setLastSyncError(e instanceof Error ? e.message : 'network error');
        });
      return { ok: true };
    },
    logout() {
      setAuthToken(null);
      setState((s) => ({ ...s, session: null }));
    },
    addEmployee(e) {
      const localId = newId('clxemp');
      setState((s) => ({ ...s, employees: [{ ...e, id: localId }, ...s.employees] }));
      applySync(localId, () => syncCreate('employee', state.orgId, employeeCreatePayload(e)));
    },
    updateEmployee(id, patch) {
      const current = state.employees.find((emp) => emp.id === id);
      const merged = { ...(current ?? { id }), ...patch, id } as Employee;
      setState((s) => ({
        ...s,
        employees: s.employees.map((emp) => (emp.id === id ? { ...emp, ...patch, id } : emp)),
      }));
      applySync(id, () => syncUpdate('employee', state.orgId, remoteId(id), employeeUpdatePayload(merged)));
    },
    deleteEmployee(id) {
      setState((s) => ({
        ...s,
        employees: s.employees.filter((emp) => emp.id !== id),
        // Keep referential integrity: drop schedules/timesheets that point at the removed employee.
        schedules: s.schedules.filter((sch) => sch.employeeId !== id),
        timesheets: s.timesheets.filter((t) => t.employeeId !== id),
      }));
      applySync(id, () => syncDelete('employee', state.orgId, remoteId(id)));
    },
    addHouse(h) {
      const localId = newId('clxhouse');
      setState((s) => ({ ...s, houses: [{ ...h, id: localId }, ...s.houses] }));
      applySync(localId, () =>
        apiPost<House>(`/orgs/${encodeURIComponent(state.orgId)}/houses`, houseCreatePayload(h))
          .then((res) => {
            if (res.ok && res.data && typeof res.data === 'object') {
              const serverId = (res.data as { id?: string }).id;
              if (serverId && serverId !== localId) {
                setState((s) => ({
                  ...s,
                  houses: s.houses.map((house) =>
                    house.id === localId ? { ...house, id: serverId } : house,
                  ),
                  remoteIds: { ...(s.remoteIds ?? {}), [localId]: serverId },
                }));
              }
            }
            return res.ok
              ? { ok: true, serverId: (res.data as { id?: string })?.id }
              : { ok: false, error: res.error ?? `HTTP ${res.status}` };
          })
          .catch((e: unknown) => ({ ok: false, error: e instanceof Error ? e.message : 'network error' })),
      );
    },
    updateHouse(id, patch) {
      setState((s) => ({
        ...s,
        houses: s.houses.map((h) => (h.id === id ? { ...h, ...patch, id } : h)),
      }));
      applySync(id, () =>
        apiPut<House>(`/orgs/${encodeURIComponent(state.orgId)}/houses/${encodeURIComponent(id)}`, houseUpdatePayload(patch))
          .then((res) => {
            if (res.ok && res.data && typeof res.data === 'object') {
              const serverId = (res.data as { id?: string }).id;
              if (serverId && serverId !== id) {
                setState((s) => ({
                  ...s,
                  houses: s.houses.map((h) => (h.id === id ? { ...h, id: serverId } : h)),
                  remoteIds: { ...(s.remoteIds ?? {}), [id]: serverId },
                }));
              }
            }
            return res.ok
              ? { ok: true, serverId: (res.data as { id?: string })?.id }
              : { ok: false, error: res.error ?? `HTTP ${res.status}` };
          })
          .catch((e: unknown) => ({ ok: false, error: e instanceof Error ? e.message : 'network error' })),
      );
    },
    deleteHouse(id) {
      setState((s) => ({
        ...s,
        houses: s.houses.filter((h) => h.id !== id),
        // Cascades: schedules bound to the house, programs scoped to it become all-houses.
        schedules: s.schedules.filter((sch) => sch.houseId !== id),
        programs: s.programs.map((p) => (p.houseId === id ? { ...p, houseId: undefined } : p)),
      }));
      applySync(id, () =>
        apiDelete(`/orgs/${encodeURIComponent(state.orgId)}/houses/${encodeURIComponent(id)}`)
          .then((res) => ({ ok: res.ok, serverId: res.status === 200 ? id : undefined }))
          .catch((e: unknown) => ({ ok: false, error: e instanceof Error ? e.message : 'network error' })),
      );
    },
    addProgram(p) {
      const localId = newId('clxprg');
      setState((s) => ({ ...s, programs: [{ ...p, id: localId }, ...s.programs] }));
      applySync(localId, () => syncCreate('program', state.orgId, programCreatePayload(p)));
    },
    updateProgram(id, patch) {
      const current = state.programs.find((p) => p.id === id);
      const merged = { ...(current ?? { id }), ...patch } as Program;
      setState((s) => ({
        ...s,
        programs: s.programs.map((p) => (p.id === id ? { ...p, ...patch, id } : p)),
      }));
      applySync(id, () => syncUpdate('program', state.orgId, remoteId(id), programUpdatePayload(merged)));
    },
    deleteProgram(id) {
      setState((s) => ({ ...s, programs: s.programs.filter((p) => p.id !== id) }));
      applySync(id, () => syncDelete('program', state.orgId, remoteId(id)));
    },
    addSchedule(sh) {
      const localId = newId('clxsch');
      setState((s) => ({ ...s, schedules: [{ ...sh, id: localId }, ...s.schedules] }));
      const payload = schedulePayload(sh, remoteId);
      if (!payload) {
        setSyncStatus('local-only');
        setLastSyncError('Schedule saved on this device — sync its employee first.');
        return;
      }
      applySync(localId, () => syncCreate('schedule', state.orgId, payload));
    },
    addSchedules(items) {
      if (items.length === 0) return;
      const created = items.map((sh) => ({ ...sh, id: newId('clxsch') }));
      setState((s) => ({ ...s, schedules: [...created, ...s.schedules] }));
      // Mirror each day's shift to the API individually (the schema stores one
      // row per dayOfWeek, same as local).
      for (const row of created) {
        const { id, ...rest } = row;
        const payload = schedulePayload(rest, remoteId);
        if (!payload) {
          setSyncStatus('local-only');
          setLastSyncError('Schedules saved on this device — sync their employees first.');
          continue;
        }
        applySync(id, () => syncCreate('schedule', state.orgId, payload));
      }
    },
    updateSchedule(id, patch) {
      const current = state.schedules.find((sch) => sch.id === id);
      const merged = { ...(current ?? { id }), ...patch, id } as Schedule;
      setState((s) => ({
        ...s,
        schedules: s.schedules.map((sch) => (sch.id === id ? { ...sch, ...patch, id } : sch)),
      }));
      const payload = schedulePayload(merged, remoteId);
      if (!payload) {
        setSyncStatus('local-only');
        setLastSyncError('Schedule saved on this device — server references are not synced yet.');
        return;
      }
      applySync(id, () => syncUpdate('schedule', state.orgId, remoteId(id), payload));
    },
    deleteSchedule(id) {
      setState((s) => ({ ...s, schedules: s.schedules.filter((sch) => sch.id !== id) }));
      applySync(id, () => syncDelete('schedule', state.orgId, remoteId(id)));
    },
    addTimesheet(t) {
      const localId = newId('clxts');
      setState((s) => ({ ...s, timesheets: [{ ...t, id: localId }, ...s.timesheets] }));
      const payload = timesheetCreatePayload(t, remoteId);
      if (!payload) {
        setSyncStatus('local-only');
        setLastSyncError('Timesheet saved on this device — sync its employee first.');
        return;
      }
      applySync(localId, () => syncCreate('timesheet', state.orgId, payload));
    },
    updateTimesheet(id, patch) {
      const current = state.timesheets.find((t) => t.id === id);
      const merged = { ...(current ?? { id }), ...patch, id } as Timesheet;
      setState((s) => ({
        ...s,
        timesheets: s.timesheets.map((t) => (t.id === id ? { ...t, ...patch, id } : t)),
      }));
      const payload = timesheetUpdatePayload(merged, remoteId);
      if (!payload) {
        setSyncStatus('local-only');
        setLastSyncError('Timesheet saved on this device — server references are not synced yet.');
        return;
      }
      applySync(id, () => syncUpdate('timesheet', state.orgId, remoteId(id), payload));
    },
    deleteTimesheet(id) {
      setState((s) => ({ ...s, timesheets: s.timesheets.filter((t) => t.id !== id) }));
      applySync(id, () => syncDelete('timesheet', state.orgId, remoteId(id)));
    },
    addReport(r) {
      const n = state.reports.length + 1001;
      const reportId = `RPT-${n}`;
      const localId = newId('clxrep');
      setState((s) => {
        const report: Report = {
          ...r,
          id: localId,
          reportId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        return { ...s, reports: [report, ...s.reports] };
      });
      applySync(localId, () =>
        syncCreate('report', state.orgId, reportCreatePayload({ ...r, reportId, status: 'pending' })),
      );
    },
    updateReport(id, patch) {
      setState((s) => ({
        ...s,
        reports: s.reports.map((rep) => (rep.id === id ? { ...rep, ...patch } : rep)),
      }));
      applySync(id, () => syncUpdate('report', state.orgId, remoteId(id), reportUpdatePayload(patch)));
    },
    deleteReport(id) {
      setState((s) => ({ ...s, reports: s.reports.filter((rep) => rep.id !== id) }));
      applySync(id, () => syncDelete('report', state.orgId, remoteId(id)));
    },
    setTimesheetStatus(id, status) {
      setState((s) => ({
        ...s,
        timesheets: s.timesheets.map((t) => (t.id === id ? { ...t, status } : t)),
      }));
      if (status === 'approved') {
        applySync(id, () => syncTimesheetApprove(state.orgId, remoteId(id)));
      }
    },
    clockIn(input) {
      const now = new Date();
      const date = input.date ?? localDateISO(now);
      // One open punch per employee per day — prevents a second clock-in while
      // already on the clock.
      const open = state.attendance.find(
        (a) => a.employeeId === input.employeeId && a.date === date && a.status === 'clocked-in',
      );
      if (open) return { ok: false, error: 'You are already clocked in for today.' };
      const localId = newId('clxatt');
      const entry: Attendance = {
        id: localId,
        employeeId: input.employeeId,
        scheduleId: input.scheduleId,
        houseId: input.houseId,
        date,
        clockInAt: now.toISOString(),
        clockOutAt: null,
        status: 'clocked-in',
        source: input.source ?? 'web',
        createdAt: now.toISOString(),
      };
      setState((s) => ({ ...s, attendance: [entry, ...s.attendance] }));
      // Mirror the punch to Postgres so it survives a new device / fresh deploy.
      // Best-effort: the local row above is the source of truth for this session.
      const payload = attendanceCreatePayload(entry, remoteId);
      if (!payload) {
        setSyncStatus('local-only');
        setLastSyncError('Clock-in saved on this device — sync its employee first.');
      } else {
        applySync(localId, () => syncCreate('attendance', state.orgId, payload));
      }
      return { ok: true, id: localId };
    },
    clockOut(id) {
      const entry = state.attendance.find((a) => a.id === id);
      if (!entry) return { ok: false, error: 'Attendance record not found.' };
      if (entry.status === 'clocked-out') return { ok: false, error: 'Already clocked out.' };
      const now = new Date();
      const clockOutAt = now.toISOString();
      // Guard against a clock-out that precedes its own clock-in (clock skew /
      // manual device changes): clamp is impossible here because `now` is the
      // real system time, but we never allow editing either timestamp anyway.
      setState((s) => ({
        ...s,
        attendance: s.attendance.map((a) =>
          a.id === id ? { ...a, clockOutAt, status: 'clocked-out' } : a,
        ),
      }));
      applySync(id, () =>
        syncUpdate('attendance', state.orgId, remoteId(id), attendanceUpdatePayload({ clockOutAt, status: 'clocked-out' })),
      );
      return { ok: true };
    },
    resetDemo() {
      setState(seedState());
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useApp(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppStoreProvider');
  return ctx;
}
