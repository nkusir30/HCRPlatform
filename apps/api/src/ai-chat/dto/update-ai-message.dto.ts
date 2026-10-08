import { IsString, IsOptional, MinLength, MaxLength, IsEnum, IsInt, Min } from 'class-validator';

export enum AiMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool',
}

export enum AiMessageStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

export class UpdateAiMessageDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  content?: string;

  @IsEnum(AiMessageStatus)
  @IsOptional()
  status?: AiMessageStatus;

  @IsInt()
  @IsOptional()
  @Min(0)
  tokens?: number;

  @IsString()
  @IsOptional()
  prompt?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  model?: string;

  @IsString()
  @IsOptional()
  response?: string;

  @IsString()
  @IsOptional()
  errorMessage?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  durationMs?: number;
}