import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, userId?: string, status?: string) {
    const where: Record<string, unknown> = { orgId };
    if (userId) where.userId = userId;
    if (status) where.status = status;
    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, orgId },
    });
    if (!notification) throw new NotFoundException(`Notification #${id} not found`);
    return notification;
  }

  async findByUserId(orgId: string, userId: string) {
    return this.prisma.notification.findMany({
      where: { orgId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(orgId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateNotificationDto) {
    const updates: Partial<UpdateNotificationDto> = {};
    if (dto.title) updates.title = dto.title;
    if (dto.body) updates.body = dto.body;
    if (dto.type) updates.type = dto.type;
    if (dto.status) updates.status = dto.status;
    if (dto.url) updates.url = dto.url;
    if (dto.metadata) updates.metadata = dto.metadata;
    return this.prisma.notification.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.notification.delete({ where: { id, orgId } });
  }
}