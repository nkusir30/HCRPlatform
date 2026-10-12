import { Module } from '@nestjs/common';
import { UsersEmployeesImportService } from './service';
import { ImportUsersEmployeesController } from './controller';

@Module({
  controllers: [ImportUsersEmployeesController],
  providers: [UsersEmployeesImportService],
  exports: [UsersEmployeesImportService],
})
export class ImportUsersEmployeesModule {}
