import 'reflect-metadata';
import { ForbiddenException } from '@nestjs/common';
import { MemoryService, MemoryActor } from './memory.service';

const employee: MemoryActor = { id: 'u-emp', orgId: 'org-a', role: 'employee' };
const admin: MemoryActor = { id: 'u-adm', orgId: 'org-a', role: 'admin' };
const msgs = [{ role: 'user' as const, content: 'Prefers morning shifts' }];

describe('MemoryService (write, read, scope)', () => {
  let mem0: Record<'isConfigured' | 'add' | 'search' | 'list' | 'get' | 'remove', jest.Mock>;
  let service: MemoryService;

  beforeEach(() => {
    mem0 = {
      isConfigured: jest.fn().mockReturnValue(true),
      add: jest.fn().mockResolvedValue({ results: [] }),
      search: jest.fn().mockResolvedValue({ results: [] }),
      list: jest.fn().mockResolvedValue({ results: [] }),
      get: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    service = new MemoryService(mem0 as never);
  });

  it('reports whether mem0 is configured', () => {
    expect(service.isEnabled()).toBe(true);
    mem0.isConfigured.mockReturnValue(false);
    expect(service.isEnabled()).toBe(false);
  });

  describe('scopeFor', () => {
    it('defaults to the actor and prefixes the org', () => {
      expect(service.scopeFor(employee, undefined)).toBe('org-a:u-emp');
    });
    it('lets a non-admin address only themselves', () => {
      expect(service.scopeFor(employee, 'u-emp')).toBe('org-a:u-emp');
      expect(() => service.scopeFor(employee, 'u-other')).toThrow(ForbiddenException);
    });
    it('lets admins and managers address another subject in their own org', () => {
      expect(service.scopeFor(admin, 'u-other')).toBe('org-a:u-other');
      expect(service.scopeFor({ ...admin, role: 'manager' }, 'u-other')).toBe('org-a:u-other');
    });
  });

  describe('remember', () => {
    it('stores under the scoped id and stamps provenance server-side', async () => {
      await service.remember(employee, msgs, undefined, { topic: 'shifts' });
      expect(mem0.add).toHaveBeenCalledWith('org-a:u-emp', msgs, {
        topic: 'shifts',
        orgId: 'org-a',
        recordedBy: 'u-emp',
      });
    });
    it('does not let the caller forge orgId or recordedBy', async () => {
      await service.remember(employee, msgs, undefined, { orgId: 'org-evil', recordedBy: 'someone' });
      expect(mem0.add.mock.calls[0][2]).toMatchObject({ orgId: 'org-a', recordedBy: 'u-emp' });
    });
    it('rejects a non-admin writing for someone else before calling mem0', async () => {
      await expect(service.remember(employee, msgs, 'u-other')).rejects.toBeInstanceOf(ForbiddenException);
      expect(mem0.add).not.toHaveBeenCalled();
    });
  });

  describe('recall / list', () => {
    it('searches only the actor scope with the default limit', async () => {
      await service.recall(employee, 'shift preference', undefined);
      expect(mem0.search).toHaveBeenCalledWith('org-a:u-emp', 'shift preference', 5);
    });
    it('passes an explicit limit through', async () => {
      await service.recall(employee, 'q', undefined, 12);
      expect(mem0.search).toHaveBeenCalledWith('org-a:u-emp', 'q', 12);
    });
    it('drops results the backend returned outside the requested scope', async () => {
      mem0.search.mockResolvedValue({
        results: [
          { id: 'm1', user_id: 'org-a:u-emp' },
          { id: 'm2', user_id: 'org-b:u-emp' },
          { id: 'm3', user_id: 'org-a:u-other' },
          { id: 'm4' },
        ],
      });
      const out = await service.recall(employee, 'q', undefined);
      expect(out.results.map((m) => m.id)).toEqual(['m1']);
    });
    it('list filters to scope and tolerates a missing results array', async () => {
      mem0.list.mockResolvedValue({
        results: [{ id: 'm1', user_id: 'org-a:u-emp' }, { id: 'x', user_id: 'org-b:u-emp' }],
      });
      expect((await service.list(employee, undefined)).results.map((m) => m.id)).toEqual(['m1']);
      mem0.list.mockResolvedValue({});
      expect((await service.list(employee, undefined)).results).toEqual([]);
      mem0.search.mockResolvedValue({});
      expect((await service.recall(employee, 'q', undefined)).results).toEqual([]);
    });
    it('blocks non-admin listing of another subject', async () => {
      await expect(service.list(employee, 'u-other')).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
