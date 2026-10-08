import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CommonService {
  health() {
    return { status: 'ok', timestamp: new Date().toISOString(), service: 'hcr-api' };
  }

  validateId(id: string) {
    if (!id || id.length < 5) {
      throw new BadRequestException('Invalid ID');
    }
    return id;
  }
}
