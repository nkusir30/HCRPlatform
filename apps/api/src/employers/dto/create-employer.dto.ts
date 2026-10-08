import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsEnum } from 'class-validator';

export enum EmployerType {
  DIRECT_CARE = 'direct-care',
  CLINICAL = 'clinical',
  ADMINISTRATIVE = 'administrative',
  CONTRACTOR = 'contractor',
  TEMPORARY = 'temporary',
  OTHER = 'other',
}

export enum EmployerStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  PENDING = 'pending',
}

export class CreateEmployerDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  employerId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
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

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(254)
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  industry?: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  @MaxLength(9)
  taxId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  actId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  managementPhpId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  businessPhpId?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  addressCertification?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  businessLicense?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  serviceContractorLicense?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  medicaidProviderNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  medicareProviderNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  sywCert?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  permittitNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  payrollContractorGovtAccountNumber?: string;

  @IsEnum(EmployerType)
  @IsOptional()
  employerType?: EmployerType;

  @IsEnum(EmployerStatus)
  @IsOptional()
  status?: EmployerStatus;
}

export class UpdateEmployerDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
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

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(254)
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  industry?: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  @MaxLength(9)
  taxId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  actId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  managementPhpId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  businessPhpId?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  addressCertification?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  businessLicense?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  serviceContractorLicense?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  medicaidProviderNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  medicareProviderNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  sywCert?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  permittitNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  payrollContractorGovtAccountNumber?: string;

  @IsEnum(EmployerType)
  @IsOptional()
  employerType?: EmployerType;

  @IsEnum(EmployerStatus)
  @IsOptional()
  status?: EmployerStatus;
}