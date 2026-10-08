import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength, IsDateString } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(254)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(15)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  employeeCode: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  @MaxLength(9)
  ssnLast4?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  employmentStatus: string;

  @IsDateString()
  @IsNotEmpty()
  hireDate: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  lastName?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(254)
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(15)
  phone?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  employeeCode?: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  @MaxLength(9)
  ssnLast4?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  employmentStatus?: string;

  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}