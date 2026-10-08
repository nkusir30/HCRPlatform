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
    return this.prisma.employee.create({
      data: {
        orgId,
        ...dto,
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