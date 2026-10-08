import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { UpdatePayrollPeriodDto } from './dto/update-payroll-period.dto';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.payrollPeriod.findMany({
      where: { orgId },
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const period = await this.prisma.payrollPeriod.findFirst({
      where: { id, orgId },
    });
    if (!period) throw new NotFoundException(`PayrollPeriod #${id} not found`);
    return period;
  }

  async findByPeriodId(orgId: string, periodId: string) {
    const period = await this.prisma.payrollPeriod.findFirst({
      where: { id: periodId, orgId },
    });
    if (!period) throw new NotFoundException(`PayrollPeriod #${periodId} not found`);
    return period;
  }

  async create(orgId: string, dto: CreatePayrollPeriodDto) {
    return this.prisma.payrollPeriod.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdatePayrollPeriodDto) {
    const updates: Partial<UpdatePayrollPeriodDto> = {};
    if (dto.periodId) updates.periodId = dto.periodId;
    if (dto.status) updates.status = dto.status;
    if (dto.payrollFrequency) updates.payrollFrequency = dto.payrollFrequency;
    if (dto.currency) updates.currency = dto.currency;
    return this.prisma.payrollPeriod.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.payrollPeriod.delete({ where: { id, orgId } });
  }
}