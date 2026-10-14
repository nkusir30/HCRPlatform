import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.passwordHash && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, role: user.role, orgId: user.orgId };
    return {
      access_token: this.jwt.sign(payload),
      user: payload,
    };
  }

  async authenticate(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Register a new user (bcrypt-hashed password) and return a JWT so the client
  // is immediately signed in. Rejects duplicate emails with a 409.
  async signup(input: { name: string; email: string; password: string; role: string; orgId: string; companyId: string }) {
    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with that email already exists.');
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    const [firstName, ...rest] = input.name.trim().split(/\s+/);
    const user = await this.prisma.user.create({
      data: {
        orgId: input.orgId,
        companyId: input.companyId,
        email,
        passwordHash,
        name: input.name.trim(),
        firstName: firstName || input.name.trim(),
        lastName: rest.join(' '),
        role: input.role,
        status: 'active',
        isActive: true,
      },
    });
    const payload = { sub: user.id, email: user.email, role: user.role, orgId: user.orgId };
    return {
      access_token: this.jwt.sign(payload),
      user: payload,
    };
  }
}
