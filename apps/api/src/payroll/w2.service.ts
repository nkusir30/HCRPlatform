import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateW2Dto } from './dto/create-w2.dto';
import { UpdateW2Dto } from './dto/update-w2.dto';

@Injectable()
export class W2Service {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, year?: string, employeeId?: string) {
    const where: Record<string, unknown> = { orgId };
    if (year) where.taxYear = Number(year);
    if (employeeId) where.employeeId = employeeId;
    return this.prisma.w2.findMany({
      where,
      orderBy: { taxYear: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const w2 = await this.prisma.w2.findFirst({
      where: { id, orgId },
    });
    if (!w2) throw new NotFoundException(`W2 #${id} not found`);
    return w2;
  }

  async findByEmployeeYear(orgId: string, employeeId: string, year: string) {
    return this.prisma.w2.findFirst({
      where: { orgId, employeeId, taxYear: Number(year) },
    });
  }

  async create(orgId: string, dto: CreateW2Dto) {
    return this.prisma.w2.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateW2Dto) {
    const updates: Partial<UpdateW2Dto> = {};
    if (dto.annualWages) updates.annualWages = dto.annualWages;
    if (dto.federalIncomeTax) updates.federalIncomeTax = dto.federalIncomeTax;
    if (dto.ficaSocialSecurityTax) updates.ficaSocialSecurityTax = dto.ficaSocialSecurityTax;
    if (dto.ficaMedicareTax) updates.ficaMedicareTax = dto.ficaMedicareTax;
    if (dto.stateIncomeTax) updates.stateIncomeTax = dto.stateIncomeTax;
    if (dto.localIncomeTax) updates.localIncomeTax = dto.localIncomeTax;
    if (dto.totalCompensation) updates.totalCompensation = dto.totalCompensation;
    if (dto.deductibleBenefits) updates.deductibleBenefits = dto.deductibleBenefits;
    if (dto.agencyFees) updates.agencyFees = dto.agencyFees;
    if (dto.otherIncome) updates.otherIncome = dto.otherIncome;
    if (dto.taxWithheld) updates.taxWithheld = dto.taxWithheld;
    if (dto.taxYear) updates.taxYear = dto.taxYear;
    if (dto.federalEIN) updates.federalEIN = dto.federalEIN;
    if (dto.stateId) updates.stateId = dto.stateId;
    if (dto.stateTaxAgencyId) updates.stateTaxAgencyId = dto.stateTaxAgencyId;
    return this.prisma.w2.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.w2.delete({ where: { id, orgId } });
  }
}