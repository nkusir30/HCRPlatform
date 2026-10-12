import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { SourceRow } from './dto';

export type SourceFormat = 'json' | 'ndjson' | 'sql';

export interface ImportStats {
  total: number;
  createdUsers: number;
  createdEmployees: number;
  updatedUsers: number;
  updatedEmployees: number;
  skipped: number;
  errors: string[];
}

interface MappedRow {
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  hireDate: string | null;
  terminationDate: string | null;
  employeeCode: string | null;
}

@Injectable()
export class UsersEmployeesImportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve the single organization + company to attach imported staff to.
   * Falls back to the first active org/company; throws a clear error if the
   * database has no tenant yet (run the demo seed / migrations first).
   */
  private async resolveTenant(): Promise<{ orgId: string; companyId: string }> {
    let org =
      (await this.prisma.organization.findFirst({ where: { active: true }, orderBy: { registeredAt: 'asc' } })) ??
      (await this.prisma.organization.findFirst({ orderBy: { registeredAt: 'asc' } }));
    // Self-sufficient import: create a default tenant when the database is empty
    // so the import works end-to-end without a separate seed step.
    if (!org) {
      org = await this.prisma.organization.create({
        data: {
          legalName: 'Home Care Residential',
          dbName: 'hcr',
          bannerColor: '#0a97a0',
          active: true,
        },
      });
    }
    let company = await this.prisma.company.findFirst({ where: { orgId: org.id }, orderBy: { createdAt: 'asc' } });
    if (!company) {
      company = await this.prisma.company.create({
        data: {
          orgId: org.id,
          name: 'Home Care Residential',
          code: 'hcr-default',
          address1: '1 Cumberland Place, Suite 312',
          city: 'Bangor',
          state: 'ME',
          postalCode: '04401',
          country: 'US',
          phone: '2077309712',
          industry: 'Home Care / DSP',
        },
      });
    }
    return { orgId: org.id, companyId: company.id };
  }

  async dryRun(rows: SourceRow[]): Promise<ImportStats> {
    return {
      total: rows.length,
      createdUsers: 0,
      createdEmployees: 0,
      updatedUsers: 0,
      updatedEmployees: 0,
      skipped: 0,
      errors: [],
    };
  }

  async import(rows: SourceRow[], _options: { chunkSize?: number } = {}): Promise<ImportStats> {
    const stats: ImportStats = {
      total: rows.length,
      createdUsers: 0,
      createdEmployees: 0,
      updatedUsers: 0,
      updatedEmployees: 0,
      skipped: 0,
      errors: [],
    };

    const { orgId, companyId } = await this.resolveTenant();

    for (const row of rows) {
      const mapped = this.mapUserRow(row);
      if (!mapped) {
        stats.skipped += 1;
        continue;
      }
      try {
        await this.upsertPerson(mapped, orgId, companyId, stats);
      } catch (err) {
        stats.errors.push(`${mapped.email}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return stats;
  }
  /**
   * Idempotently create/update a User and its linked Employee for one source row.
   * Email is the natural key for User; employeeCode is the natural key for
   * Employee. All writes go through Prisma (never raw SQL) so column names and
   * FKs always match the schema.
   */
  private async upsertPerson(
    mapped: MappedRow,
    orgId: string,
    companyId: string,
    stats: ImportStats,
  ): Promise<void> {
    const fullName = mapped.name ?? (`${mapped.firstName ?? ''} ${mapped.lastName ?? ''}`.trim() || mapped.email);
    const hireDate = mapped.hireDate ? new Date(mapped.hireDate) : new Date();

    await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email: mapped.email } });
      let user;
      if (existingUser) {
        user = await tx.user.update({
          where: { email: mapped.email },
          data: {
            name: fullName,
            firstName: mapped.firstName ?? existingUser.firstName,
            lastName: mapped.lastName ?? existingUser.lastName,
            phone: mapped.phone ?? existingUser.phone,
            updatedAt: new Date(),
          },
        });
        stats.updatedUsers += 1;
      } else {
        user = await tx.user.create({
          data: {
            orgId,
            companyId,
            email: mapped.email,
            name: fullName,
            firstName: mapped.firstName ?? fullName,
            lastName: mapped.lastName ?? '',
            phone: mapped.phone,
            role: 'employee',
            status: 'active',
            isActive: true,
          },
        });
        stats.createdUsers += 1;
      }

      const employeeCode = mapped.employeeCode ?? mapped.email.split('@')[0]!.toLowerCase();
      const existingEmployee = await tx.employee.findUnique({ where: { employeeCode } });
      const empData = {
        orgId,
        companyId,
        userId: user.id,
        firstName: mapped.firstName ?? existingEmployee?.firstName ?? fullName,
        lastName: mapped.lastName ?? existingEmployee?.lastName ?? '',
        email: mapped.email,
        phone: mapped.phone ?? existingEmployee?.phone ?? null,
        hireDate,
        terminationDate: mapped.terminationDate ? new Date(mapped.terminationDate) : null,
        status: 'active',
        updatedAt: new Date(),
      };
      if (existingEmployee) {
        await tx.employee.update({ where: { employeeCode }, data: empData });
        stats.updatedEmployees += 1;
      } else {
        await tx.employee.create({ data: { ...empData, employeeCode } });
        stats.createdEmployees += 1;
      }
    });
  }

  private mapUserRow(row: SourceRow): MappedRow | null {
    const email = (row.email ?? '').trim().toLowerCase();
    if (!email || !email.includes('@')) return null;
    return {
      email,
      name: (row.name ?? '').trim() || null,
      firstName: (row.firstName ?? '').trim() || null,
      lastName: (row.lastName ?? '').trim() || null,
      phone: (row.phone || '').trim() || null,
      hireDate: row.hireDate || null,
      terminationDate: row.terminationDate || null,
      employeeCode: row.employeeCode ? String(row.employeeCode).trim() : null,
    };
  }
}
