import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { MemoryActor, MemoryService } from './memory.service';

const employee: MemoryActor = { id: 'u-emp', orgId: 'org-a', role: 'employee' };
const admin: MemoryActor = { id: 'u-adm', orgId: 'org-a', role: 'admin' };

describe('MemoryService (ownership checks on get/forget)', () => {
  let mem0: Record<'get' | 'remove', jest.Mock>;
  let service: MemoryService;

  beforeEach(() => {
    mem0 = { get: jest.fn(), remove: jest.fn().mockResolvedValue(undefined) };
    service = new MemoryService(mem0 as never);
  });

  it('returns own memory', async () => {
    mem0.get.mockResolvedValue({ id: 'm1', user_id: 'org-a:u-emp' });
    await expect(service.getOne(employee, 'm1')).resolves.toMatchObject({ id: 'm1' });
  });

  it("hides another org's memory as not found, even from an admin", async () => {
    mem0.get.mockResolvedValue({ id: 'm1', user_id: 'org-b:u-emp' });
    await expect(service.getOne(employee, 'm1')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.getOne(admin, 'm1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it("hides a same-org colleague's memory from a non-admin", async () => {
    mem0.get.mockResolvedValue({ id: 'm1', user_id: 'org-a:u-other' });
    await expect(service.getOne(employee, 'm1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it("lets an admin read a same-org colleague's memory", async () => {
    mem0.get.mockResolvedValue({ id: 'm1', user_id: 'org-a:u-other' });
    await expect(service.getOne(admin, 'm1')).resolves.toMatchObject({ id: 'm1' });
  });

  it('treats a memory with no owner as not found', async () => {
    mem0.get.mockResolvedValue({ id: 'm1' });
    await expect(service.getOne(admin, 'm1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('a prefix look-alike org cannot match (org-a vs org-ab)', async () => {
    mem0.get.mockResolvedValue({ id: 'm1', user_id: 'org-ab:u-emp' });
    await expect(service.getOne(employee, 'm1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('forget deletes only after the ownership check passes', async () => {
    mem0.get.mockResolvedValue({ id: 'm1', user_id: 'org-a:u-emp' });
    await expect(service.forget(employee, 'm1')).resolves.toEqual({ message: 'Memory deleted' });
    expect(mem0.remove).toHaveBeenCalledWith('m1');
  });

  it('forget never deletes a memory the actor cannot see', async () => {
    mem0.get.mockResolvedValue({ id: 'm1', user_id: 'org-b:u-emp' });
    await expect(service.forget(employee, 'm1')).rejects.toBeInstanceOf(NotFoundException);
    expect(mem0.remove).not.toHaveBeenCalled();
  });
});
