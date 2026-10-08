import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { SignatureService } from './signature.service';
import { SignatureController } from './signature.controller';

@Module({
  controllers: [DocumentController, SignatureController],
  providers: [DocumentService, SignatureService],
  exports: [DocumentService, SignatureService],
})
export class DocumentModule {}