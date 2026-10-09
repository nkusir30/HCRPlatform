// Domain types for the HCR end-to-end scheduling platform.
// Field names intentionally mirror the NestJS DTOs (create-work-schedule.dto,
// create-timesheet.dto, create-employee.dto, create-report-request.dto) so this
// UI can later be pointed at the real API with no reshaping.

export type Role = 'admin' | 'super_admin' | 'manager' | 'employee';

export interface Session {
  email: string;
  name: string;
  role: Role;
  orgId: string;
}

export interface Employee {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employeeCode: string;
  employmentStatus: string;
  hireDate: string;
  isActive: boolean;
}

export type ScheduleType = 'shift' | 'floor' | 'flex' | 'on-call';

export interface Schedule {
  id: string;
  employeeId: string;
  houseId: string;
  payrollPeriodId: string;
  dayOfWeek: number; // 0-6
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  breakDuration?: number;
  scheduleType: ScheduleType;
  comment?: string;
}

export type WorkType = 'direct-care' | 'clinical' | 'admission' | 'transfer' | 'other';
export type LaborCategory = 'CNAs' | 'LPNs' | 'RNs' | 'therapists' | 'support' | 'administrative';

export interface Timesheet {
  id: string;
  companyId: string;
  employeeId: string;
  payrollPeriodId: string;
  date: string; // YYYY-MM-DD
  workType: WorkType;
  laborCategory: LaborCategory;
  hours: number;
  notes?: string;
  status: 'draft' | 'submitted' | 'approved';
}

export type ReportType =
  | 'payroll-summary'
  | 'paycheck-detail'
  | 'tax-report'
  | 'timesheet'
  | 'attendance'
  | 'audit-log'
  | 'custom';
export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Report {
  id: string;
  reportId: string;
  type: ReportType;
  status: ReportStatus;
  parameters: string;
  createdAt: string;
}

export interface House {
  id: string;
  companyId: string;
  name: string;
  code: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  managerName?: string;
  managerPhone?: string;
}

export interface Program {
  id: string;
  companyId: string;
  houseId?: string;
  programId: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
}

// A user account registered via the signup form (client-side demo auth).
export interface Account {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface AppState {
  session: Session | null;
  orgId: string;
  companyId: string;
  accounts: Account[];
  houses: House[];
  programs: Program[];
  employees: Employee[];
  schedules: Schedule[];
  timesheets: Timesheet[];
  reports: Report[];
}
