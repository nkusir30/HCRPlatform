import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, status?: string) {
    const where: Record<string, unknown> = { orgId };
    if (status) where.status = status;
    return this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, orgId },
    });
    if (!document) throw new NotFoundException(`Document #${id} not found`);
    return document;
  }

  async findByDocId(orgId: string, docId: string) {
    return this.prisma.document.findFirst({ where: { orgId, docId } });
  }

  async create(orgId: string, dto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateDocumentDto) {
    const updates: Partial<UpdateDocumentDto> = {};
    if (dto.title) updates.title = dto.title;
    if (dto.type) updates.type = dto.type;
    if (dto.category) updates.category = dto.category;
    if (dto.status) updates.status = dto.status;
    if (dto.fileUrl) updates.fileUrl = dto.fileUrl;
    if (dto.fileName) updates.fileName = dto.fileName;
    if (dto.fileSize) updates.fileSize = dto.fileSize;
    if (dto.mimeType) updates.mimeType = dto.mimeType;
    if (dto.passwordProtected !== undefined) updates.passwordProtected = dto.passwordProtected;
    if (dto.expiresAt) updates.expiresAt = dto.expiresAt;
    if (dto.encryptedData) updates.encryptedData = dto.encryptedData;
    if (dto.encryptionKeyId) updates.encryptionKeyId = dto.encryptionKeyId;
    if (dto.signerIds) updates.signerIds = dto.signerIds;
    return this.prisma.document.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.document.delete({ where: { id, orgId } });
  }
}