import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateWorkflowRuleDto } from './dto/create-workflow-rule.dto';
import { UpdateWorkflowRuleDto } from './dto/update-workflow-rule.dto';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, status?: string) {
    const where: Record<string, unknown> = { orgId };
    if (status) where.status = status;
    return this.prisma.workflowRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const rule = await this.prisma.workflowRule.findFirst({
      where: { id, orgId },
    });
    if (!rule) throw new NotFoundException(`WorkflowRule #${id} not found`);
    return rule;
  }

  async findByRuleId(orgId: string, ruleId: string) {
    return this.prisma.workflowRule.findFirst({ where: { orgId, ruleId } });
  }

  async create(orgId: string, dto: CreateWorkflowRuleDto) {
    return this.prisma.workflowRule.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateWorkflowRuleDto) {
    const updates: Partial<UpdateWorkflowRuleDto> = {};
    if (dto.ruleId) updates.ruleId = dto.ruleId;
    if (dto.name) updates.name = dto.name;
    if (dto.type) updates.type = dto.type;
    if (dto.status) updates.status = dto.status;
    if (dto.condition) updates.condition = dto.condition;
    if (dto.action) updates.action = dto.action;
    if (dto.priority) updates.priority = dto.priority;
    if (dto.enabled !== undefined) updates.enabled = dto.enabled;
    if (dto.settings) updates.settings = dto.settings;
    return this.prisma.workflowRule.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.workflowRule.delete({ where: { id, orgId } });
  }
}