import { JsonObject } from '../../common/json.types';
import { IsString, IsOptional, MinLength, MaxLength, IsEnum, IsObject } from 'class-validator';

export enum ReportType {
  PAYROLL_SUMMARY = 'payroll-summary',
  PAYCHECK_DETAIL = 'paycheck-detail',
  TAX_REPORT = 'tax-report',
  W2_REPORT = 'w2-report',
  TEN_99_REPORT = '1099-report',
  BENEFITS_ENROLLMENT = 'benefits-enrollment',
  EMPLOYEE_SELF_SERVICE = 'employee-self-service',
  ATTENDANCE = 'attendance',
  TIMESHEET = 'timesheet',
  AUDIT_LOG = 'audit-log',
  EXPORT = 'export',
  CUSTOM = 'custom',
  DASHBOARD = 'dashboard',
}

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export class UpdateReportRequestDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  reportId?: string;

  @IsEnum(ReportType)
  @IsOptional()
  type?: ReportType;

  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @IsObject()
  @IsOptional()
  parameters?: JsonObject;

  @IsObject()
  @IsOptional()
  resultData?: JsonObject;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(500)
  s3Url?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  exportId?: string;
}