import { JsonObject } from '../../common/json.types';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, Max, IsObject, IsUrl, MinLength, MaxLength } from 'class-validator';

export enum SignatureType {
  ELECTRONIC = 'electronic',
  DIGITAL = 'digital',
  AUDIO = 'audio',
  VIDEO = 'video',
  INK = 'ink',
  OTHER = 'other',
}

export enum SignatureStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  VOIDED = 'voided',
}

export class CreateSignatureDto {
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @IsString()
  @IsNotEmpty()
  signerId: string;

  @IsEnum(SignatureType)
  @IsOptional()
  signatureType?: SignatureType;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(256)
  checksum?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(50)
  pageNumber?: number;

  @IsObject()
  @IsOptional()
  signatureData?: JsonObject;

  @IsUrl()
  @IsOptional()
  signedUrl?: string;

  @IsUrl()
  @IsOptional()
  signatureUrl?: string;
}

export class UpdateSignatureDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(256)
  checksum?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(50)
  pageNumber?: number;

  @IsObject()
  @IsOptional()
  signatureData?: JsonObject;

  @IsUrl()
  @IsOptional()
  signedUrl?: string;

  @IsUrl()
  @IsOptional()
  signatureUrl?: string;
}