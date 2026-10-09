import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

export class CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  orgId: string;
  companyId: string;
  role: string;
}

export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        orgId: dto.orgId,
        companyId: dto.companyId,
        name: `${dto.firstName} ${dto.lastName}`.trim(),
        role: dto.role || 'employee',
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const updates: Partial<UpdateUserDto> = {};
    if (dto.email) updates.email = dto.email;
    if (dto.firstName) updates.firstName = dto.firstName;
    if (dto.lastName) updates.lastName = dto.lastName;
    if (dto.phone) updates.phone = dto.phone;
    if (dto.role) updates.role = dto.role;
    if (dto.status) updates.status = dto.status;
    return this.prisma.user.update({ where: { id }, data: updates });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
