import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, IsDateString, MinLength, MaxLength } from 'class-validator';

export class CreateApprovalDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  payrollPeriodId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

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
}

export class UpdateApprovalDto {
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

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}