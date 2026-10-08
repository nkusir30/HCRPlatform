import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.company.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, orgId },
    });
    if (!company) throw new NotFoundException(`Company #${id} not found`);
    return company;
  }

  async findByCode(orgId: string, code: string) {
    return this.prisma.company.findFirst({ where: { orgId, code } });
  }

  async create(orgId: string, dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateCompanyDto) {
    const updates: Partial<UpdateCompanyDto> = {};
    if (dto.name) updates.name = dto.name;
    if (dto.code) updates.code = dto.code;
    if (dto.address1) updates.address1 = dto.address1;
    if (dto.address2) updates.address2 = dto.address2;
    if (dto.city) updates.city = dto.city;
    if (dto.state) updates.state = dto.state;
    if (dto.postalCode) updates.postalCode = dto.postalCode;
    if (dto.country) updates.country = dto.country;
    if (dto.phone) updates.phone = dto.phone;
    if (dto.website) updates.website = dto.website;
    if (dto.industry) updates.industry = dto.industry;
    if (dto.onboardingUrl) updates.onboardingUrl = dto.onboardingUrl;
    return this.prisma.company.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.company.delete({ where: { id, orgId } });
  }
}