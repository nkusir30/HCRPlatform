import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsNumber, MinLength, MaxLength, Max } from 'class-validator';

export class CreateW2Dto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  payrollPeriodId: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1900)
  @Max(new Date().getFullYear() + 5)
  taxYear: number;

  @IsNumber()
  @IsNotEmpty()
  annualWages: number;

  @IsNumber()
  @IsOptional()
  federalIncomeTax: number;

  @IsNumber()
  @IsOptional()
  ficaSocialSecurityTax: number;

  @IsNumber()
  @IsOptional()
  ficaMedicareTax: number;

  @IsNumber()
  @IsOptional()
  stateIncomeTax: number;

  @IsNumber()
  @IsOptional()
  localIncomeTax: number;

  @IsNumber()
  @IsNotEmpty()
  totalCompensation: number;

  @IsNumber()
  @IsOptional()
  deductibleBenefits: number;

  @IsNumber()
  @IsOptional()
  agencyFees: number;

  @IsNumber()
  @IsOptional()
  otherIncome: number;

  @IsNumber()
  @IsOptional()
  taxWithheld: number;

  @IsString()
  @IsNotEmpty()
  federalEIN: string;

  @IsString()
  @IsNotEmpty()
  stateId: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  @MaxLength(9)
  stateTaxAgencyId?: string;
}

export class UpdateW2Dto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  employeeName?: string;

  @IsNumber()
  @IsOptional()
  annualWages?: number;

  @IsNumber()
  @IsOptional()
  federalIncomeTax?: number;

  @IsNumber()
  @IsOptional()
  ficaSocialSecurityTax?: number;

  @IsNumber()
  @IsOptional()
  ficaMedicareTax?: number;

  @IsNumber()
  @IsOptional()
  stateIncomeTax?: number;

  @IsNumber()
  @IsOptional()
  localIncomeTax?: number;

  @IsNumber()
  @IsOptional()
  totalCompensation?: number;

  @IsNumber()
  @IsOptional()
  deductibleBenefits?: number;

  @IsNumber()
  @IsOptional()
  agencyFees?: number;

  @IsNumber()
  @IsOptional()
  otherIncome?: number;

  @IsNumber()
  @IsOptional()
  taxWithheld?: number;

  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear() + 5)
  taxYear?: number;

  @IsString()
  @IsOptional()
  federalEIN?: string;

  @IsString()
  @IsOptional()
  stateId?: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  @MaxLength(9)
  stateTaxAgencyId?: string;
}