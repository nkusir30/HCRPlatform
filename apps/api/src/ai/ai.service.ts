import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateAiMessageDto } from './dto/create-ai-message.dto';
import { UpdateAiMessageDto } from './dto/update-ai-message.dto';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, conversationId?: string, role?: string) {
    const where: Record<string, unknown> = { orgId };
    if (conversationId) where.conversationId = conversationId;
    if (role) where.role = role;
    return this.prisma.aiMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(orgId: string, id: string) {
    const message = await this.prisma.aiMessage.findFirst({
      where: { id, orgId },
    });
    if (!message) throw new NotFoundException(`AiMessage #${id} not found`);
    return message;
  }

  async findByConversation(orgId: string, conversationId: string) {
    return this.prisma.aiMessage.findMany({
      where: { orgId, conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(orgId: string, dto: CreateAiMessageDto) {
    return this.prisma.aiMessage.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateAiMessageDto) {
    const updates: Partial<UpdateAiMessageDto> = {};
    if (dto.conversationId) updates.conversationId = dto.conversationId;
    if (dto.role) updates.role = dto.role;
    if (dto.content) updates.content = dto.content;
    if (dto.status) updates.status = dto.status;
    if (dto.tokens) updates.tokens = dto.tokens;
    if (dto.prompt) updates.prompt = dto.prompt;
    if (dto.model) updates.model = dto.model;
    if (dto.response) updates.response = dto.response;
    if (dto.errorMessage) updates.errorMessage = dto.errorMessage;
    if (dto.durationMs) updates.durationMs = dto.durationMs;
    return this.prisma.aiMessage.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.aiMessage.delete({ where: { id, orgId } });
  }
}