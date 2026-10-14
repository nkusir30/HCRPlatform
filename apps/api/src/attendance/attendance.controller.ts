import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto, UpdateAttendanceDto } from './dto/create-attendance.dto';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';

@Controller('orgs/:orgId/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.attendanceService.findAll(orgId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseIdPipe) id: string) {
    return this.attendanceService.findById(orgId, id);
  }

  // Clock-in (create an open punch).
  @Post()
  clockIn(@Param('orgId') orgId: string, @Body() dto: CreateAttendanceDto) {
    return this.attendanceService.clockIn(orgId, dto);
  }

  // Clock-out (close the punch). The service stamps clockOutAt server-side.
  @Put(':id')
  clockOut(@Param('orgId') orgId: string, @Param('id', ParseIdPipe) id: string, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.clockOut(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseIdPipe) id: string) {
    return this.attendanceService.remove(orgId, id);
  }
}
