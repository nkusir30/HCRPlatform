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
import { SignatureService } from './signature.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { UpdateSignatureDto } from './dto/update-signature.dto';

@Controller('orgs/:orgId/signatures')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('documentId') documentId?: string) {
    return this.signatureService.findAll(orgId, documentId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.signatureService.findById(orgId, id);
  }

  @Get('document/:documentId/signer/:signerId')
  findByDocAndSigner(
    @Param('orgId') orgId: string,
    @Param('documentId') documentId: string,
    @Param('signerId') signerId: string,
  ) {
    return this.signatureService.findByDocAndSigner(orgId, documentId, signerId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateSignatureDto) {
    return this.signatureService.create(orgId, dto);
  }

  @Put(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSignatureDto,
  ) {
    return this.signatureService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.signatureService.remove(orgId, id);
  }
}
