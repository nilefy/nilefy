import { Module } from '@nestjs/common';
import { DataSourcesService } from './data_sources.service';
import { DataSourcesController } from './data_sources.controller';

@Module({
  controllers: [DataSourcesController],
  providers: [DataSourcesService],
})
export class DataSourcesModule {}
