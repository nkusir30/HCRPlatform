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
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@Controller('orgs/:orgId/webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('status') status?: string) {
    return this.webhookService.findAll(orgId, status);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.webhookService.findById(orgId, id);
  }

  @Get('url/:url')
  findByUrl(@Param('orgId') orgId: string, @Param('url') url: string) {
    return this.webhookService.findByUrl(orgId, url);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateWebhookDto) {
    return this.webhookService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWebhookDto) {
    return this.webhookService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.webhookService.remove(orgId, id);
  }
}