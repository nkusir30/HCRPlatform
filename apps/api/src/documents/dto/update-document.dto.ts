import { JsonObject } from '../../common/json.types';
import { IsString, IsOptional, MinLength, MaxLength, IsEnum, IsDateString, IsNumber, IsUrl, IsObject, IsArray, Min, IsBoolean } from 'class-validator';

export enum DocumentType {
  W2 = 'w2',
  FORM_1099 = '1099',
  I9 = 'i9',
  HIPAA = 'hipaa',
  PAYROLL = 'payroll',
  TAX = 'tax',
  INSURANCE = 'insurance',
  MEDICAL = 'medical',
  OTHER = 'other',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING_SIGNATURE = 'pending-signature',
  SIGNED = 'signed',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  DELETED = 'deleted',
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  title?: string;

  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  category?: string;

  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;

  @IsUrl()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  fileName?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fileSize?: number;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  mimeType?: string;

  @IsBoolean()
  @IsOptional()
  passwordProtected?: boolean;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsObject()
  @IsOptional()
  encryptedData?: JsonObject;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  encryptionKeyId?: string;

  @IsArray()
  @IsOptional()
  signerIds?: string[];
}