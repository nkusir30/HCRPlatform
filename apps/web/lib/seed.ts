// Realistic demo seed data for the HCR scheduling platform.
// Ids are cuid-like strings so they survive being used as React keys and look
// consistent with what the real API returns. This data lives client-side only;
// swapping to the live API later means replacing the store's initial state.
import type { AppState, Employee, Schedule, Timesheet, Report, House } from './types';

export const ORG_ID = 'clxorg0001hcrplatformdemo';
export const COMPANY_ID = 'clxco00001hcrplatformdemo';

export const HOUSES: House[] = [
  { id: 'clxhouse01hcrplatformdemo', name: 'Maple House' },
  { id: 'clxhouse02hcrplatformdemo', name: 'Cedar House' },
  { id: 'clxhouse03hcrplatformdemo', name: 'Birch House' },
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
    houses: HOUSES,
    employees: EMPLOYEES,
    schedules: SCHEDULES,
    timesheets: TIMESHEETS,
    reports: REPORTS,
  };
}
