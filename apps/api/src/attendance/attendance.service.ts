import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.attendance.findMany({
      where: { orgId },
      orderBy: { date: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const attendance = await this.prisma.attendance.findFirst({ where: { id, orgId } });
    if (!attendance) throw new NotFoundException(`Attendance #${id} not found`);
    return attendance;
  }

  // Clock-in: refuse a second open punch for the same employee on the same day,
  // mirroring the client's guard. Generates a unique attendanceId.
  async clockIn(orgId: string, dto: CreateAttendanceDto) {
    const day = new Date(dto.date);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const open = await this.prisma.attendance.findFirst({
      where: {
        orgId,
        employeeId: dto.employeeId,
        date: { gte: day, lt: nextDay },
        status: 'clocked-in',
      },
    });
    if (open) throw new ConflictException('You are already clocked in for today.');

    return this.prisma.attendance.create({
      data: {
        orgId,
        employeeId: dto.employeeId,
        date: day,
        clockInAt: new Date(dto.clockInAt),
        status: 'clocked-in',
        source: dto.source ?? 'web',
        scheduleId: dto.scheduleId,
        houseId: dto.houseId,
        attendanceId: `ATT-${Date.now().toString(36)}`,
      },
    });
  }

  // Clock-out: only an open punch can be closed, and it must belong to this org.
  async clockOut(orgId: string, id: string, dto: UpdateAttendanceDto) {
    const attendance = await this.prisma.attendance.findFirst({ where: { id, orgId } });
    if (!attendance) throw new NotFoundException(`Attendance #${id} not found`);
    if (attendance.status === 'clocked-out') {
      throw new ConflictException('Already clocked out.');
    }
    return this.prisma.attendance.update({
      where: { id },
      data: {
        clockOutAt: dto.clockOutAt ? new Date(dto.clockOutAt) : new Date(),
        status: 'clocked-out',
      },
    });
  }

  async remove(orgId: string, id: string) {
    const attendance = await this.prisma.attendance.findFirst({ where: { id, orgId } });
    if (!attendance) throw new NotFoundException(`Attendance #${id} not found`);
    return this.prisma.attendance.delete({ where: { id } });
  }
}
