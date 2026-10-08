import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';

@Controller('orgs/:orgId/benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.benefitsService.findAll(orgId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.benefitsService.findById(orgId, id);
  }

  @Get('search/:category/:benefitId')
  findByCode(
    @Param('orgId') orgId: string,
    @Param('category') category: string,
    @Param('benefitId') benefitId: string,
  ) {
    return this.benefitsService.findByCode(orgId, category, benefitId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateBenefitDto) {
    return this.benefitsService.create(orgId, dto);
  }

  @Put(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBenefitDto,
  ) {
    return this.benefitsService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.benefitsService.remove(orgId, id);
  }
}
