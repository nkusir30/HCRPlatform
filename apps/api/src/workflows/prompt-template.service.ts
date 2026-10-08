import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreatePromptTemplateDto } from './dto/create-prompt-template.dto';
import { UpdatePromptTemplateDto } from './dto/update-prompt-template.dto';

@Injectable()
export class PromptTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, category?: string) {
    const where: Record<string, unknown> = { orgId };
    if (category) where.category = category;
    return this.prisma.promptTemplate.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(orgId: string, id: string) {
    const template = await this.prisma.promptTemplate.findFirst({
      where: { id, orgId },
    });
    if (!template) throw new NotFoundException(`PromptTemplate #${id} not found`);
    return template;
  }

  async findByCategory(orgId: string, category: string) {
    return this.prisma.promptTemplate.findMany({
      where: { orgId, category },
    });
  }

  async create(orgId: string, dto: CreatePromptTemplateDto) {
    return this.prisma.promptTemplate.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdatePromptTemplateDto) {
    const updates: Partial<UpdatePromptTemplateDto> = {};
    if (dto.templateId) updates.templateId = dto.templateId;
    if (dto.name) updates.name = dto.name;
    if (dto.category) updates.category = dto.category;
    if (dto.content) updates.content = dto.content;
    if (dto.systemPrompt) updates.systemPrompt = dto.systemPrompt;
    if (dto.active !== undefined) updates.active = dto.active;
    if (dto.sortOrder !== undefined) updates.sortOrder = dto.sortOrder;
    return this.prisma.promptTemplate.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.promptTemplate.delete({ where: { id, orgId } });
  }
}