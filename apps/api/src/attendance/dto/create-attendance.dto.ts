import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

// Real-time clock punch. Timestamps come from the server clock, never the user,
// so there is no way to backdate. `attendanceId` and `status` are generated
// server-side; clients must not send them (forbidNonWhitelisted).
export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsDateString()
  @IsNotEmpty()
  clockInAt: string;

  @IsString()
  @IsOptional()
  scheduleId?: string;

  @IsString()
  @IsOptional()
  houseId?: string;

  @IsString()
  @IsOptional()
  source?: string;
}

// Clock-out only closes an open punch. `clockOutAt` is captured server-side too.
export class UpdateAttendanceDto {
  @IsDateString()
  @IsOptional()
  clockOutAt?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  source?: string;
}
