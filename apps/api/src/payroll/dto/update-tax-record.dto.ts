import { IsString, IsOptional, MinLength, MaxLength, IsNumber, IsDateString, IsInt, Min, Max, IsEnum } from 'class-validator';

export enum TaxType {
  FEDERAL = 'federal',
  STATE = 'state',
  LOCAL = 'local',
  FICA = 'fica',
  OTHER = 'other',
}

export class UpdateTaxRecordDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  @MaxLength(9)
  taxId?: string;

  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(2100)
  taxYear?: number;

  @IsEnum(TaxType)
  @IsOptional()
  taxType?: TaxType;

  @IsString()
  @IsOptional()
  payerId?: string;

  @IsString()
  @IsOptional()
  payerName?: string;

  @IsNumber()
  @IsOptional()
  wages?: number;

  @IsNumber()
  @IsOptional()
  federalTax?: number;

  @IsNumber()
  @IsOptional()
  ficaSocialSecurityTax?: number;

  @IsNumber()
  @IsOptional()
  ficaMedicareTax?: number;

  @IsNumber()
  @IsOptional()
  stateTax?: number;

  @IsNumber()
  @IsOptional()
  localTax?: number;

  @IsNumber()
  @IsOptional()
  totalTax?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(10000)
  basisPoints?: number;
}