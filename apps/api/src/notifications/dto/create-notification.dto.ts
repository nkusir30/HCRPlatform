import { JsonObject } from '../../common/json.types';
import { IsString, IsOptional, IsEnum, IsDateString, IsObject, IsArray, MinLength, MaxLength } from 'class-validator';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in-app',
  WEBHOOK = 'webhook',
  SLA = 'sla',
  POLICY = 'policy',
  REMINDER = 'reminder',
  ALERT = 'alert',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  SENT = 'sent',
  FAILED = 'failed',
  PENDING = 'pending',
}

export class CreateNotificationDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  notificationId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(1000)
  body?: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  url?: string;

  @IsObject()
  @IsOptional()
  metadata?: JsonObject;

  @IsArray()
  @IsOptional()
  recipientIds?: string[];

  @IsDateString()
  @IsOptional()
  scheduledFor?: string;
}

export class UpdateNotificationDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(1000)
  body?: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  url?: string;

  @IsObject()
  @IsOptional()
  metadata?: JsonObject;
}