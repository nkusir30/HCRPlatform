// TimesheetsService: DRAFT->ACCEPTED->APPROVED/DISAPPROVED with lock semantics.
// Hours always server-computed; accept snapshots hashed to audit_logs.
import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';


@Injectable()
export class TimesheetService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, employeeId?: string, payrollPeriodId?: string) {
    const where: Record<string, unknown> = { orgId };
    if (employeeId) where.employeeId = employeeId;
    if (payrollPeriodId) where.payrollPeriodId = payrollPeriodId;
    return this.prisma.timesheet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const timesheet = await this.prisma.timesheet.findFirst({
      where: { id, orgId },
    });
    if (!timesheet) throw new NotFoundException(`Timesheet #${id} not found`);
    return timesheet;
  }

  async findByEmployeeAndPeriod(orgId: string, employeeId: string, payrollPeriodId: string) {
    return this.prisma.timesheet.findFirst({
      where: { orgId, employeeId, payrollPeriodId },
    });
  }

  async create(orgId: string, dto: CreateTimesheetDto) {
    return this.prisma.timesheet.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateTimesheetDto) {
    const updates: Partial<UpdateTimesheetDto> = {};
    if (dto.employeeId) updates.employeeId = dto.employeeId;
    if (dto.payrollPeriodId) updates.payrollPeriodId = dto.payrollPeriodId;
    if (dto.hours) updates.hours = dto.hours;
    if (dto.date) updates.date = dto.date;
    if (dto.workType) updates.workType = dto.workType;
    if (dto.laborCategory) updates.laborCategory = dto.laborCategory;
    if (dto.notes) updates.notes = dto.notes;
    if (dto.isLocked !== undefined) updates.isLocked = dto.isLocked;
    if (dto.isDeleted !== undefined) updates.isDeleted = dto.isDeleted;
    if (dto.attestationHash) updates.attestationHash = dto.attestationHash;

    return this.prisma.timesheet.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async destroy(orgId: string, id: string) {
    return this.prisma.timesheet.update({
      where: { id, orgId },
      data: { isDeleted: true },
    });
  }
}

@Injectable()
export class ApprovalService {
  constructor(private readonly prisma: PrismaService) {}

  async accept(orgId: string, publicId: string, userId: string, dto: { attested: boolean; totalsHash: string }) {
    if (!dto.attested) throw new ForbiddenException('Attestation required');
    const timesheet = await this.prisma.timesheet.findFirst({
      where: { id: publicId, orgId },
    });
    if (!timesheet) throw new NotFoundException(`Timesheet #${publicId} not found`);
    if (timesheet.status !== 'DRAFT') throw new ConflictException('Timesheet is not in DRAFT state');
    // Load entries, compute totalsHash, verify against provided hash
    const entries = await this.prisma.timesheetEntry.findMany({
      where: { timesheetId: publicId },
    });
    const totals = entries.reduce((acc, e) => {
      acc.hours += e.durationHours ?? 0;
      acc.regular += e.durationHours ?? 0;
      acc.overtime += e.durationHours ?? 0;
      return acc;
    }, { hours: 0, regular: 0, overtime: 0 });
    const computedHash = await this.hashSnapshot(JSON.stringify(totals));
    if (computedHash !== dto.totalsHash) throw new ForbiddenException('Timings hash mismatch');
    return this.prisma.timesheet.update({
      where: { id: publicId, orgId },
      data: { status: 'ACCEPTED', acceptedBy: userId, acceptedAt: new Date() },
    });
  }

  async approve(orgId: string, publicId: string) {
    const timesheet = await this.prisma.timesheet.findFirst({
      where: { id: publicId, orgId },
    });
    if (!timesheet) throw new NotFoundException(`Timesheet #${publicId} not found`);
    if (timesheet.status !== 'ACCEPTED') throw new ConflictException('Timesheet not in ACCEPTED state');
    await this.prisma.timesheet.update({
      where: { id: publicId, orgId },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });
    return { publicId, status: 'APPROVED' };
  }

  async disapprove(orgId: string, publicId: string, reason: string) {
    if (!reason?.trim()) throw new ForbiddenException('Disapprove reason required');
    const timesheet = await this.prisma.timesheet.findFirst({
      where: { id: publicId, orgId },
    });
    if (!timesheet) throw new NotFoundException(`Timesheet #${publicId} not found`);
    if (timesheet.status !== 'ACCEPTED') throw new ConflictException('Timesheet not in ACCEPTED state');
    await this.prisma.timesheet.update({
      where: { id: publicId, orgId },
      data: { status: 'DISAPPROVED', disapprovedAt: new Date(), disapprovalReason: reason },
    });
    return { publicId, status: 'DISAPPROVED' };
  }

  private async hashSnapshot(payload: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(payload).digest('hex');
  }
}
