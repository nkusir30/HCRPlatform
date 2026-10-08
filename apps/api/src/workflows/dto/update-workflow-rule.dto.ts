import { JsonObject } from '../../common/json.types';
import { IsString, IsOptional, MinLength, MaxLength, IsEnum, IsObject, IsBoolean, IsInt, Min } from 'class-validator';

export enum WorkflowType {
  APPROVAL = 'approval',
  NOTIFICATION = 'notification',
  ROUTING = 'routing',
  VALIDATION = 'validation',
  EXCEPTION = 'exception',
  TRIGGER = 'trigger',
  POLICY = 'policy',
  SLA = 'sla',
  HUMAN_IN_THE_LOOP = 'human-in-the-loop',
  AUTOMATION = 'automation',
  HANDOFF = 'handoff',
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISABLED = 'disabled',
  PAUSED = 'paused',
  FAILED = 'failed',
}

export class UpdateWorkflowRuleDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  ruleId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsEnum(WorkflowType)
  @IsOptional()
  type?: WorkflowType;

  @IsEnum(WorkflowStatus)
  @IsOptional()
  status?: WorkflowStatus;

  @IsObject()
  @IsOptional()
  condition?: JsonObject;

  @IsObject()
  @IsOptional()
  action?: JsonObject;

  @IsInt()
  @IsOptional()
  @Min(0)
  priority?: number;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsObject()
  @IsOptional()
  settings?: JsonObject;
}