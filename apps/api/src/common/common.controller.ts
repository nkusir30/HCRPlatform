import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CommonService } from './common.service';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return this.commonService.health();
  }
}
