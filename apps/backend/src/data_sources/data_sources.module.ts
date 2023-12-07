import { Module } from '@nestjs/common';
import { DataSourcesService } from './data_sources.service';
import { DataSourcesController } from './data_sources.controller';
import { GlobalDataSourcesController } from './global_data_sources.controller';
import { GlobalDataSourcesService } from './global_data_sources.service';
import { DataQueriesService } from '../data_queries/data_queries.service';

@Module({
  controllers: [DataSourcesController, GlobalDataSourcesController],
  providers: [DataSourcesService, GlobalDataSourcesService, DataQueriesService],
})
export class DataSourcesModule {}
