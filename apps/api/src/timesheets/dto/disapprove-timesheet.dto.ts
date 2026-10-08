import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class DisapproveTimesheetDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  reason: string;
}
