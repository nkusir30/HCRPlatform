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
import { ReportService } from './report.service';
import { CreateReportRequestDto } from './dto/create-report-request.dto';
import { UpdateReportRequestDto } from './dto/update-report-request.dto';

@Controller('orgs/:orgId/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('status') status?: string) {
    return this.reportService.findAll(orgId, status);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.reportService.findById(orgId, id);
  }

  @Get('search/:reportId')
  findByReportId(@Param('orgId') orgId: string, @Param('reportId') reportId: string) {
    return this.reportService.findByReportId(orgId, reportId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateReportRequestDto) {
    return this.reportService.create(orgId, dto);
  }

  @Put(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportRequestDto,
  ) {
    return this.reportService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.reportService.remove(orgId, id);
  }
}
