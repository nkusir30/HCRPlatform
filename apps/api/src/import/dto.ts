import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export interface SourceRow {
  readonly email?: string;
  readonly name?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phone?: string;
  readonly company?: string;
  readonly program?: string;
  readonly employeeCode?: string;
  readonly hireDate?: string;
  readonly terminationDate?: string;
  readonly userId?: string;
  readonly employeeId?: string;
  readonly houseId?: string;
  readonly id?: string;
  readonly role?: string;
  readonly operator?: string;
}

export class ImportUsersEmployeesDto {
  @IsString()
  @IsOptional()
  readonly operator?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  readonly chunkSize?: number;

  @IsBoolean()
  @IsOptional()
  readonly apply?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly lines?: string[];
}
