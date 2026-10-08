import { IsString, IsOptional, MinLength, MaxLength, IsNumber, IsInt, Min, Max } from 'class-validator';

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
  @Max(2100)
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