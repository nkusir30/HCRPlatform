import { IsString, IsOptional, MinLength, MaxLength, IsEnum, IsBoolean, IsInt, Min } from 'class-validator';

export enum PromptTemplateCategory {
  PAYROLL = 'payroll',
  BENEFITS = 'benefits',
  ATS = 'ats',
  EMPLOYEE_SELF_SERVICE = 'employee-self-service',
  AUTOMATION = 'automation',
  CHATBOT = 'chatbot',
  REPORT = 'report',
  DOCUMENT = 'document',
  REVIEWS = 'reviews',
  ONBOARDING = 'onboarding',
  OTHER = 'other',
}

export class UpdatePromptTemplateDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  templateId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsEnum(PromptTemplateCategory)
  @IsOptional()
  category?: PromptTemplateCategory;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(5000)
  content?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(5000)
  systemPrompt?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}