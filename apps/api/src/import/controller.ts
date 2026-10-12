import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ImportUsersEmployeesDto } from './dto';
import { UsersEmployeesImportService } from './service';

@Controller('orgs/:orgId/import')
export class ImportUsersEmployeesController {
  constructor(private readonly importService: UsersEmployeesImportService) {}

  @Post('users-employees')
  async importUsersEmployees(@Body() dto: ImportUsersEmployeesDto) {
    let rows: any[] = [];
    if (dto.lines) {
      rows = dto.lines;
    } else if (process.env.IMPORT_SOURCE) {
      const raw = require('fs').readFileSync(process.env.IMPORT_SOURCE, 'utf8');
      if (raw.trim().startsWith('INSERT')) rows = this.parseSqlRows(raw);
      else if (raw.includes('\n')) rows = raw.split('\n').map((l: string) => l.trim()).filter(Boolean);
      else rows = JSON.parse(raw);
    } else {
      throw new BadRequestException('IMPORT_SOURCE env var or lines body param is required.');
    }

    const stats = await this.importService.import(rows, { chunkSize: dto.chunkSize });
    return { ok: true, ...stats };
  }

  private parseSqlRows(sql: string): any[] {
    const rows: any[] = [];
    const re = /INSERT\s+INTO\s+(?:public\.)?users\s+\([^)]*\)\s+VALUES\s*\(([^)]*)\)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(sql)) !== null) {
      const parts = m[1].split(',').map((s: string) => s.trim().replace(/^'|'$/g, ''));
      rows.push({ email: parts[0], name: parts[2], firstName: parts[3], lastName: parts[4], phone: parts[5], operator: 'import' });
    }
    return rows;
  }
}
