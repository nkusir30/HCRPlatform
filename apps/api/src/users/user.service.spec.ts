import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';

jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }));

describe('UserService', () => {
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let service: UserService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'u1' }),
        update: jest.fn().mockResolvedValue({ id: 'u1' }),
        delete: jest.fn().mockResolvedValue({ id: 'u1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    service = new UserService(prisma as never);
  });

  it('findById / findByEmail query the unique key', async () => {
    await service.findById('u1');
    await service.findByEmail('a@b.com');
    expect(prisma.user.findUnique).toHaveBeenNthCalledWith(1, { where: { id: 'u1' } });
    expect(prisma.user.findUnique).toHaveBeenNthCalledWith(2, { where: { email: 'a@b.com' } });
  });

  it('create hashes the password and sets companyId and name', async () => {
    await service.create({
      email: 'a@b.com',
      password: 'secret',
      firstName: 'Ada',
      lastName: 'Lovelace',
      orgId: 'o1',
      companyId: 'c1',
      role: 'admin',
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
    const { data } = prisma.user.create.mock.calls[0][0];
    expect(data).toEqual({
      email: 'a@b.com',
      passwordHash: 'hashed',
      firstName: 'Ada',
      lastName: 'Lovelace',
      orgId: 'o1',
      companyId: 'c1',
      name: 'Ada Lovelace',
      role: 'admin',
    });
    expect(data).not.toHaveProperty('password');
  });

  it('create defaults the role to employee', async () => {
    await service.create({
      email: 'a@b.com',
      password: 'secret',
      firstName: 'A',
      lastName: 'B',
      orgId: 'o1',
      companyId: 'c1',
      role: '',
    });
    expect(prisma.user.create.mock.calls[0][0].data.role).toBe('employee');
  });

  it('update only sends provided, truthy fields', async () => {
    await service.update('u1', { firstName: 'New', phone: '555', status: 'inactive' });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { firstName: 'New', phone: '555', status: 'inactive' },
    });
  });

  it('update copies every provided field', async () => {
    const full = { email: 'n@b.com', firstName: 'N', lastName: 'M', phone: '555', role: 'admin', status: 'active' };
    await service.update('u1', full);
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: full });
  });

  it('update with an empty dto sends an empty data object', async () => {
    await service.update('u1', {});
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: {} });
  });

  it('remove deletes by id', async () => {
    await service.remove('u1');
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  it('findAll orders newest first', async () => {
    await service.findAll();
    expect(prisma.user.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
  });
});
