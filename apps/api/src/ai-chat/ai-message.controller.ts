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
import { AiMessageService } from './ai-message.service';
import { CreateAiMessageDto } from './dto/create-ai-message.dto';
import { UpdateAiMessageDto } from './dto/update-ai-message.dto';

@Controller('orgs/:orgId/ai-messages')
export class AiMessageController {
  constructor(private readonly aiMessageService: AiMessageService) {}

  @Get()
  findAll(
    @Param('orgId') orgId: string,
    @Query('conversationId') conversationId?: string,
    @Query('role') role?: string,
  ) {
    return this.aiMessageService.findAll(orgId, conversationId, role);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.aiMessageService.findById(orgId, id);
  }

  @Get('conv/:conversationId')
  findByConversation(
    @Param('orgId') orgId: string,
    @Param('conversationId') conversationId: string,
  ) {
    return this.aiMessageService.findByConversation(orgId, conversationId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateAiMessageDto) {
    return this.aiMessageService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAiMessageDto) {
    return this.aiMessageService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.aiMessageService.remove(orgId, id);
  }
}