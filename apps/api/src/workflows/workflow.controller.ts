import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowRuleDto } from './dto/create-workflow-rule.dto';
import { UpdateWorkflowRuleDto } from './dto/update-workflow-rule.dto';

@Controller('orgs/:orgId/workflow-rules')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('status') status?: string) {
    return this.workflowService.findAll(orgId, status);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.workflowService.findById(orgId, id);
  }

  @Get('rule/:ruleId')
  findByRuleId(@Param('orgId') orgId: string, @Param('ruleId') ruleId: string) {
    return this.workflowService.findByRuleId(orgId, ruleId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateWorkflowRuleDto) {
    return this.workflowService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWorkflowRuleDto) {
    return this.workflowService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.workflowService.remove(orgId, id);
  }
}