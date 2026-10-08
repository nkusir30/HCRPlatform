import 'reflect-metadata';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { MemoryController } from './memory.controller';

const user = { id: 'u1', orgId: 'org-a', role: 'employee' };
// No default parameter: passing `undefined` must produce a request with no user.
const req = (...args: [] | [unknown]) => ({ user: args.length === 0 ? user : args[0] }) as never;

describe('MemoryController', () => {
  let svc: Record<'isEnabled' | 'remember' | 'recall' | 'list' | 'getOne' | 'forget', jest.Mock>;
  let controller: MemoryController;

  beforeEach(() => {
    svc = {
      isEnabled: jest.fn().mockReturnValue(true),
      remember: jest.fn().mockResolvedValue({ results: [] }),
      recall: jest.fn().mockResolvedValue({ results: [] }),
      list: jest.fn().mockResolvedValue({ results: [] }),
      getOne: jest.fn().mockResolvedValue({ id: 'm1' }),
      forget: jest.fn().mockResolvedValue({ message: 'Memory deleted' }),
    };
    controller = new MemoryController(svc as never);
  });

  it('status exposes only the enabled flag', () => {
    expect(controller.status()).toEqual({ enabled: true });
  });

  it('remember takes the actor from the JWT user, not the body', async () => {
    const dto = { messages: [{ role: 'user', content: 'x' }], subjectId: 's1', metadata: { a: 1 } } as never;
    await controller.remember(req(), dto);
    expect(svc.remember).toHaveBeenCalledWith(user, (dto as { messages: unknown }).messages, 's1', { a: 1 });
  });

  it('recall forwards query, subject and limit', async () => {
    await controller.recall(req(), { query: 'q', subjectId: 's1', limit: 3 } as never);
    expect(svc.recall).toHaveBeenCalledWith(user, 'q', 's1', 3);
  });

  it('list forwards the optional subject', async () => {
    await controller.list(req(), { subjectId: 's1' } as never);
    expect(svc.list).toHaveBeenCalledWith(user, 's1');
  });

  it('getOne and forget pass a valid id through', async () => {
    await controller.getOne(req(), 'abc-123');
    await controller.forget(req(), 'abc-123');
    expect(svc.getOne).toHaveBeenCalledWith(user, 'abc-123');
    expect(svc.forget).toHaveBeenCalledWith(user, 'abc-123');
  });

  it.each(['../admin', 'a/b', 'a?b=1', 'a b', ''])('rejects the unsafe memory id %p', async (id) => {
    expect(() => controller.getOne(req(), id)).toThrow(BadRequestException);
    expect(() => controller.forget(req(), id)).toThrow(BadRequestException);
    expect(svc.getOne).not.toHaveBeenCalled();
  });

  it.each([undefined, {}, { id: 'u1' }, { orgId: 'o' }])('rejects a request without full user context: %p', (u) => {
    expect(() => controller.remember(req(u), { messages: [] } as never)).toThrow(UnauthorizedException);
  });

  it('is protected by the JWT guard', () => {
    const guards = Reflect.getMetadata('__guards__', MemoryController) as unknown[];
    expect(guards).toHaveLength(1);
  });
});
