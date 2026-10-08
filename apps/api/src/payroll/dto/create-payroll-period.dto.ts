import { JsonObject } from '../../common/json.types';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsObject, MinLength, MaxLength } from 'class-validator';

export enum PayrollFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  SEMIMONTCHLY = 'semimonthly',
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  DAILY = 'daily',
}

export enum PayrollStatus {
  DRAFT = 'draft',
  PREVIEW = 'preview',
  CALCULATING = 'calculating',
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export class CreatePayrollPeriodDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  periodId?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsEnum(PayrollStatus)
  @IsNotEmpty()
  status: PayrollStatus;

  @IsEnum(PayrollFrequency)
  @IsNotEmpty()
  payrollFrequency: PayrollFrequency;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(10)
  currency?: string;

  @IsObject()
  @IsOptional()
  settings?: JsonObject;
}

export class UpdatePayrollPeriodDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  periodId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

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

  @IsObject()
  @IsOptional()
  settings?: JsonObject;
}