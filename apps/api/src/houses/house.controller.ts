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
import { HouseService } from './house.service';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';

@Controller('orgs/:orgId/houses')
export class HouseController {
  constructor(private readonly houseService: HouseService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.houseService.findAll(orgId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.houseService.findById(orgId, id);
  }

  @Get('search/:code')
  findByCode(@Param('orgId') orgId: string, @Param('code') code: string) {
    return this.houseService.findByCode(orgId, code);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateHouseDto) {
    return this.houseService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateHouseDto) {
    return this.houseService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.houseService.remove(orgId, id);
  }
}