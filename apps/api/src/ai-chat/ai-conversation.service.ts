import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateAiConversationDto } from './dto/create-ai-conversation.dto';
import { UpdateAiConversationDto } from './dto/update-ai-conversation.dto';

@Injectable()
export class AiConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, status?: string) {
    const where: Record<string, unknown> = { orgId };
    if (status) where.status = status;
    return this.prisma.aiConversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const conversation = await this.prisma.aiConversation.findFirst({
      where: { id, orgId },
    });
    if (!conversation) throw new NotFoundException(`AiConversation #${id} not found`);
    return conversation;
  }

  async findByConversationId(orgId: string, conversationId: string) {
    return this.prisma.aiConversation.findFirst({
      where: { orgId, conversationId },
    });
  }

  async create(orgId: string, dto: CreateAiConversationDto) {
    return this.prisma.aiConversation.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateAiConversationDto) {
    const updates: Partial<UpdateAiConversationDto> = {};
    if (dto.title) updates.title = dto.title;
    if (dto.status) updates.status = dto.status;
    if (dto.usage) updates.usage = dto.usage;
    if (dto.model) updates.model = dto.model;
    if (dto.prompt) updates.prompt = dto.prompt;
    if (dto.response) updates.response = dto.response;
    if (dto.summary) updates.summary = dto.summary;
    if (dto.startedAt) updates.startedAt = dto.startedAt;
    if (dto.endedAt) updates.endedAt = dto.endedAt;
    if (dto.metadata) updates.metadata = dto.metadata;
    return this.prisma.aiConversation.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.aiConversation.delete({ where: { id, orgId } });
  }
}