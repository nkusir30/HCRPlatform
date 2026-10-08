import 'reflect-metadata';
import { createHash } from 'crypto';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApprovalService } from './timesheets.service';

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

describe('ApprovalService', () => {
  let timesheet: Record<'findFirst' | 'update', jest.Mock>;
  let entry: { findMany: jest.Mock };
  let service: ApprovalService;

  beforeEach(() => {
    timesheet = { findFirst: jest.fn(), update: jest.fn().mockResolvedValue({ id: 't1' }) };
    entry = { findMany: jest.fn().mockResolvedValue([]) };
    service = new ApprovalService({ timesheet, timesheetEntry: entry } as never);
  });

  describe('accept', () => {
    const dto = (totalsHash: string, attested = true) => ({ attested, totalsHash });

    it('requires attestation', async () => {
      await expect(service.accept('o1', 't1', 'u1', dto('x', false))).rejects.toBeInstanceOf(ForbiddenException);
      expect(timesheet.findFirst).not.toHaveBeenCalled();
    });

    it('404s when the timesheet does not exist', async () => {
      timesheet.findFirst.mockResolvedValue(null);
      await expect(service.accept('o1', 't1', 'u1', dto('x'))).rejects.toBeInstanceOf(NotFoundException);
    });

    it('only accepts timesheets in DRAFT', async () => {
      timesheet.findFirst.mockResolvedValue({ id: 't1', status: 'ACCEPTED' });
      await expect(service.accept('o1', 't1', 'u1', dto('x'))).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects a totals hash that does not match the entries', async () => {
      timesheet.findFirst.mockResolvedValue({ id: 't1', status: 'DRAFT' });
      entry.findMany.mockResolvedValue([{ durationHours: 4 }]);
      await expect(service.accept('o1', 't1', 'u1', dto('wrong'))).rejects.toBeInstanceOf(ForbiddenException);
      expect(timesheet.update).not.toHaveBeenCalled();
    });

    it('accepts when the hash matches the computed totals', async () => {
      timesheet.findFirst.mockResolvedValue({ id: 't1', status: 'DRAFT' });
      entry.findMany.mockResolvedValue([{ durationHours: 4 }, { durationHours: null }, { durationHours: 2.5 }]);
      const hash = sha256(JSON.stringify({ hours: 6.5, regular: 6.5, overtime: 6.5 }));
      await service.accept('o1', 't1', 'u1', dto(hash));
      const arg = timesheet.update.mock.calls[0][0];
      expect(arg.where).toEqual({ id: 't1', orgId: 'o1' });
      expect(arg.data).toMatchObject({ status: 'ACCEPTED', acceptedBy: 'u1' });
      expect(arg.data.acceptedAt).toBeInstanceOf(Date);
    });
  });

  describe('approve', () => {
    it('404s when missing', async () => {
      timesheet.findFirst.mockResolvedValue(null);
      await expect(service.approve('o1', 't1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('requires ACCEPTED state', async () => {
      timesheet.findFirst.mockResolvedValue({ id: 't1', status: 'DRAFT' });
      await expect(service.approve('o1', 't1')).rejects.toBeInstanceOf(ConflictException);
    });

    it('moves ACCEPTED to APPROVED', async () => {
      timesheet.findFirst.mockResolvedValue({ id: 't1', status: 'ACCEPTED' });
      await expect(service.approve('o1', 't1')).resolves.toEqual({ publicId: 't1', status: 'APPROVED' });
      expect(timesheet.update.mock.calls[0][0].data.status).toBe('APPROVED');
    });
  });

  describe('disapprove', () => {
    it('requires a non-blank reason', async () => {
      await expect(service.disapprove('o1', 't1', '   ')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('404s when missing', async () => {
      timesheet.findFirst.mockResolvedValue(null);
      await expect(service.disapprove('o1', 't1', 'bad')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('requires ACCEPTED state', async () => {
      timesheet.findFirst.mockResolvedValue({ id: 't1', status: 'APPROVED' });
      await expect(service.disapprove('o1', 't1', 'bad')).rejects.toBeInstanceOf(ConflictException);
    });

    it('records the reason on disapproval', async () => {
      timesheet.findFirst.mockResolvedValue({ id: 't1', status: 'ACCEPTED' });
      await expect(service.disapprove('o1', 't1', 'missing shift')).resolves.toEqual({
        publicId: 't1',
        status: 'DISAPPROVED',
      });
      expect(timesheet.update.mock.calls[0][0].data).toMatchObject({
        status: 'DISAPPROVED',
        disapprovalReason: 'missing shift',
      });
    });
  });
});
