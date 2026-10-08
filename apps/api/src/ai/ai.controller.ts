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
import { AiService } from './ai.service';
import { CreateAiMessageDto } from './dto/create-ai-message.dto';
import { UpdateAiMessageDto } from './dto/update-ai-message.dto';

@Controller('orgs/:orgId/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('messages')
  findAll(
    @Param('orgId') orgId: string,
    @Query('conversationId') conversationId?: string,
    @Query('role') role?: string,
  ) {
    return this.aiService.findAll(orgId, conversationId, role);
  }

  @Get('messages/:id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.aiService.findById(orgId, id);
  }

  @Get('conversations/:conversationId')
  findByConversation(@Param('orgId') orgId: string, @Param('conversationId') conversationId: string) {
    return this.aiService.findByConversation(orgId, conversationId);
  }

  @Post('messages')
  create(@Param('orgId') orgId: string, @Body() dto: CreateAiMessageDto) {
    return this.aiService.create(orgId, dto);
  }

  @Put('messages/:id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAiMessageDto) {
    return this.aiService.update(orgId, id, dto);
  }

  @Delete('messages/:id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.aiService.remove(orgId, id);
  }
}