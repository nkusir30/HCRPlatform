import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(36)
  code?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(200)
  address1?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(200)
  address2?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(2)
  state?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(10)
  postalCode?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  country?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(200)
  website?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  industry?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(200)
  onboardingUrl?: string;
}