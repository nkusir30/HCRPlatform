import { IsString, IsNotEmpty, IsEmail, MinLength, IsIn } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(['admin', 'super_admin', 'manager', 'employee'])
  role: string;

  // Tenant scope — the web client sends its resolved org/company ids so the new
  // user lands in the same tenant as the rest of the demo data.
  @IsString()
  @IsNotEmpty()
  orgId: string;

  @IsString()
  @IsNotEmpty()
  companyId: string;
}
