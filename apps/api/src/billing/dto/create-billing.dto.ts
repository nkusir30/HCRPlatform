import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';



export enum BillingStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected',
  REVERSED = 'reversed',
  CHARGED_BACK = 'charged_back',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum PaymentMethodType {
  CREDIT_CARD = 'credit-card',
  DEBIT_CARD = 'debit-card',
  ACH = 'ach',
  WIRE = 'wire',
  CHECK = 'check',
  DIGITAL_WALLET = 'digital-wallet',
  INTERNAL = 'internal',
}

export enum PaymentNetwork {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMEX = 'amex',
  DISCOVER = 'discover',
  UNIONPAY = 'unionpay',
  JCB = 'jcb',
  DINERS_CLUB = 'diners-club',
  OTHER = 'other',
}

export enum ProviderRemittanceMethod {
  EFT = 'eft',
  ACH = 'ach',
  PAPER_CHECK = 'paper-check',
  EFT_MAIL = 'eft-mail',
  DIRECTPOSITION = 'directposition',
  OTHER = 'other',
}

export enum DisbursementType {
  EFT = 'eft',
  ACH = 'ach',
  CHECK = 'check',
  DIRECTPOSITION = 'directposition',
  OTHER = 'other',
}

export enum DisbursementDesc {
  PAYROLL = 'payroll',
  BONUS = 'bonus',
  PAYOUT = 'payout',
  REIMBURSEMENT = 'reimbursement',
  OTHER = 'other',
}

export enum ArpDocType {
  INVOICE = 'invoice',
  POSTING = 'posting',
  RECONCILIATION = 'reconciliation',
  OTHER = 'other',
}

export class CreateBillingDto {
  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  paymentMethodId?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @IsEnum(BillingStatus)
  @IsOptional()
  status?: BillingStatus;

  @IsEnum(PaymentMethodType)
  @IsOptional()
  paymentMethodType?: PaymentMethodType;

  @IsEnum(PaymentNetwork)
  @IsOptional()
  paymentNetwork?: PaymentNetwork;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  providerId?: string;

  @IsString()
  @IsOptional()
  providerName?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  deductibleAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  marketplaceRebate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  providerRebate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  providerRemittance?: number;

  @IsEnum(ProviderRemittanceMethod)
  @IsOptional()
  providerRemittanceMethod?: ProviderRemittanceMethod;

  @IsDateString()
  @IsOptional()
  paymentDue?: string;

  @IsDateString()
  @IsOptional()
  paymentPostedAt?: string;

  @IsString()
  @IsOptional()
  payeeId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  arpAmount?: number;

  @IsDateString()
  @IsOptional()
  arpInvoiceDate?: string;

  @IsEnum(ArpDocType)
  @IsOptional()
  arpDocType?: ArpDocType;

  @IsDateString()
  @IsOptional()
  disbursementDate?: string;

  @IsString()
  @IsOptional()
  disbursementId?: string;

  @IsEnum(DisbursementType)
  @IsOptional()
  disbursementType?: DisbursementType;

  @IsEnum(DisbursementDesc)
  @IsOptional()
  disbursementDesc?: DisbursementDesc;

  @IsString()
  @IsOptional()
  disbursementCheckNumber?: string;

  @IsDateString()
  @IsOptional()
  txnDate?: string;

  @IsString()
  @IsOptional()
  txnMessage?: string;

  @IsBoolean()
  @IsOptional()
  isReversed?: boolean;

  @IsString()
  @IsOptional()
  reversalReason?: string;

  @IsDateString()
  @IsOptional()
  createdAt?: string;

  @IsDateString()
  @IsOptional()
  updatedAt?: string;
}