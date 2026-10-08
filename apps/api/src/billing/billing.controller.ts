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
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';

@Controller('orgs/:orgId/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('status') status?: string) {
    return this.billingService.findAll(orgId, status);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.findById(orgId, id);
  }

  @Get('account/:accountId')
  findByAccountId(@Param('orgId') orgId: string, @Param('accountId') accountId: string) {
    return this.billingService.findByAccountId(orgId, accountId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateBillingDto) {
    return this.billingService.create(orgId, dto);
  }

  @Put(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBillingDto,
  ) {
    return this.billingService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.remove(orgId, id);
  }
}
