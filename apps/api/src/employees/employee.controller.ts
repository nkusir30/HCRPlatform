import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';

@Controller('orgs/:orgId/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.employeeService.findAll(orgId);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseIdPipe) id: string) {
    return this.employeeService.findById(orgId, id);
  }

  @Get('search/:employeeCode')
  findByEmployeeCode(@Param('orgId') orgId: string, @Param('employeeCode') employeeCode: string) {
    return this.employeeService.findByEmployeeCode(orgId, employeeCode);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id', ParseIdPipe) id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseIdPipe) id: string) {
    return this.employeeService.remove(orgId, id);
  }
}