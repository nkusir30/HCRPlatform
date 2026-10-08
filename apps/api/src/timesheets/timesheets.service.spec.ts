import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { TimesheetService } from './timesheets.service';

describe('TimesheetService', () => {
  let ts: Record<'findMany' | 'findFirst' | 'create' | 'update', jest.Mock>;
  let service: TimesheetService;

  beforeEach(() => {
    ts = {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 't1' }),
      update: jest.fn().mockResolvedValue({ id: 't1' }),
    };
    service = new TimesheetService({ timesheet: ts } as never);
  });

  it('findAll applies optional employee and period filters', async () => {
    await service.findAll('o1', 'e1', 'p1');
    expect(ts.findMany).toHaveBeenCalledWith({
      where: { orgId: 'o1', employeeId: 'e1', payrollPeriodId: 'p1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('findAll without filters only scopes by org', async () => {
    await service.findAll('o1');
    expect(ts.findMany.mock.calls[0][0].where).toEqual({ orgId: 'o1' });
  });

  it('findById throws NotFoundException when missing', async () => {
    ts.findFirst.mockResolvedValue(null);
    await expect(service.findById('o1', 'x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findById returns the record when found', async () => {
    ts.findFirst.mockResolvedValue({ id: 't1' });
    await expect(service.findById('o1', 't1')).resolves.toEqual({ id: 't1' });
    expect(ts.findFirst).toHaveBeenCalledWith({ where: { id: 't1', orgId: 'o1' } });
  });

  it('findByEmployeeAndPeriod queries by org, employee and period', async () => {
    await service.findByEmployeeAndPeriod('o1', 'e1', 'p1');
    expect(ts.findFirst).toHaveBeenCalledWith({
      where: { orgId: 'o1', employeeId: 'e1', payrollPeriodId: 'p1' },
    });
  });

  it('create stamps the orgId', async () => {
    const dto = { companyId: 'c1', employeeId: 'e1', payrollPeriodId: 'p1', hours: 8 } as never;
    await service.create('o1', dto);
    expect(ts.create).toHaveBeenCalledWith({ data: { orgId: 'o1', ...(dto as object) } });
  });

  it('update copies defined fields, including false booleans, and skips falsy others', async () => {
    await service.update('o1', 't1', { notes: 'hi', isLocked: false, hours: 0 } as never);
    expect(ts.update).toHaveBeenCalledWith({
      where: { id: 't1', orgId: 'o1' },
      data: { notes: 'hi', isLocked: false },
    });
  });

  it('update copies every provided field', async () => {
    const full = {
      employeeId: 'e1',
      payrollPeriodId: 'p1',
      hours: 8,
      date: '2026-01-01',
      workType: 'direct-care',
      laborCategory: 'CNAs',
      notes: 'n',
      isLocked: true,
      isDeleted: true,
      attestationHash: 'h',
    };
    await service.update('o1', 't1', full as never);
    expect(ts.update).toHaveBeenCalledWith({ where: { id: 't1', orgId: 'o1' }, data: full });
  });

  it('destroy soft-deletes', async () => {
    await service.destroy('o1', 't1');
    expect(ts.update).toHaveBeenCalledWith({
      where: { id: 't1', orgId: 'o1' },
      data: { isDeleted: true },
    });
  });
});
