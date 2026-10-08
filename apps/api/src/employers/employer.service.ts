import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';

@Injectable()
export class EmployerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.employer.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const employer = await this.prisma.employer.findFirst({
      where: { id, orgId },
    });
    if (!employer) throw new NotFoundException(`Employer #${id} not found`);
    return employer;
  }

  async findByCode(orgId: string, code: string) {
    return this.prisma.employer.findFirst({ where: { orgId, code } });
  }

  async create(orgId: string, dto: CreateEmployerDto) {
    return this.prisma.employer.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateEmployerDto) {
    const updates: Partial<UpdateEmployerDto> = {};
    if (dto.name) updates.name = dto.name;
    if (dto.code) updates.code = dto.code;
    if (dto.address1) updates.address1 = dto.address1;
    if (dto.address2) updates.address2 = dto.address2;
    if (dto.city) updates.city = dto.city;
    if (dto.state) updates.state = dto.state;
    if (dto.postalCode) updates.postalCode = dto.postalCode;
    if (dto.country) updates.country = dto.country;
    if (dto.phone) updates.phone = dto.phone;
    if (dto.email) updates.email = dto.email;
    if (dto.industry) updates.industry = dto.industry;
    if (dto.taxId) updates.taxId = dto.taxId;
    if (dto.actId) updates.actId = dto.actId;
    if (dto.managementPhpId) updates.managementPhpId = dto.managementPhpId;
    if (dto.businessPhpId) updates.businessPhpId = dto.businessPhpId;
    if (dto.addressCertification) updates.addressCertification = dto.addressCertification;
    if (dto.businessLicense) updates.businessLicense = dto.businessLicense;
    if (dto.serviceContractorLicense) updates.serviceContractorLicense = dto.serviceContractorLicense;
    if (dto.medicaidProviderNumber) updates.medicaidProviderNumber = dto.medicaidProviderNumber;
    if (dto.medicareProviderNumber) updates.medicareProviderNumber = dto.medicareProviderNumber;
    if (dto.sywCert) updates.sywCert = dto.sywCert;
    if (dto.permittitNumber) updates.permittitNumber = dto.permittitNumber;
    if (dto.payrollContractorGovtAccountNumber) updates.payrollContractorGovtAccountNumber = dto.payrollContractorGovtAccountNumber;
    return this.prisma.employer.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.employer.delete({ where: { id, orgId } });
  }
}