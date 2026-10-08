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
import { PromptTemplateService } from './prompt-template.service';
import { CreatePromptTemplateDto } from './dto/create-prompt-template.dto';
import { UpdatePromptTemplateDto } from './dto/update-prompt-template.dto';

@Controller('orgs/:orgId/workflow-templates')
export class PromptTemplateController {
  constructor(private readonly promptTemplateService: PromptTemplateService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('category') category?: string) {
    return this.promptTemplateService.findAll(orgId, category);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.promptTemplateService.findById(orgId, id);
  }

  @Get('category/:category')
  findByCategory(@Param('orgId') orgId: string, @Param('category') category: string) {
    return this.promptTemplateService.findByCategory(orgId, category);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreatePromptTemplateDto) {
    return this.promptTemplateService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePromptTemplateDto) {
    return this.promptTemplateService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.promptTemplateService.remove(orgId, id);
  }
}