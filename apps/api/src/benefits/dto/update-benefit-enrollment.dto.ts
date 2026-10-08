import { IsString, IsOptional, MinLength, MaxLength, IsEnum, IsNumber, IsBoolean, Min, IsDateString } from 'class-validator';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  OPTIONS = 'options',
  OPEN = 'open',
}

export enum Coverage {
  INDIVIDUAL = 'individual',
  FAMILY = 'family',
  SELF_ONLY = 'self-only',
  CHILD_ONLY = 'child-only',
}

export class UpdateBenefitEnrollmentDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  enrollmentId?: string;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  benefitId?: string;

  @IsEnum(Coverage)
  @IsOptional()
  coverage?: Coverage;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @IsBoolean()
  @IsOptional()
  optedOut?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyPremium?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  companyShare?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  employeeContribution?: number;
}