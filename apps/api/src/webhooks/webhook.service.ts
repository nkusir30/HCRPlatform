import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, status?: string) {
    const where: Record<string, unknown> = { orgId };
    if (status) where.status = status;
    return this.prisma.webhook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, orgId },
    });
    if (!webhook) throw new NotFoundException(`Webhook #${id} not found`);
    return webhook;
  }

  async findByUrl(orgId: string, url: string) {
    return this.prisma.webhook.findFirst({ where: { orgId, url } });
  }

  async create(orgId: string, dto: CreateWebhookDto) {
    return this.prisma.webhook.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateWebhookDto) {
    const updates: Partial<UpdateWebhookDto> = {};
    if (dto.url) updates.url = dto.url;
    if (dto.secret) updates.secret = dto.secret;
    if (dto.secretId) updates.secretId = dto.secretId;
    if (dto.eventTypes) updates.eventTypes = dto.eventTypes;
    if (dto.status) updates.status = dto.status;
    if (dto.settings) updates.settings = dto.settings;
    if (dto.enabled !== undefined) updates.enabled = dto.enabled;
    return this.prisma.webhook.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.webhook.delete({ where: { id, orgId } });
  }
}