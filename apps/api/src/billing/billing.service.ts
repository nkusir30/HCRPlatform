import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string, status?: string) {
    const where: Record<string, unknown> = { orgId };
    if (status) where.status = status;
    return this.prisma.billing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, id: string) {
    const billing = await this.prisma.billing.findFirst({
      where: { id, orgId },
    });
    if (!billing) throw new NotFoundException(`Billing #${id} not found`);
    return billing;
  }

  async findByAccountId(orgId: string, accountId: string) {
    return this.prisma.billing.findFirst({ where: { orgId, accountId } });
  }

  async create(orgId: string, dto: CreateBillingDto) {
    return this.prisma.billing.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateBillingDto) {
    const updates: Partial<UpdateBillingDto> = {};
    if (dto.accountId) updates.accountId = dto.accountId;
    if (dto.paymentMethodId) updates.paymentMethodId = dto.paymentMethodId;
    if (dto.amount) updates.amount = dto.amount;
    if (dto.currency) updates.currency = dto.currency;
    if (dto.status) updates.status = dto.status;
    if (dto.paymentMethodType) updates.paymentMethodType = dto.paymentMethodType;
    if (dto.paymentNetwork) updates.paymentNetwork = dto.paymentNetwork;
    if (dto.transactionId) updates.transactionId = dto.transactionId;
    if (dto.providerId) updates.providerId = dto.providerId;
    if (dto.providerName) updates.providerName = dto.providerName;
    if (dto.deductibleAmount) updates.deductibleAmount = dto.deductibleAmount;
    if (dto.marketplaceRebate) updates.marketplaceRebate = dto.marketplaceRebate;
    if (dto.providerRebate) updates.providerRebate = dto.providerRebate;
    if (dto.providerRemittance) updates.providerRemittance = dto.providerRemittance;
    if (dto.providerRemittanceMethod) updates.providerRemittanceMethod = dto.providerRemittanceMethod;
    if (dto.paymentDue) updates.paymentDue = dto.paymentDue;
    if (dto.paymentPostedAt) updates.paymentPostedAt = dto.paymentPostedAt;
    if (dto.payeeId) updates.payeeId = dto.payeeId;
    if (dto.arpAmount) updates.arpAmount = dto.arpAmount;
    if (dto.arpInvoiceDate) updates.arpInvoiceDate = dto.arpInvoiceDate;
    if (dto.arpDocType) updates.arpDocType = dto.arpDocType;
    if (dto.disbursementDate) updates.disbursementDate = dto.disbursementDate;
    if (dto.disbursementId) updates.disbursementId = dto.disbursementId;
    if (dto.disbursementType) updates.disbursementType = dto.disbursementType;
    if (dto.disbursementDesc) updates.disbursementDesc = dto.disbursementDesc;
    if (dto.disbursementCheckNumber) updates.disbursementCheckNumber = dto.disbursementCheckNumber;
    if (dto.txnDate) updates.txnDate = dto.txnDate;
    if (dto.txnMessage) updates.txnMessage = dto.txnMessage;
    if (dto.isReversed) updates.isReversed = dto.isReversed;
    if (dto.reversalReason) updates.reversalReason = dto.reversalReason;
    if (dto.createdAt) updates.createdAt = dto.createdAt;
    if (dto.updatedAt) updates.updatedAt = dto.updatedAt;
    return this.prisma.billing.update({
      where: { id, orgId },
      data: updates,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.billing.delete({ where: { id, orgId } });
  }
}