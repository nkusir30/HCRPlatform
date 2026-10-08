import { JsonObject } from '../../common/json.types';
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsEmail, IsObject } from 'class-validator';

export class CreateHouseDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  address1: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(200)
  address2?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  state: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  country: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  managerName?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  managerPhone?: string;

  @IsObject()
  @IsOptional()
  settings?: JsonObject;
}

export class UpdateHouseDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
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

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  managerName?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  managerPhone?: string;

  @IsObject()
  @IsOptional()
  settings?: JsonObject;
}