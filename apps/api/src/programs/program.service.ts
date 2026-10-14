import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.program.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const program = await this.prisma.program.findFirst({ where: { id, orgId } });
    if (!program) throw new NotFoundException(`Program #${id} not found`);
    return program;
  }

  async create(orgId: string, dto: CreateProgramDto) {
    return this.prisma.program.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateProgramDto) {
    // Verify the row belongs to this org first (scoped lookup).
    const existing = await this.prisma.program.findFirst({ where: { id, orgId } });
    if (!existing) throw new NotFoundException(`Program #${id} not found`);

    const updates: Partial<UpdateProgramDto> = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.code !== undefined) updates.code = dto.code;
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.houseId !== undefined) updates.houseId = dto.houseId || null;
    if (dto.active !== undefined) updates.active = dto.active;

    return this.prisma.program.update({
      where: { id },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    const existing = await this.prisma.program.findFirst({ where: { id, orgId } });
    if (!existing) throw new NotFoundException(`Program #${id} not found`);
    return this.prisma.program.delete({ where: { id } });
  }
}
