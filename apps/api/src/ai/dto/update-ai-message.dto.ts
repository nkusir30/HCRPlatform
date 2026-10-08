import { PartialType } from '@nestjs/mapped-types';
import { CreateAiMessageDto } from '../../ai-chat/dto/create-ai-message.dto';

// All create fields become optional on update. Unlike the narrower
// ai-chat UpdateAiMessageDto, this variant also accepts conversationId / role
// because AiService.update() re-parents and re-roles messages.
export class UpdateAiMessageDto extends PartialType(CreateAiMessageDto) {}
