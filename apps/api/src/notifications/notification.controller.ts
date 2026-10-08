import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('orgs/:orgId/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(
    @Param('orgId') orgId: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    return this.notificationService.findAll(orgId, userId, status);
  }

  @Get(':id')
  findById(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationService.findById(orgId, id);
  }

  @Get('user/:userId')
  findByUserId(@Param('orgId') orgId: string, @Param('userId') userId: string) {
    return this.notificationService.findByUserId(orgId, userId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateNotificationDto) {
    return this.notificationService.create(orgId, dto);
  }

  @Put(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationService.remove(orgId, id);
  }
}
