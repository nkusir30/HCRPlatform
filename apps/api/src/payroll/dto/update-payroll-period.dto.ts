import { PayrollFrequency } from './create-payroll-period.dto';
import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';

export enum PayrollStatus {
  DRAFT = 'draft',
  PREVIEW = 'preview',
  CALCULATING = 'calculating',
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export class UpdatePayrollPeriodDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  periodId?: string;

  @IsEnum(PayrollStatus)
  @IsOptional()
  status?: PayrollStatus;

  @IsEnum(PayrollFrequency)
  @IsOptional()
  payrollFrequency?: PayrollFrequency;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(10)
  currency?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;
}