import { Module } from '@nestjs/common';
import { AiConversationService } from './ai-conversation.service';
import { AiConversationController } from './ai-conversation.controller';

// AiMessageController / AiMessageService are registered by AiMessageModule
// (see ./ai-message.module.ts) to avoid duplicate route registration.
@Module({
  controllers: [AiConversationController],
  providers: [AiConversationService],
  exports: [AiConversationService],
})
export class AiConversationModule {}