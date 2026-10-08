import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { CommonService } from './common.service';
import { AppService } from '../app.service';
import { PrismaService } from '../database/prisma/prisma.service';

describe('CommonService', () => {
  const service = new CommonService();

  it('health reports ok with an ISO timestamp', () => {
    const h = service.health();
    expect(h.status).toBe('ok');
    expect(h.service).toBe('hcr-api');
    expect(new Date(h.timestamp).toISOString()).toBe(h.timestamp);
  });

  it('validateId returns a valid id unchanged', () => {
    expect(service.validateId('abcde')).toBe('abcde');
  });

  it.each(['', 'abcd'])('validateId rejects %p', (id) => {
    expect(() => service.validateId(id)).toThrow(BadRequestException);
  });
});

describe('AppService', () => {
  it('getHello returns the API banner', () => {
    expect(new AppService().getHello()).toBe('HCR Payroll & HR SaaS API');
  });
});

describe('PrismaService lifecycle', () => {
  it('connects on init and disconnects on destroy', async () => {
    const prisma = new PrismaService();
    const connect = jest.spyOn(prisma, '$connect').mockResolvedValue();
    const disconnect = jest.spyOn(prisma, '$disconnect').mockResolvedValue();
    await prisma.onModuleInit();
    await prisma.onModuleDestroy();
    expect(connect).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
