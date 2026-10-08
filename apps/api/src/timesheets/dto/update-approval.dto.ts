import { IsString, IsOptional, MinLength, MaxLength, IsInt, Min, IsDateString, IsBoolean } from 'class-validator';

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