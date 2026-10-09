'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { AppState, Session, Employee, Schedule, Timesheet, Report } from './types';
import { seedState } from './seed';

const STORAGE_KEY = 'hcr_app_state_v1';

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
      if (parsed && Array.isArray(parsed.employees) && Array.isArray(parsed.schedules)) {
        return parsed;
      }
    }
  } catch {
    /* fall through to seed */
  }
  return seedState();
}

let idCounter = 0;
function newId(prefix: string) {
  idCounter += 1;
  return `${prefix}${Date.now().toString(36)}${idCounter.toString(36)}`;
}

interface AppStore extends AppState {
  hydrated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  addEmployee: (e: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, patch: Omit<Employee, 'id'>) => void;
  deleteEmployee: (id: string) => void;
  addSchedule: (s: Omit<Schedule, 'id'>) => void;
  addTimesheet: (t: Omit<Timesheet, 'id'>) => void;
  addReport: (r: Omit<Report, 'id' | 'reportId' | 'createdAt' | 'status'>) => void;
  setTimesheetStatus: (id: string, status: Timesheet['status']) => void;
  resetDemo: () => void;
}

const Ctx = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => load());
  // The store reads from localStorage, which only exists in the browser. The
  // first client render must match the server render (no session) to avoid a
  // hydration mismatch, so we gate session-dependent UI on this flag.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [state]);

  const store: AppStore = {
    ...state,
    hydrated,
    login(email, password) {
      const match = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
      if (!match) return { ok: false, error: 'No account found for that email.' };
      if (password !== DEMO_PASSWORD) return { ok: false, error: 'Incorrect password.' };
      const session: Session = {
        email: match.email,
        name: match.name,
        role: match.role,
        orgId: state.orgId,
      };
      setState((s) => ({ ...s, session }));
      return { ok: true };
    },
    logout() {
      setState((s) => ({ ...s, session: null }));
    },
    addEmployee(e) {
      setState((s) => ({ ...s, employees: [{ ...e, id: newId('clxemp') }, ...s.employees] }));
    },
    updateEmployee(id, patch) {
      setState((s) => ({
        ...s,
        employees: s.employees.map((emp) => (emp.id === id ? { ...emp, ...patch, id } : emp)),
      }));
    },
    deleteEmployee(id) {
      setState((s) => ({
        ...s,
        employees: s.employees.filter((emp) => emp.id !== id),
        // Keep referential integrity: drop schedules/timesheets that point at the removed employee.
        schedules: s.schedules.filter((sch) => sch.employeeId !== id),
        timesheets: s.timesheets.filter((t) => t.employeeId !== id),
      }));
    },
    addSchedule(sh) {
      setState((s) => ({ ...s, schedules: [{ ...sh, id: newId('clxsch') }, ...s.schedules] }));
    },
    addTimesheet(t) {
      setState((s) => ({ ...s, timesheets: [{ ...t, id: newId('clxts') }, ...s.timesheets] }));
    },
    addReport(r) {
      setState((s) => {
        const n = s.reports.length + 1001;
        const report: Report = {
          ...r,
          id: newId('clxrep'),
          reportId: `RPT-${n}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        return { ...s, reports: [report, ...s.reports] };
      });
    },
    setTimesheetStatus(id, status) {
      setState((s) => ({
        ...s,
        timesheets: s.timesheets.map((t) => (t.id === id ? { ...t, status } : t)),
      }));
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
