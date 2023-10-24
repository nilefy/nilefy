import { Module } from '@nestjs/common';
import { TablecxController } from './tablecx.controller';
import { TablecxService } from './tablecx.service';
import { DbService } from './db/db.service';

@Module({
  controllers: [TablecxController],
  providers: [TablecxService, DbService],
})
export class TablecxModule {}
