import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

// Prisma uses cuid() ids, not UUIDs — ParseUUIDPipe rejects every real row id.
// Accept cuid/cuid2 (and legacy UUIDs) so org-scoped routes work with real data.
const ID_RE = /^(c[^\s/]{7,127}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

@Injectable()
export class ParseIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== 'string' || !ID_RE.test(value)) {
      throw new BadRequestException('Validation failed (id must be a cuid or UUID string)');
    }
    return value;
  }
}
