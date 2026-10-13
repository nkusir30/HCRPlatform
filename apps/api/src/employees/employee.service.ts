import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.employee.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, orgId },
    });
    if (!employee) throw new NotFoundException(`Employee #${id} not found`);
    return employee;
  }

  async findByEmployeeCode(orgId: string, employeeCode: string) {
    return this.prisma.employee.findFirst({
      where: { orgId, employeeCode },
    });
  }

  async create(orgId: string, dto: CreateEmployeeDto) {
    // The web client creates employees before a login account exists, and the
    // demo roster carries empty hire dates. Prisma requires both columns, so
    // provision them here: reuse/link the user when possible, otherwise create
    // a placeholder user; default a missing hireDate to today.
    const { userId, hireDate, ...rest } = dto;
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existingUser) {
        resolvedUserId = existingUser.id;
      } else {
        const created = await this.prisma.user.create({
          data: {
            orgId,
            companyId: dto.companyId,
            email: dto.email,
            name: `${dto.firstName} ${dto.lastName}`,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            role: 'employee',
            status: 'active',
            isActive: dto.isActive ?? true,
          },
        });
        resolvedUserId = created.id;
      }
    }
    const resolvedHireDate = hireDate && hireDate.trim() !== '' ? hireDate : new Date().toISOString();
    return this.prisma.employee.create({
      data: {
        orgId,
        ...rest,
        userId: resolvedUserId,
        hireDate: resolvedHireDate,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateEmployeeDto) {
    const updates: Partial<UpdateEmployeeDto> = {};
    if (dto.firstName) updates.firstName = dto.firstName;
    if (dto.lastName) updates.lastName = dto.lastName;
    if (dto.email) updates.email = dto.email;
    if (dto.phone) updates.phone = dto.phone;
    if (dto.employmentStatus) updates.employmentStatus = dto.employmentStatus;
    if (dto.hireDate) updates.hireDate = dto.hireDate;
    if (dto.isActive !== undefined) updates.isActive = dto.isActive;
    if (dto.employeeCode) updates.employeeCode = dto.employeeCode;
    if (dto.ssnLast4) updates.ssnLast4 = dto.ssnLast4;

    return this.prisma.employee.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.employee.delete({
      where: { id, orgId },
    });
  }
}