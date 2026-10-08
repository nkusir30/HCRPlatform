import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { UpdateSignatureDto } from './dto/update-signature.dto';

@Injectable()
export class SignatureService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, documentId?: string) {
    const where: Record<string, unknown> = { orgId };
    if (documentId) where.documentId = documentId;
    return this.prisma.signature.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const signature = await this.prisma.signature.findFirst({
      where: { id, orgId },
    });
    if (!signature) throw new NotFoundException(`Signature #${id} not found`);
    return signature;
  }

  async findByDocAndSigner(orgId: string, documentId: string, signerId: string) {
    return this.prisma.signature.findFirst({
      where: { orgId, documentId, signerId },
    });
  }

  async create(orgId: string, dto: CreateSignatureDto) {
    return this.prisma.signature.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateSignatureDto) {
    const updates: Partial<UpdateSignatureDto> = {};
    if (dto.checksum) updates.checksum = dto.checksum;
    if (dto.pageNumber) updates.pageNumber = dto.pageNumber;
    if (dto.signatureData) updates.signatureData = dto.signatureData;
    if (dto.signedUrl) updates.signedUrl = dto.signedUrl;
    if (dto.signatureUrl) updates.signatureUrl = dto.signatureUrl;
    return this.prisma.signature.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.signature.delete({ where: { id, orgId } });
  }
}