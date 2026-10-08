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
import { TaxRecordService } from './tax-record.service';
import { CreateTaxRecordDto } from './dto/create-tax-record.dto';
import { UpdateTaxRecordDto } from './dto/update-tax-record.dto';

@Controller('orgs/:orgId/tax-records')
export class TaxRecordController {
  constructor(private readonly taxRecordService: TaxRecordService) {}

  @Get()
  findAll(
    @Param('orgId') orgId: string,
    @Query('payrollPeriodId') payrollPeriodId?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.taxRecordService.findAll(orgId, payrollPeriodId, employeeId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.taxRecordService.findById(orgId, id);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateTaxRecordDto) {
    return this.taxRecordService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaxRecordDto) {
    return this.taxRecordService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.taxRecordService.remove(orgId, id);
  }
}