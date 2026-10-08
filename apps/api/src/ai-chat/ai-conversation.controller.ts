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
import { AiConversationService } from './ai-conversation.service';
import { CreateAiConversationDto } from './dto/create-ai-conversation.dto';
import { UpdateAiConversationDto } from './dto/update-ai-conversation.dto';

@Controller('orgs/:orgId/ai-conversations')
export class AiConversationController {
  constructor(private readonly aiConversationService: AiConversationService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('status') status?: string) {
    return this.aiConversationService.findAll(orgId, status);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.aiConversationService.findById(orgId, id);
  }

  @Get('conv/:conversationId')
  findByConversationId(@Param('orgId') orgId: string, @Param('conversationId') conversationId: string) {
    return this.aiConversationService.findByConversationId(orgId, conversationId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateAiConversationDto) {
    return this.aiConversationService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAiConversationDto) {
    return this.aiConversationService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.aiConversationService.remove(orgId, id);
  }
}