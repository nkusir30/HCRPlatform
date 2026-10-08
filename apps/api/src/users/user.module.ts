import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { CommonService } from '../common/common.service';

@Module({
  controllers: [UserController],
  providers: [UserService, AuthService, PrismaService, CommonService],
  exports: [UserService],
})
export class UserModule {}
