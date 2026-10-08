import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsNumber, MinLength, MaxLength, Max } from 'class-validator';

export class CreateTen9289Dto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  payrollPeriodId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  annualNonEmployeeCompensation: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fees: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  totalPayments: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  emergencyMedicareWithheld: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1900)
  @Max(new Date().getFullYear() + 5)
  taxYear: number;

  @IsString()
  @IsNotEmpty()
  federalEIN: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(9)
  recipientSSNLast4: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  recipientName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  recipientAddress1: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  recipientCity: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  recipientState: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  recipientPostalCode: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  recipientCountry: string;

  @IsString()
  @IsNotEmpty()
  stateId: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  @MaxLength(9)
  stateTaxAgencyId?: string;
}

export class UpdateTen9289Dto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  recipientName?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  annualNonEmployeeCompensation?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fees?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalPayments?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  emergencyMedicareWithheld?: number;

  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(2100)
  taxYear?: number;

  @IsString()
  @IsOptional()
  federalEIN?: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  @MaxLength(9)
  recipientSSNLast4?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(200)
  recipientAddress1?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  recipientCity?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(2)
  recipientState?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(10)
  recipientPostalCode?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  recipientCountry?: string;

  @IsString()
  @IsOptional()
  stateId?: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  @MaxLength(9)
  stateTaxAgencyId?: string;
}