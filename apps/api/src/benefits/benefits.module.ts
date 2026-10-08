import { Module } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { BenefitsController } from './benefits.controller';
import { BenefitEnrollmentService } from './benefit-enrollment.service';
import { BenefitEnrollmentController } from './benefit-enrollment.controller';

@Module({
  controllers: [BenefitsController, BenefitEnrollmentController],
  providers: [BenefitsService, BenefitEnrollmentService],
  exports: [BenefitsService, BenefitEnrollmentService],
})
export class BenefitsModule {}