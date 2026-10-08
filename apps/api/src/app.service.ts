import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'HCR Payroll & HR SaaS API';
  }
}
