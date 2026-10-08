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
import {
  BillingStatus,
  PaymentMethodType,
  PaymentNetwork,
  ProviderRemittanceMethod,
  DisbursementType,
  DisbursementDesc,
  ArpDocType,
} from './create-billing.dto';

export class UpdateBillingDto {
  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  paymentMethodId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

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
