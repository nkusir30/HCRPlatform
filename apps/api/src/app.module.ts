import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { TimesheetModule } from './timesheets/timesheet.module';
import { PayrollModule } from './payroll/payroll.module';
import { EmployeeModule } from './employees/employee.module';
import { CompanyModule } from './companies/company.module';
import { HouseModule } from './houses/house.module';
import { ScheduleModule } from './schedules/schedule.module';
import { BenefitsModule } from './benefits/benefits.module';
import { ATSModule } from './ats/ats.module';
import { AIModule } from './ai/ai.module';
import { DocumentModule } from './documents/document.module';
import { EmployerModule } from './employers/employer.module';
import { ReportModule } from './reports/report.module';
import { NotificationModule } from './notifications/notification.module';
import { IntegrationModule } from './integrations/integration.module';
import { WorkflowModule } from './workflows/workflow.module';
import { AiConversationModule } from './ai-chat/ai-conversation.module';
import { AiMessageModule } from './ai-chat/ai-message.module';
import { WebhookModule } from './webhooks/webhook.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CompanyModule,
    HouseModule,
    EmployeeModule,
    TimesheetModule,
    ScheduleModule,
    PayrollModule,
    BenefitsModule,
    ReportModule,
    ATSModule,
    DocumentModule,
    EmployerModule,
    NotificationModule,
    IntegrationModule,
    WorkflowModule,
    AiConversationModule,
    AiMessageModule,
    AIModule,
    WebhookModule,
    DatabaseModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
