import { Module } from '@nestjs/common';
import { DataQueriesController } from './data_queries.controller';
import { DataQueriesService } from './data_queries.service';
import { DataSourcesService } from '../data_sources/data_sources.service';

@Module({
  exports: [DataSourcesService],
  controllers: [DataQueriesController],
  providers: [DataQueriesService, DataSourcesService],
})
export class DataQueriesModule {}
