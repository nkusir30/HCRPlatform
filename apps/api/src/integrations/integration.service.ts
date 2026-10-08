import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Injectable()
export class IntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, status?: string) {
    const where: Record<string, unknown> = { orgId };
    if (status) where.status = status;
    return this.prisma.integration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id, orgId },
    });
    if (!integration) throw new NotFoundException(`Integration #${id} not found`);
    return integration;
  }

  async findByTenant(orgId: string, tenant: string) {
    return this.prisma.integration.findFirst({ where: { orgId, tenant } });
  }

  async create(orgId: string, dto: CreateIntegrationDto) {
    return this.prisma.integration.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateIntegrationDto) {
    const updates: Partial<UpdateIntegrationDto> = {};
    if (dto.tenant) updates.tenant = dto.tenant;
    if (dto.name) updates.name = dto.name;
    if (dto.provider) updates.provider = dto.provider;
    if (dto.type) updates.type = dto.type;
    if (dto.status) updates.status = dto.status;
    if (dto.config) updates.config = dto.config;
    if (dto.secretId) updates.secretId = dto.secretId;
    if (dto.connectedAt) updates.connectedAt = dto.connectedAt;
    if (dto.disconnectedAt) updates.disconnectedAt = dto.disconnectedAt;
    if (dto.lastSyncAt) updates.lastSyncAt = dto.lastSyncAt;
    return this.prisma.integration.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.integration.delete({ where: { id, orgId } });
  }
}