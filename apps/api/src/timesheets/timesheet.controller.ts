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
import { TimesheetService } from './timesheets.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';

@Controller('orgs/:orgId/timesheets')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Get()
  findAll(
    @Param('orgId') orgId: string,
    @Query('employeeId') employeeId?: string,
    @Query('payrollPeriodId') payrollPeriodId?: string,
  ) {
    return this.timesheetService.findAll(orgId, employeeId, payrollPeriodId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetService.findById(orgId, id);
  }

  @Get('employee/:employeeId/period/:payrollPeriodId')
  findByEmployeeAndPeriod(
    @Param('orgId') orgId: string,
    @Param('employeeId') employeeId: string,
    @Param('payrollPeriodId') payrollPeriodId: string,
  ) {
    return this.timesheetService.findByEmployeeAndPeriod(orgId, employeeId, payrollPeriodId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateTimesheetDto) {
    return this.timesheetService.create(orgId, dto);
  }

  @Put(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTimesheetDto,
  ) {
    return this.timesheetService.update(orgId, id, dto);
  }

  @Delete(':id')
  destroy(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetService.destroy(orgId, id);
  }
}
