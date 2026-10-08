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
import { Ten9289Service } from './ten-9289.service';
import { CreateTen9289Dto } from './dto/create-ten-9289.dto';
import { UpdateTen9289Dto } from './dto/update-ten-9289.dto';

@Controller('orgs/:orgId/1099s')
export class Ten9289Controller {
  constructor(private readonly ten9289Service: Ten9289Service) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('year') year?: string, @Query('employeeId') employeeId?: string) {
    return this.ten9289Service.findAll(orgId, year, employeeId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.ten9289Service.findById(orgId, id);
  }

  @Get('employee/:employeeId/year/:year')
  findByEmployeeYear(
    @Param('orgId') orgId: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Param('year') year: string,
  ) {
    return this.ten9289Service.findByEmployeeYear(orgId, employeeId, year);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateTen9289Dto) {
    return this.ten9289Service.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTen9289Dto) {
    return this.ten9289Service.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.ten9289Service.remove(orgId, id);
  }
}