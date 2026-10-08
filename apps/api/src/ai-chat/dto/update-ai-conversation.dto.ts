import { JsonObject } from '../../common/json.types';
import { IsString, IsOptional, MinLength, MaxLength, IsEnum, IsDateString, IsObject } from 'class-validator';

export enum ConversationStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export class UpdateAiConversationDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsEnum(ConversationStatus)
  @IsOptional()
  status?: ConversationStatus;

  @IsObject()
  @IsOptional()
  usage?: JsonObject;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  model?: string;

  @IsString()
  @IsOptional()
  prompt?: string;

  @IsString()
  @IsOptional()
  response?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsDateString()
  @IsOptional()
  startedAt?: string;

  @IsDateString()
  @IsOptional()
  endedAt?: string;

  @IsObject()
  @IsOptional()
  metadata?: JsonObject;
}