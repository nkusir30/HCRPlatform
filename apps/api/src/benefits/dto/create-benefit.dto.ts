import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsInt, Min, MinLength, MaxLength, IsBoolean } from 'class-validator';

export enum BenefitCategory {
  HEALTH = 'health',
  DENTAL = 'dental',
  VISION = 'vision',
  LIFE = 'life',
 DISABILITY = 'disability',
  RETIREMENT = 'retirement',
  EXTRA_CARE = 'extra-care',
  OTHER = 'other',
}

export enum BenefitType {
  EMPLOYER = 'employer',
  EMPLOYEE = 'employee',
  CO_BRIDGE = 'co-bridge',
  HR_ENABLED = 'hr-enabled',
  OTHER = 'other',
}

export class CreateBenefitDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  benefitId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEnum(BenefitCategory)
  @IsNotEmpty()
  category: BenefitCategory;

  @IsEnum(BenefitType)
  @IsNotEmpty()
  type: BenefitType;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  coverage: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  companyShare?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}

export class UpdateBenefitDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  benefitId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsEnum(BenefitCategory)
  @IsOptional()
  category?: BenefitCategory;

  @IsEnum(BenefitType)
  @IsOptional()
  type?: BenefitType;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  coverage?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  companyShare?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}