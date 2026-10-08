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
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('orgs/:orgId/companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.companyService.findAll(orgId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.findById(orgId, id);
  }

  @Get('search/:code')
  findByCode(@Param('orgId') orgId: string, @Param('code') code: string) {
    return this.companyService.findByCode(orgId, code);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateCompanyDto) {
    return this.companyService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.remove(orgId, id);
  }
}