import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { TaxRecordService } from './tax-record.service';
import { TaxRecordController } from './tax-record.controller';
import { W2Service } from './w2.service';
import { W2Controller } from './w2.controller';
import { Ten9289Service } from './ten-9289.service';
import { Ten9289Controller } from './ten-9289.controller';

@Module({
  controllers: [
    PayrollController,
    TaxRecordController,
    W2Controller,
    Ten9289Controller,
  ],
  providers: [
    PayrollService,
    TaxRecordService,
    W2Service,
    Ten9289Service,
  ],
  exports: [PayrollService, TaxRecordService, W2Service, Ten9289Service],
})
export class PayrollModule {}