import { IsString, IsOptional, MinLength, MaxLength, IsNumber, IsInt, Min, Max } from 'class-validator';

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