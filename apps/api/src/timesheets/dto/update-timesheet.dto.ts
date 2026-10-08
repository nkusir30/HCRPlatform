import { IsString, IsOptional, MinLength, MaxLength, IsInt, Min, IsDateString, IsBoolean, IsEnum } from 'class-validator';

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