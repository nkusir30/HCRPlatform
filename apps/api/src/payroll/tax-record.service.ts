import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateTaxRecordDto } from './dto/create-tax-record.dto';
import { UpdateTaxRecordDto } from './dto/update-tax-record.dto';

@Injectable()
export class TaxRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, payrollPeriodId?: string, employeeId?: string) {
    const where: Record<string, unknown> = { orgId };
    if (payrollPeriodId) where.payrollPeriodId = payrollPeriodId;
    if (employeeId) where.employeeId = employeeId;
    return this.prisma.taxRecord.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const taxRecord = await this.prisma.taxRecord.findFirst({
      where: { id, orgId },
    });
    if (!taxRecord) throw new NotFoundException(`TaxRecord #${id} not found`);
    return taxRecord;
  }

  async create(orgId: string, dto: CreateTaxRecordDto) {
    return this.prisma.taxRecord.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateTaxRecordDto) {
    const updates: Partial<UpdateTaxRecordDto> = {};
    if (dto.date) updates.date = dto.date;
    if (dto.wages) updates.wages = dto.wages;
    if (dto.federalTax) updates.federalTax = dto.federalTax;
    if (dto.ficaSocialSecurityTax) updates.ficaSocialSecurityTax = dto.ficaSocialSecurityTax;
    if (dto.ficaMedicareTax) updates.ficaMedicareTax = dto.ficaMedicareTax;
    if (dto.stateTax) updates.stateTax = dto.stateTax;
    if (dto.localTax) updates.localTax = dto.localTax;
    if (dto.totalTax) updates.totalTax = dto.totalTax;
    if (dto.taxId) updates.taxId = dto.taxId;
    if (dto.taxYear) updates.taxYear = dto.taxYear;
    if (dto.taxType) updates.taxType = dto.taxType;
    if (dto.payerId) updates.payerId = dto.payerId;
    if (dto.payerName) updates.payerName = dto.payerName;
    if (dto.basisPoints) updates.basisPoints = dto.basisPoints;
    return this.prisma.taxRecord.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.taxRecord.delete({ where: { id, orgId } });
  }
}