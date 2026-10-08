import { JsonObject } from '../../common/json.types';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsArray, IsBoolean, MinLength, MaxLength } from 'class-validator';

export enum WebhookEvent {
  PAYROLL_PERIOD_CREATED = 'payroll.period.created',
  PAYROLL_PERIOD_APPROVED = 'payroll.period.approved',
  PAYROLL_PERIOD_PAID = 'payroll.period.paid',
  TIMESHEET_SUBMITTED = 'timesheet.submitted',
  TIMESHEET_APPROVED = 'timesheet.approved',
  TIMESHEET_DISAPPROVED = 'timesheet.disapproved',
  TAX_RECORD_CREATED = 'tax.record.created',
  W2_GENERATED = 'w2.generated',
  TEN_99_GENERATED = '1099.generated',
  PAYCHECK_GENERATED = 'paycheck.generated',
  PAYOUT_GENERATED = 'payout.generated',
  PAYMENT_PROCESSED = 'payment.processed',
  DOCUMENT_UPLOADED = 'document.uploaded',
  DOCUMENT_SIGNED = 'document.signed',
  NOTIFICATION_SENT = 'notification.sent',
  EMPLOYEE_CREATED = 'employee.created',
  EMPLOYEE_UPDATED = 'employee.updated',
  CONTRACTOR_CREATED = 'contractor.created',
  ATTENDANCE_RECORDED = 'attendance.recorded',
  APPROVAL_REQUESTED = 'approval.requested',
  ENVIRONMENT_EVENT = 'environment.event',
  CUSTOM = 'custom',
}

export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DISABLED = 'disabled',
  ERROR = 'error',
  DELETED = 'deleted',
}

export class CreateWebhookDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  webhookId?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  url: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(256)
  secret?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  secretId?: string;

  @IsArray()
  @IsNotEmpty()
  eventTypes: WebhookEvent[];

  @IsEnum(WebhookStatus)
  @IsOptional()
  status?: WebhookStatus;

  @IsObject()
  @IsOptional()
  settings?: JsonObject;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class UpdateWebhookDto {
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(500)
  url?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(256)
  secret?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  secretId?: string;

  @IsArray()
  @IsOptional()
  eventTypes?: WebhookEvent[];

  @IsEnum(WebhookStatus)
  @IsOptional()
  status?: WebhookStatus;

  @IsObject()
  @IsOptional()
  settings?: JsonObject;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}