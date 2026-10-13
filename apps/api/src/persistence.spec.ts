import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { ParseIdPipe } from './common/pipes/parse-id.pipe';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateEmployeeDto } from './employees/dto/create-employee.dto';
import { CreateHouseDto } from './houses/dto/create-house.dto';

describe('ParseIdPipe (cuid-compatible ids)', () => {
  const pipe = new ParseIdPipe();

  it('accepts cuid ids produced by Prisma', () => {
    expect(pipe.transform('clxorg0001hcrplatformdemo')).toBe('clxorg0001hcrplatformdemo');
    expect(pipe.transform('cm3k2x9a10000123456789abc')).toBe('cm3k2x9a10000123456789abc');
  });

  it('accepts legacy UUIDs', () => {
    const uuid = '854f9453-d7a0-4e1f-b2c3-9d6e1f0a3b8c';
    expect(pipe.transform(uuid)).toBe(uuid);
  });

  it('rejects garbage ids', () => {
    expect(() => pipe.transform('not an id!!')).toThrow(BadRequestException);
    expect(() => pipe.transform('')).toThrow(BadRequestException);
  });
});

describe('persistence DTOs accept real form data', () => {
  it('CreateEmployeeDto allows missing userId/hireDate (service provisions them)', async () => {
    const dto = plainToInstance(CreateEmployeeDto, {
      companyId: 'clxco00001hcrplatformdemo',
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      phone: '9165550100',
      employeeCode: 'HCR-9999',
      employmentStatus: 'full-time',
      isActive: true,
    });
    const errors = await validate(dto);
    expect(errors).toEqual([]);
  });

  it('CreateHouseDto accepts short local phone formats', async () => {
    const dto = plainToInstance(CreateHouseDto, {
      companyId: 'clxco00001hcrplatformdemo',
      name: 'Test House',
      code: 'TEST',
      address1: '123 Test St',
      city: 'Sacramento',
      state: 'CA',
      postalCode: '95814',
      country: 'USA',
      phone: '9165550110',
      managerPhone: '9165550177',
    });
    const errors = await validate(dto);
    expect(errors).toEqual([]);
  });
});
