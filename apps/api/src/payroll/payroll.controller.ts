import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { UpdatePayrollPeriodDto } from './dto/update-payroll-period.dto';

@Controller('orgs/:orgId/payroll-periods')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.payrollService.findAll(orgId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.findById(orgId, id);
  }

  @Get('period/:periodId')
  findByPeriod(@Param('orgId') orgId: string, @Param('periodId', ParseUUIDPipe) periodId: string) {
    return this.payrollService.findByPeriodId(orgId, periodId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreatePayrollPeriodDto) {
    return this.payrollService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePayrollPeriodDto) {
    return this.payrollService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.remove(orgId, id);
  }
}