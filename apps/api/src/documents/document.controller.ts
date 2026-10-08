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
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('orgs/:orgId/documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('status') status?: string) {
    return this.documentService.findAll(orgId, status);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.documentService.findById(orgId, id);
  }

  @Get('doc/:docId')
  findByDocId(@Param('orgId') orgId: string, @Param('docId') docId: string) {
    return this.documentService.findByDocId(orgId, docId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateDocumentDto) {
    return this.documentService.create(orgId, dto);
  }

  @Put(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.documentService.remove(orgId, id);
  }
}
