import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';

@Injectable()
export class HouseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.house.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const house = await this.prisma.house.findFirst({
      where: { id, orgId },
    });
    if (!house) throw new NotFoundException(`House #${id} not found`);
    return house;
  }

  async findByCode(orgId: string, code: string) {
    return this.prisma.house.findFirst({ where: { orgId, code } });
  }

  async create(orgId: string, dto: CreateHouseDto) {
    return this.prisma.house.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateHouseDto) {
    const updates: Partial<UpdateHouseDto> = {};
    if (dto.name) updates.name = dto.name;
    if (dto.code) updates.code = dto.code;
    if (dto.address1) updates.address1 = dto.address1;
    if (dto.address2) updates.address2 = dto.address2;
    if (dto.city) updates.city = dto.city;
    if (dto.state) updates.state = dto.state;
    if (dto.postalCode) updates.postalCode = dto.postalCode;
    if (dto.country) updates.country = dto.country;
    if (dto.phone) updates.phone = dto.phone;
    if (dto.managerName) updates.managerName = dto.managerName;
    if (dto.managerPhone) updates.managerPhone = dto.managerPhone;
    if (dto.settings !== undefined) updates.settings = dto.settings;
    return this.prisma.house.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.house.delete({ where: { id, orgId } });
  }
}