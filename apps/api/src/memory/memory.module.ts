import { Module } from '@nestjs/common';
import { Mem0Client } from './mem0.client';
import { MemoryController } from './memory.controller';
import { MemoryService } from './memory.service';

@Module({
  controllers: [MemoryController],
  providers: [Mem0Client, MemoryService],
  exports: [MemoryService],
})
export class MemoryModule {}
