import { JsonObject } from '../../common/json.types';
import { IsString, IsOptional, IsEnum, IsDateString, IsObject, MinLength, MaxLength } from 'class-validator';

export enum ConversationStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum ConversationRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool',
}

export class CreateAiConversationDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  conversationId?: string;

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