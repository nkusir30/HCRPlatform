import { Module } from '@nestjs/common';
import { AiMessageController } from './ai-message.controller';
import { AiMessageService } from './ai-message.service';

@Module({
  controllers: [AiMessageController],
  providers: [AiMessageService],
  exports: [AiMessageService],
})
export class AiMessageModule {}
