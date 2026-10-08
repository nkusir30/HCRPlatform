import { Controller, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApprovalService } from './timesheets.service';
import { AcceptTimesheetDto } from './dto/accept-timesheet.dto';
import { DisapproveTimesheetDto } from './dto/disapprove-timesheet.dto';

@Controller('orgs/:orgId/timesheets')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post(':id/accept')
  accept(
    @Param('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AcceptTimesheetDto,
  ) {
    return this.approvalService.accept(orgId, id, dto.userId, {
      attested: dto.attested,
      totalsHash: dto.totalsHash,
    });
  }

  @Post(':id/approve')
  approve(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.approvalService.approve(orgId, id);
  }

  @Post(':id/disapprove')
  disapprove(
    @Param('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DisapproveTimesheetDto,
  ) {
    return this.approvalService.disapprove(orgId, id, dto.reason);
  }
}
