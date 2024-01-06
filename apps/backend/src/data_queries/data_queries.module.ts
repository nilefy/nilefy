import { Module } from '@nestjs/common';
import { DataQueriesController } from './data_queries.controller';
import { DataQueriesService } from './data_queries.service';
import { DataSourcesModule } from '../data_sources/data_sources.module';

@Module({
  imports: [DataSourcesModule],
  controllers: [DataQueriesController],
  providers: [DataQueriesService],
})
export class DataQueriesModule {}
