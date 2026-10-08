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
import { IntegrationService } from './integration.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Controller('orgs/:orgId/integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('status') status?: string) {
    return this.integrationService.findAll(orgId, status);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.integrationService.findById(orgId, id);
  }

  @Get('tenant/:tenant')
  findByTenant(@Param('orgId') orgId: string, @Param('tenant') tenant: string) {
    return this.integrationService.findByTenant(orgId, tenant);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateIntegrationDto) {
    return this.integrationService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateIntegrationDto) {
    return this.integrationService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.integrationService.remove(orgId, id);
  }
}