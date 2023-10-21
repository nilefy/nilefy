import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TableModule } from './table/table.module';
import { DbService } from './db/db.service';

@Module({
  imports: [TableModule],
  controllers: [AppController],
  providers: [AppService, DbService],
})
export class AppModule {}
