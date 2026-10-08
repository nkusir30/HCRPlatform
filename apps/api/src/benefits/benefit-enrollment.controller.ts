import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { BenefitEnrollmentService } from './benefit-enrollment.service';
import { CreateBenefitEnrollmentDto } from './dto/create-benefit-enrollment.dto';
import { UpdateBenefitEnrollmentDto } from './dto/update-benefit-enrollment.dto';

@Controller('orgs/:orgId/benefit-enrollments')
export class BenefitEnrollmentController {
  constructor(private readonly enrollmentService: BenefitEnrollmentService) {}

  @Get()
  findAll(
    @Param('orgId') orgId: string,
    @Query('employeeId') employeeId?: string,
    @Query('benefitId') benefitId?: string,
  ) {
    return this.enrollmentService.findAll(orgId, employeeId, benefitId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentService.findById(orgId, id);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('orgId') orgId: string, @Param('employeeId') employeeId: string) {
    return this.enrollmentService.findByEmployee(orgId, employeeId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateBenefitEnrollmentDto) {
    return this.enrollmentService.create(orgId, dto);
  }

  @Put(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBenefitEnrollmentDto,
  ) {
    return this.enrollmentService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentService.remove(orgId, id);
  }
}
