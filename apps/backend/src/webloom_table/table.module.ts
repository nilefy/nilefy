import { Module } from '@nestjs/common';
import { TablecxController as WebloomTableController } from './table.controller';
import { TablecxService as WebloomTableService } from './table.service';
import { DbService } from './db/db.service';

@Module({
  controllers: [WebloomTableController],
  providers: [WebloomTableService, DbService],
  exports: [WebloomTableService],
})
export class WebloomTableModule {}
