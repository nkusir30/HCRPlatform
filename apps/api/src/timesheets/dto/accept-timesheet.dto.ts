import { IsString, IsNotEmpty, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class AcceptTimesheetDto {
  // Acting user. Auth is not yet wired into this controller (no global
  // guard), so the caller supplies the accepting user's id explicitly.
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsBoolean()
  @IsNotEmpty()
  attested: boolean;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  totalsHash: string;
}
