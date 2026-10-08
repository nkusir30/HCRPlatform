import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateBenefitEnrollmentDto } from './dto/create-benefit-enrollment.dto';
import { UpdateBenefitEnrollmentDto } from './dto/update-benefit-enrollment.dto';

@Injectable()
export class BenefitEnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, employeeId?: string, benefitId?: string) {
    const where: Record<string, unknown> = { orgId };
    if (employeeId) where.employeeId = employeeId;
    if (benefitId) where.benefitId = benefitId;
    return this.prisma.benefitEnrollment.findMany({
      where,
      orderBy: { effectiveDate: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const enrollment = await this.prisma.benefitEnrollment.findFirst({
      where: { id, orgId },
    });
    if (!enrollment) throw new NotFoundException(`BenefitEnrollment #${id} not found`);
    return enrollment;
  }

  async findByEmployee(orgId: string, employeeId: string) {
    return this.prisma.benefitEnrollment.findMany({
      where: { orgId, employeeId },
    });
  }

  async create(orgId: string, dto: CreateBenefitEnrollmentDto) {
    return this.prisma.benefitEnrollment.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateBenefitEnrollmentDto) {
    const updates: Partial<UpdateBenefitEnrollmentDto> = {};
    if (dto.benefitId) updates.benefitId = dto.benefitId;
    if (dto.employeeId) updates.employeeId = dto.employeeId;
    if (dto.enrollmentId) updates.enrollmentId = dto.enrollmentId;
    if (dto.coverage) updates.coverage = dto.coverage;
    if (dto.effectiveDate) updates.effectiveDate = dto.effectiveDate;
    if (dto.endDate) updates.endDate = dto.endDate;
    if (dto.status) updates.status = dto.status;
    if (dto.optedOut !== undefined) updates.optedOut = dto.optedOut;
    if (dto.monthlyPremium) updates.monthlyPremium = dto.monthlyPremium;
    if (dto.companyShare) updates.companyShare = dto.companyShare;
    if (dto.employeeContribution) updates.employeeContribution = dto.employeeContribution;
    return this.prisma.benefitEnrollment.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.benefitEnrollment.delete({ where: { id, orgId } });
  }
}