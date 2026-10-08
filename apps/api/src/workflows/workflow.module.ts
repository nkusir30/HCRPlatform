import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { PromptTemplateService } from './prompt-template.service';
import { PromptTemplateController } from './prompt-template.controller';

@Module({
  controllers: [WorkflowController, PromptTemplateController],
  providers: [WorkflowService, PromptTemplateService],
  exports: [WorkflowService, PromptTemplateService],
})
export class WorkflowModule {}