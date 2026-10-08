import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateTen9289Dto } from './dto/create-ten-9289.dto';
import { UpdateTen9289Dto } from './dto/update-ten-9289.dto';

@Injectable()
export class Ten9289Service {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, year?: string, employeeId?: string) {
    const where: Record<string, unknown> = { orgId };
    if (year) where.taxYear = Number(year);
    if (employeeId) where.employeeId = employeeId;
    return this.prisma.ten9289.findMany({
      where,
      orderBy: { taxYear: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const form = await this.prisma.ten9289.findFirst({
      where: { id, orgId },
    });
    if (!form) throw new NotFoundException(`1099 #${id} not found`);
    return form;
  }

  async findByEmployeeYear(orgId: string, employeeId: string, year: string) {
    return this.prisma.ten9289.findFirst({
      where: { orgId, employeeId, taxYear: Number(year) },
    });
  }

  async create(orgId: string, dto: CreateTen9289Dto) {
    return this.prisma.ten9289.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateTen9289Dto) {
    const updates: Partial<UpdateTen9289Dto> = {};
    if (dto.annualNonEmployeeCompensation) updates.annualNonEmployeeCompensation = dto.annualNonEmployeeCompensation;
    if (dto.fees) updates.fees = dto.fees;
    if (dto.totalPayments) updates.totalPayments = dto.totalPayments;
    if (dto.emergencyMedicareWithheld) updates.emergencyMedicareWithheld = dto.emergencyMedicareWithheld;
    if (dto.taxYear) updates.taxYear = dto.taxYear;
    if (dto.federalEIN) updates.federalEIN = dto.federalEIN;
    if (dto.recipientSSNLast4) updates.recipientSSNLast4 = dto.recipientSSNLast4;
    if (dto.recipientName) updates.recipientName = dto.recipientName;
    if (dto.recipientAddress1) updates.recipientAddress1 = dto.recipientAddress1;
    if (dto.recipientCity) updates.recipientCity = dto.recipientCity;
    if (dto.recipientState) updates.recipientState = dto.recipientState;
    if (dto.recipientPostalCode) updates.recipientPostalCode = dto.recipientPostalCode;
    if (dto.recipientCountry) updates.recipientCountry = dto.recipientCountry;
    if (dto.stateId) updates.stateId = dto.stateId;
    if (dto.stateTaxAgencyId) updates.stateTaxAgencyId = dto.stateTaxAgencyId;
    return this.prisma.ten9289.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.ten9289.delete({ where: { id, orgId } });
  }
}