import { Module } from '@nestjs/common';
import { DataSourcesService } from './data_sources.service';
import { DataSourcesController } from './data_sources.controller';
import { DataQueriesController } from './data_queries/data_queries.controller';
import { DataQueriesService } from './data_queries/data_queries.service';

@Module({
  controllers: [DataSourcesController, DataQueriesController],
  providers: [DataSourcesService, DataQueriesService],
})
export class DataSourcesModule {}
