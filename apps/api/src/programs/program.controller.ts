import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateProgramDto, UpdateProgramDto } from './dto/create-program.dto';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';

@Controller('orgs/:orgId/programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.programService.findAll(orgId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseIdPipe) id: string) {
    return this.programService.findById(orgId, id);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateProgramDto) {
    return this.programService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseIdPipe) id: string, @Body() dto: UpdateProgramDto) {
    return this.programService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseIdPipe) id: string) {
    return this.programService.remove(orgId, id);
  }
}
