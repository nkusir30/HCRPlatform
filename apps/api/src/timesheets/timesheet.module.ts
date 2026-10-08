import { Module } from '@nestjs/common';
import { TimesheetService, ApprovalService } from './timesheets.service';
import { TimesheetController } from './timesheet.controller';
import { ApprovalController } from './approval.controller';

@Module({
  controllers: [TimesheetController, ApprovalController],
  providers: [TimesheetService, ApprovalService],
  exports: [TimesheetService, ApprovalService],
})
export class TimesheetModule {}