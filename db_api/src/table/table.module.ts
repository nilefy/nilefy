import { Module } from '@nestjs/common';
import { TableController } from './table.controller';
import { TableService } from './table.service';
import { DbService } from 'src/db/db.service';

@Module({
  controllers: [TableController],
  providers: [TableService, DbService ],
})
export class TableModule {}
