import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateReportRequestDto } from './dto/create-report-request.dto';
import { UpdateReportRequestDto } from './dto/update-report-request.dto';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, status?: string) {
    const where: Record<string, unknown> = { orgId };
    if (status) where.status = status;
    return this.prisma.reportRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const report = await this.prisma.reportRequest.findFirst({
      where: { id, orgId },
    });
    if (!report) throw new NotFoundException(`ReportRequest #${id} not found`);
    return report;
  }

  async findByReportId(orgId: string, reportId: string) {
    return this.prisma.reportRequest.findFirst({ where: { orgId, reportId } });
  }

  async create(orgId: string, dto: CreateReportRequestDto) {
    return this.prisma.reportRequest.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateReportRequestDto) {
    const updates: Partial<UpdateReportRequestDto> = {};
    if (dto.reportId) updates.reportId = dto.reportId;
    if (dto.type) updates.type = dto.type;
    if (dto.status) updates.status = dto.status;
    if (dto.parameters) updates.parameters = dto.parameters;
    if (dto.resultData) updates.resultData = dto.resultData;
    if (dto.s3Url) updates.s3Url = dto.s3Url;
    if (dto.exportId) updates.exportId = dto.exportId;
    return this.prisma.reportRequest.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.reportRequest.delete({ where: { id, orgId } });
  }
}