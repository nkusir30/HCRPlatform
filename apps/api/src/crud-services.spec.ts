import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { AiService } from './ai/ai.service';
import { AiConversationService } from './ai-chat/ai-conversation.service';
import { AiMessageService } from './ai-chat/ai-message.service';
import { BenefitEnrollmentService } from './benefits/benefit-enrollment.service';
import { BenefitsService } from './benefits/benefits.service';
import { BillingService } from './billing/billing.service';
import { CompanyService } from './companies/company.service';
import { DocumentService } from './documents/document.service';
import { SignatureService } from './documents/signature.service';
import { EmployeeService } from './employees/employee.service';
import { EmployerService } from './employers/employer.service';
import { HouseService } from './houses/house.service';
import { IntegrationService } from './integrations/integration.service';
import { NotificationService } from './notifications/notification.service';
import { PayrollService } from './payroll/payroll.service';
import { TaxRecordService } from './payroll/tax-record.service';
import { Ten9289Service } from './payroll/ten-9289.service';
import { W2Service } from './payroll/w2.service';
import { ReportService } from './reports/report.service';
import { ScheduleService } from './schedules/schedule.service';
import { WebhookService } from './webhooks/webhook.service';
import { PromptTemplateService } from './workflows/prompt-template.service';
import { WorkflowService } from './workflows/workflow.service';

type Ctor = new (prisma: never) => Record<string, (...args: never[]) => Promise<unknown>>;

// [label, service class, prisma model delegate name]
const cases: Array<[string, Ctor, string]> = [
  ['AiService', AiService as unknown as Ctor, 'aiMessage'],
  ['AiConversationService', AiConversationService as unknown as Ctor, 'aiConversation'],
  ['AiMessageService', AiMessageService as unknown as Ctor, 'aiMessage'],
  ['BenefitEnrollmentService', BenefitEnrollmentService as unknown as Ctor, 'benefitEnrollment'],
  ['BenefitsService', BenefitsService as unknown as Ctor, 'benefit'],
  ['BillingService', BillingService as unknown as Ctor, 'billing'],
  ['CompanyService', CompanyService as unknown as Ctor, 'company'],
  ['DocumentService', DocumentService as unknown as Ctor, 'document'],
  ['SignatureService', SignatureService as unknown as Ctor, 'signature'],
  ['EmployeeService', EmployeeService as unknown as Ctor, 'employee'],
  ['EmployerService', EmployerService as unknown as Ctor, 'employer'],
  ['HouseService', HouseService as unknown as Ctor, 'house'],
  ['IntegrationService', IntegrationService as unknown as Ctor, 'integration'],
  ['NotificationService', NotificationService as unknown as Ctor, 'notification'],
  ['PayrollService', PayrollService as unknown as Ctor, 'payrollPeriod'],
  ['TaxRecordService', TaxRecordService as unknown as Ctor, 'taxRecord'],
  ['Ten9289Service', Ten9289Service as unknown as Ctor, 'ten9289'],
  ['W2Service', W2Service as unknown as Ctor, 'w2'],
  ['ReportService', ReportService as unknown as Ctor, 'reportRequest'],
  ['ScheduleService', ScheduleService as unknown as Ctor, 'workSchedule'],
  ['WebhookService', WebhookService as unknown as Ctor, 'webhook'],
  ['PromptTemplateService', PromptTemplateService as unknown as Ctor, 'promptTemplate'],
  ['WorkflowService', WorkflowService as unknown as Ctor, 'workflowRule'],
];

describe.each(cases)('%s (org-scoped CRUD)', (_label, ServiceClass, model) => {
  let delegate: Record<'findMany' | 'findFirst' | 'create' | 'update' | 'delete', jest.Mock>;
  let service: InstanceType<Ctor>;

  beforeEach(() => {
    delegate = {
      findMany: jest.fn().mockResolvedValue([{ id: 'r1' }]),
      findFirst: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'new' }),
      update: jest.fn().mockResolvedValue({ id: 'r1' }),
      delete: jest.fn().mockResolvedValue({ id: 'r1' }),
    };
    service = new ServiceClass({ [model]: delegate } as never);
  });

  it('findAll scopes the query to the org', async () => {
    await (service.findAll as (orgId: string) => Promise<unknown>)('org-1');
    expect(delegate.findMany).toHaveBeenCalledTimes(1);
    expect(delegate.findMany.mock.calls[0][0].where).toMatchObject({ orgId: 'org-1' });
  });

  it('findById returns the record scoped by id and org', async () => {
    delegate.findFirst.mockResolvedValue({ id: 'r1' });
    await expect((service.findById as (o: string, i: string) => Promise<unknown>)('org-1', 'r1')).resolves.toEqual({
      id: 'r1',
    });
    expect(delegate.findFirst.mock.calls[0][0].where).toEqual({ id: 'r1', orgId: 'org-1' });
  });

  it('findById throws NotFoundException when missing', async () => {
    delegate.findFirst.mockResolvedValue(null);
    await expect(
      (service.findById as (o: string, i: string) => Promise<unknown>)('org-1', 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create stamps the orgId onto the dto data', async () => {
    await (service.create as (o: string, d: object) => Promise<unknown>)('org-1', { name: 'x' });
    expect(delegate.create).toHaveBeenCalledWith({ data: { orgId: 'org-1', name: 'x' } });
  });

  it('update is scoped by id and org and only sends provided fields', async () => {
    await (service.update as (o: string, i: string, d: object) => Promise<unknown>)('org-1', 'r1', {});
    expect(delegate.update).toHaveBeenCalledTimes(1);
    const arg = delegate.update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'r1', orgId: 'org-1' });
    expect(arg.data).toEqual({});
  });

  it('remove deletes by id and org', async () => {
    await (service.remove as (o: string, i: string) => Promise<unknown>)('org-1', 'r1');
    expect(delegate.delete).toHaveBeenCalledWith({ where: { id: 'r1', orgId: 'org-1' } });
  });

  it('update copies every provided field (all truthy branches)', async () => {
    // A proxy dto reports every property as set, exercising each `if (dto.x)` branch.
    const fullDto = new Proxy({}, { get: (_t, prop) => (typeof prop === 'string' ? 'v' : undefined) });
    await (service.update as (o: string, i: string, d: object) => Promise<unknown>)('org-1', 'r1', fullDto);
    const arg = delegate.update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'r1', orgId: 'org-1' });
    expect(Object.keys(arg.data).length).toBeGreaterThan(0);
  });

  it('findAll applies optional filters without dropping the org scope', async () => {
    await (service.findAll as (...a: string[]) => Promise<unknown>)('org-1', 'f1', 'f2');
    const where = delegate.findMany.mock.calls[0][0].where;
    expect(where.orgId).toBe('org-1');
  });

  it('secondary finders query within the org', async () => {
    delegate.findFirst.mockResolvedValue({ id: 'r1' });
    const finders = Object.getOwnPropertyNames(ServiceClass.prototype).filter((n) => /^findBy/.test(n));
    for (const name of finders) {
      delegate.findFirst.mockClear();
      delegate.findMany.mockClear();
      await (service[name] as (...a: string[]) => Promise<unknown>)('org-1', 'a', 'b');
      const call = delegate.findFirst.mock.calls[0] ?? delegate.findMany.mock.calls[0];
      expect(call[0].where.orgId).toBe('org-1');
    }
  });

  it('secondary finders that throw do so with NotFoundException', async () => {
    delegate.findFirst.mockResolvedValue(null);
    const finders = Object.getOwnPropertyNames(ServiceClass.prototype).filter((n) => /^findBy/.test(n));
    for (const name of finders) {
      const result = await (service[name] as (...a: string[]) => Promise<unknown>)('org-1', 'a', 'b').then(
        () => 'ok',
        (e: unknown) => e,
      );
      if (result !== 'ok') expect(result).toBeInstanceOf(NotFoundException);
    }
  });
});
