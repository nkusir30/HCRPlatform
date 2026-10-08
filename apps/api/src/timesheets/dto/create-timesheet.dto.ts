import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsDateString, IsEnum, MinLength, MaxLength, IsBoolean } from 'class-validator';

export enum WorkType {
  DIRECT_CARE = 'direct-care',
  CLINICAL = 'clinical',
  ADMISSION = 'admission',
  TRANSFER = 'transfer',
  OTHER = 'other',
}

export enum LaborCategory {
  CNAs = 'CNAs',
  LPNs = 'LPNs',
  RNs = 'RNs',
  THERAPISTS = 'therapists',
  SUPPORT = 'support',
  ADMINISTRATIVE = 'administrative',
}

export class CreateTimesheetDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  payrollPeriodId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsEnum(WorkType)
  @IsNotEmpty()
  workType: WorkType;

  @IsEnum(LaborCategory)
  @IsNotEmpty()
  laborCategory: LaborCategory;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  hours: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsString()
  @IsOptional()
  attestationHash?: string;
}

export class UpdateTimesheetDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  employeeId?: string;

  @IsString()
  @IsOptional()
  payrollPeriodId?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  hours?: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsEnum(WorkType)
  @IsOptional()
  workType?: WorkType;

  @IsEnum(LaborCategory)
  @IsOptional()
  laborCategory?: LaborCategory;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsString()
  @IsOptional()
  attestationHash?: string;
}