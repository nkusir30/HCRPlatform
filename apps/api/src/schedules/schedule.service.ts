import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, houseId?: string, employeeId?: string) {
    const where: Record<string, unknown> = { orgId };
    if (houseId) where.houseId = houseId;
    if (employeeId) where.employeeId = employeeId;

    return this.prisma.workSchedule.findMany({
      where,
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async findById(orgId: string, id: string) {
    const schedule = await this.prisma.workSchedule.findFirst({
      where: { id, orgId },
    });
    if (!schedule) throw new NotFoundException(`WorkSchedule #${id} not found`);
    return schedule;
  }

  async findByEmployee(orgId: string, employeeId: string, payrollPeriodId?: string) {
    const where: Record<string, unknown> = { orgId, employeeId };
    if (payrollPeriodId) where.payrollPeriodId = payrollPeriodId;
    return this.prisma.workSchedule.findMany({ where });
  }

  async create(orgId: string, dto: CreateWorkScheduleDto) {
    return this.prisma.workSchedule.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateWorkScheduleDto) {
    const updates: Partial<UpdateWorkScheduleDto> = {};
    if (dto.dayOfWeek !== undefined) updates.dayOfWeek = dto.dayOfWeek;
    if (dto.startTime) updates.startTime = dto.startTime;
    if (dto.endTime) updates.endTime = dto.endTime;
    if (dto.comment) updates.comment = dto.comment;
    if (dto.scheduleType) updates.scheduleType = dto.scheduleType;
    if (dto.payrollPeriodId) updates.payrollPeriodId = dto.payrollPeriodId;
    if (dto.employeeId) updates.employeeId = dto.employeeId;
    if (dto.houseId) updates.houseId = dto.houseId;
    if (dto.breakDuration !== undefined) updates.breakDuration = dto.breakDuration;

    return this.prisma.workSchedule.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.workSchedule.delete({ where: { id, orgId } });
  }
}