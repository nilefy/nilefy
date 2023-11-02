import { Module } from '@nestjs/common';
import { WebloomDbController as WebloomTableController } from './table.controller';
import { WebloomDbService as WebloomTableService } from './table.service';

@Module({
  controllers: [WebloomTableController],
  providers: [WebloomTableService],
  exports: [WebloomTableService],
})
export class WebloomTableModule {}
