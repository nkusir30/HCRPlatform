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
import { ScheduleService } from './schedule.service';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';

@Controller('orgs/:orgId/schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  findAll(
    @Param('orgId') orgId: string,
    @Query('houseId') houseId?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.scheduleService.findAll(orgId, houseId, employeeId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.scheduleService.findById(orgId, id);
  }

  @Get('employee/:employeeId')
  findByEmployee(
    @Param('orgId') orgId: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query('payrollPeriodId') payrollPeriodId?: string,
  ) {
    return this.scheduleService.findByEmployee(orgId, employeeId, payrollPeriodId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateWorkScheduleDto) {
    return this.scheduleService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWorkScheduleDto) {
    return this.scheduleService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.scheduleService.remove(orgId, id);
  }
}