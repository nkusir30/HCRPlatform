// Realistic demo seed data for the HCR scheduling platform.
// Ids are cuid-like strings so they survive being used as React keys and look
// consistent with what the real API returns. This data lives client-side only;
// swapping to the live API later means replacing the store's initial state.
import type { AppState, Employee, Schedule, Timesheet, Report, House, Program, Account } from './types';

export const ORG_ID = 'clxorg0001hcrplatformdemo';
export const COMPANY_ID = 'clxco00001hcrplatformdemo';

export const HOUSES: House[] = [
  {
    id: 'clxhouse01hcrplatformdemo',
    companyId: COMPANY_ID,
    name: 'Maple House',
    code: 'MAPLE',
    address1: '123 Maple St',
    city: 'Sacramento',
    state: 'CA',
    postalCode: '95814',
    country: 'USA',
    phone: '9165550110',
    email: 'maple@hrv-homes.com',
    managerName: 'Maria Santos',
    managerPhone: '9165550177',
  },
  {
    id: 'clxhouse02hcrplatformdemo',
    companyId: COMPANY_ID,
    name: 'Cedar House',
    code: 'CEDAR',
    address1: '456 Cedar Ave',
    city: 'Sacramento',
    state: 'CA',
    postalCode: '95818',
    country: 'USA',
    phone: '9165550120',
    email: 'cedar@hrv-homes.com',
    managerName: 'James Wilson',
    managerPhone: '9165550178',
  },
  {
    id: 'clxhouse03hcrplatformdemo',
    companyId: COMPANY_ID,
    name: 'Birch House',
    code: 'BIRCH',
    address1: '789 Birch Ln',
    city: 'Roseville',
    state: 'CA',
    postalCode: '95661',
    country: 'USA',
    phone: '9165550130',
    email: 'birch@hrv-homes.com',
    managerName: 'Aisha Khan',
    managerPhone: '9165550179',
  },
];

// Registered accounts (client-side demo auth). These mirror the demo logins so
// signup validation can prevent duplicates, and let users add their own.
export const ACCOUNTS: Account[] = [
  { id: 'clxusr0001hcrplatformdemo', name: 'Demo Admin', email: 'admin@hrv-homes.com', password: 'Dem0Demo123!', role: 'admin' },
  { id: 'clxusr0002hcrplatformdemo', name: 'Program Director', email: 'director@hrv-homes.com', password: 'Dem0Demo123!', role: 'super_admin' },
  { id: 'clxusr0003hcrplatformdemo', name: 'Maria Garcia', email: 'maria.garcia@hrv-homes.com', password: 'Dem0Demo123!', role: 'employee' },
];

export const PROGRAMS: Program[] = [
  {
    id: 'clxprg0001hcrplatformdemo',
    companyId: COMPANY_ID,
    houseId: HOUSES[0].id,
    programId: 'PRG-2026-RCFE',
    name: 'Residential Care (RCFE)',
    code: 'RCFE',
    description: '24-hour residential care facility for elderly',
    active: true,
  },
  {
    id: 'clxprg0002hcrplatformdemo',
    companyId: COMPANY_ID,
    houseId: HOUSES[1].id,
    programId: 'PRG-2026-ALZ',
    name: 'Alzheimer’s & Dementia Care',
    code: 'ALZ',
    description: 'Specialized memory care unit',
    active: true,
  },
  {
    id: 'clxprg0003hcrplatformdemo',
    companyId: COMPANY_ID,
    programId: 'PRG-2026-HOSP',
    name: 'Hospice Support',
    code: 'HOSPICE',
    description: 'End-of-life palliative support program',
    active: false,
  },
];

export const PAYROLL_PERIOD_ID = 'clxpp000001hcrplatformdemo';

export const EMPLOYEES: Employee[] = [
  {
    id: 'clxemp0001hcrplatformdemo',
    companyId: COMPANY_ID,
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@hrv-homes.com',
    phone: '9165550101',
    employeeCode: 'EMP-1001',
    employmentStatus: 'full-time',
    hireDate: '2023-03-15',
    isActive: true,
  },
  {
    id: 'clxemp0002hcrplatformdemo',
    companyId: COMPANY_ID,
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@hrv-homes.com',
    phone: '9165550102',
    employeeCode: 'EMP-1002',
    employmentStatus: 'full-time',
    hireDate: '2022-11-01',
    isActive: true,
  },
  {
    id: 'clxemp0003hcrplatformdemo',
    companyId: COMPANY_ID,
    firstName: 'Aisha',
    lastName: 'Khan',
    email: 'aisha.khan@hrv-homes.com',
    phone: '9165550103',
    employeeCode: 'EMP-1003',
    employmentStatus: 'part-time',
    hireDate: '2024-01-20',
    isActive: true,
  },
  {
    id: 'clxemp0004hcrplatformdemo',
    companyId: COMPANY_ID,
    firstName: 'David',
    lastName: 'Nguyen',
    email: 'david.nguyen@hrv-homes.com',
    phone: '9165550104',
    employeeCode: 'EMP-1004',
    employmentStatus: 'full-time',
    hireDate: '2021-06-10',
    isActive: true,
  },
];

export const SCHEDULES: Schedule[] = [
  {
    id: 'clxsch0001hcrplatformdemo',
    employeeId: EMPLOYEES[0].id,
    houseId: HOUSES[0].id,
    payrollPeriodId: PAYROLL_PERIOD_ID,
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '16:00',
    breakDuration: 30,
    scheduleType: 'shift',
    comment: 'Weekday day shift',
  },
  {
    id: 'clxsch0002hcrplatformdemo',
    employeeId: EMPLOYEES[0].id,
    houseId: HOUSES[0].id,
    payrollPeriodId: PAYROLL_PERIOD_ID,
    dayOfWeek: 3,
    startTime: '08:00',
    endTime: '16:00',
    breakDuration: 30,
    scheduleType: 'shift',
    comment: 'Weekday day shift',
  },
  {
    id: 'clxsch0003hcrplatformdemo',
    employeeId: EMPLOYEES[1].id,
    houseId: HOUSES[1].id,
    payrollPeriodId: PAYROLL_PERIOD_ID,
    dayOfWeek: 2,
    startTime: '14:00',
    endTime: '22:00',
    breakDuration: 45,
    scheduleType: 'shift',
    comment: 'Evening coverage',
  },
  {
    id: 'clxsch0004hcrplatformdemo',
    employeeId: EMPLOYEES[2].id,
    houseId: HOUSES[2].id,
    payrollPeriodId: PAYROLL_PERIOD_ID,
    dayOfWeek: 4,
    startTime: '09:00',
    endTime: '13:00',
    scheduleType: 'flex',
    comment: 'Part-time morning block',
  },
];

export const TIMESHEETS: Timesheet[] = [
  {
    id: 'clxts00001hcrplatformdemo',
    companyId: COMPANY_ID,
    employeeId: EMPLOYEES[0].id,
    payrollPeriodId: PAYROLL_PERIOD_ID,
    date: '2026-10-05',
    workType: 'direct-care',
    laborCategory: 'CNAs',
    hours: 8,
    notes: 'Regular shift',
    status: 'approved',
  },
  {
    id: 'clxts00002hcrplatformdemo',
    companyId: COMPANY_ID,
    employeeId: EMPLOYEES[1].id,
    payrollPeriodId: PAYROLL_PERIOD_ID,
    date: '2026-10-06',
    workType: 'clinical',
    laborCategory: 'LPNs',
    hours: 8,
    notes: 'Med pass + vitals',
    status: 'submitted',
  },
  {
    id: 'clxts00003hcrplatformdemo',
    companyId: COMPANY_ID,
    employeeId: EMPLOYEES[2].id,
    payrollPeriodId: PAYROLL_PERIOD_ID,
    date: '2026-10-07',
    workType: 'direct-care',
    laborCategory: 'CNAs',
    hours: 4,
    notes: 'Half day',
    status: 'draft',
  },
];

export const REPORTS: Report[] = [
  {
    id: 'clxrep0001hcrplatformdemo',
    reportId: 'RPT-1001',
    type: 'payroll-summary',
    status: 'completed',
    parameters: 'Period: 2026-10-01 to 2026-10-15',
    createdAt: '2026-10-08T09:15:00.000Z',
  },
  {
    id: 'clxrep0002hcrplatformdemo',
    reportId: 'RPT-1002',
    type: 'timesheet',
    status: 'processing',
    parameters: 'All employees, current period',
    createdAt: '2026-10-08T14:02:00.000Z',
  },
];

export function seedState(): AppState {
  return {
    session: null,
    orgId: ORG_ID,
    companyId: COMPANY_ID,
    accounts: ACCOUNTS,
    houses: HOUSES,
    programs: PROGRAMS,
    employees: EMPLOYEES,
    schedules: SCHEDULES,
    timesheets: TIMESHEETS,
    reports: REPORTS,
  };
}
