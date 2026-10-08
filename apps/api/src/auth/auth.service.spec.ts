import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }));

describe('AuthService', () => {
  const user = {
    id: 'u1',
    email: 'a@b.com',
    passwordHash: 'hash',
    role: 'admin',
    orgId: 'o1',
  };
  let prisma: { user: { findUnique: jest.Mock } };
  let jwt: { sign: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn() } };
    jwt = { sign: jest.fn().mockReturnValue('token') };
    service = new AuthService(prisma as never, jwt as never);
    (bcrypt.compare as jest.Mock).mockReset();
  });

  it('validateUser returns the user without passwordHash on a good password', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await service.validateUser(user.email, 'pw');
    expect(result).toEqual({ id: 'u1', email: 'a@b.com', role: 'admin', orgId: 'o1' });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('validateUser returns null on a bad password', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.validateUser(user.email, 'bad')).resolves.toBeNull();
  });

  it('validateUser returns null when the user is unknown', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.validateUser('x@y.com', 'pw')).resolves.toBeNull();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('validateUser returns null when the user has no passwordHash', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, passwordHash: null });
    await expect(service.validateUser(user.email, 'pw')).resolves.toBeNull();
  });

  it('login signs a token with the expected payload', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await service.login(user.email, 'pw');
    const payload = { sub: 'u1', email: 'a@b.com', role: 'admin', orgId: 'o1' };
    expect(jwt.sign).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ access_token: 'token', user: payload });
  });

  it('login throws on invalid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.login('x@y.com', 'pw')).rejects.toThrow('Invalid credentials');
  });

  it('authenticate looks the user up by email', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    await expect(service.authenticate(user.email)).resolves.toBe(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: user.email } });
  });
});
