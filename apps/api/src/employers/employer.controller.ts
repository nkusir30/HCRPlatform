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
import { EmployerService } from './employer.service';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';

@Controller('orgs/:orgId/employers')
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.employerService.findAll(orgId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.employerService.findById(orgId, id);
  }

  @Get('search/:code')
  findByCode(@Param('orgId') orgId: string, @Param('code') code: string) {
    return this.employerService.findByCode(orgId, code);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateEmployerDto) {
    return this.employerService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEmployerDto) {
    return this.employerService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.employerService.remove(orgId, id);
  }
}