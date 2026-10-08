import { JsonObject } from '../../common/json.types';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsObject, MinLength, MaxLength } from 'class-validator';

export enum IntegrationProvider {
  GOODTIME = 'goodtime',
  BARLEY = 'barley',
  PAYCHEQX = 'paychex',
  SAGE = 'sage',
  ADP = 'adp',
  GTPOS = 'gtpos',
  STIPPY = 'stippy',
  INCENTRV = 'incentrv',
  GUSTO = 'gusto',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  SES = 'ses',
  SENDGRID = 'sendgrid',
  TWILIO = 'twilio',
  AWS = 'aws',
  MICROSOFT = 'microsoft',
  SALESFORCE = 'salesforce',
  ZOOM = 'zoom',
  OTHER = 'other',
}

export enum IntegrationType {
  HRIS = 'hris',
  PAYROLL = 'payroll',
  TIME_KEEPING = 'time-keeping',
  PAYMENT = 'payment',
  EMAIL = 'email',
  SMS = 'sms',
  CLOUD_STORAGE = 'cloud-storage',
  CRM = 'crm',
  ANALYTICS = 'analytics',
  COMMUNICATION = 'communication',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ERROR = 'error',
  DISCONNECTED = 'disconnected',
  FAILED = 'failed',
}

export class CreateIntegrationDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  integrationId?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  tenant: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsEnum(IntegrationProvider)
  @IsNotEmpty()
  provider: IntegrationProvider;

  @IsEnum(IntegrationType)
  @IsNotEmpty()
  type: IntegrationType;

  @IsEnum(IntegrationStatus)
  @IsOptional()
  status?: IntegrationStatus;

  @IsObject()
  @IsOptional()
  config?: JsonObject;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  secretId?: string;

  @IsDateString()
  @IsOptional()
  connectedAt?: string;

  @IsDateString()
  @IsOptional()
  disconnectedAt?: string;

  @IsDateString()
  @IsOptional()
  lastSyncAt?: string;
}

export class UpdateIntegrationDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  integrationId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  tenant?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsEnum(IntegrationProvider)
  @IsOptional()
  provider?: IntegrationProvider;

  @IsEnum(IntegrationType)
  @IsOptional()
  type?: IntegrationType;

  @IsEnum(IntegrationStatus)
  @IsOptional()
  status?: IntegrationStatus;

  @IsObject()
  @IsOptional()
  config?: JsonObject;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  secretId?: string;

  @IsDateString()
  @IsOptional()
  connectedAt?: string;

  @IsDateString()
  @IsOptional()
  disconnectedAt?: string;

  @IsDateString()
  @IsOptional()
  lastSyncAt?: string;
}