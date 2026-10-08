import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsEnum, MinLength, MaxLength } from 'class-validator';

export enum ScheduleType {
  SHIFT = 'shift',
  FLOOR = 'floor',
  FLEX = 'flex',
  ON_CALL = 'on-call',
}

export class CreateWorkScheduleDto {
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(5)
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(5)
  endTime: string;

  @IsOptional()
  @IsInt()
  breakDuration?: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsEnum(ScheduleType)
  @IsNotEmpty()
  scheduleType: ScheduleType;

  @IsString()
  @IsNotEmpty()
  payrollPeriodId: string;

  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  houseId: string;
}

export class UpdateWorkScheduleDto {
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(5)
  startTime?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(5)
  endTime?: string;

  @IsOptional()
  @IsInt()
  breakDuration?: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsEnum(ScheduleType)
  @IsOptional()
  scheduleType?: ScheduleType;

  @IsString()
  @IsOptional()
  payrollPeriodId?: string;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  houseId?: string;
}