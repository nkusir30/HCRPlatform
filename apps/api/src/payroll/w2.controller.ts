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
import { W2Service } from './w2.service';
import { CreateW2Dto } from './dto/create-w2.dto';
import { UpdateW2Dto } from './dto/update-w2.dto';

@Controller('orgs/:orgId/w2s')
export class W2Controller {
  constructor(private readonly w2Service: W2Service) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('year') year?: string, @Query('employeeId') employeeId?: string) {
    return this.w2Service.findAll(orgId, year, employeeId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.w2Service.findById(orgId, id);
  }

  @Get('employee/:employeeId/year/:year')
  findByEmployeeYear(
    @Param('orgId') orgId: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Param('year') year: string,
  ) {
    return this.w2Service.findByEmployeeYear(orgId, employeeId, year);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateW2Dto) {
    return this.w2Service.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateW2Dto) {
    return this.w2Service.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.w2Service.remove(orgId, id);
  }
}