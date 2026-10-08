import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';

@Injectable()
export class BenefitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.benefit.findMany({
      where: { orgId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(orgId: string, id: string) {
    const benefit = await this.prisma.benefit.findFirst({
      where: { id, orgId },
    });
    if (!benefit) throw new NotFoundException(`Benefit #${id} not found`);
    return benefit;
  }

  async findByCode(orgId: string, category: string, benefitId: string) {
    return this.prisma.benefit.findFirst({ where: { orgId, category, benefitId } });
  }

  async create(orgId: string, dto: CreateBenefitDto) {
    return this.prisma.benefit.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateBenefitDto) {
    const updates: Partial<UpdateBenefitDto> = {};
    if (dto.benefitId) updates.benefitId = dto.benefitId;
    if (dto.name) updates.name = dto.name;
    if (dto.category) updates.category = dto.category;
    if (dto.type) updates.type = dto.type;
    if (dto.coverage) updates.coverage = dto.coverage;
    if (dto.description) updates.description = dto.description;
    if (dto.monthlyCost) updates.monthlyCost = dto.monthlyCost;
    if (dto.companyShare) updates.companyShare = dto.companyShare;
    if (dto.active !== undefined) updates.active = dto.active;
    if (dto.sortOrder !== undefined) updates.sortOrder = dto.sortOrder;
    return this.prisma.benefit.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.benefit.delete({ where: { id, orgId } });
  }
}