import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { CommonService } from '../common/common.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, CommonService],
  exports: [UserService],
})
export class UserModule {}
