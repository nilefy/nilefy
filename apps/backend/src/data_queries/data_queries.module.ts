import { Module } from '@nestjs/common';
import { DataQueriesController } from './data_queries.controller';
import { DataQueriesService } from './data_queries.service';
import { DataSourcesModule } from '../data_sources/data_sources.module';
import { ComponentsModule } from '../components/components.module';

@Module({
  imports: [DataSourcesModule, ComponentsModule],
  controllers: [DataQueriesController],
  providers: [DataQueriesService],
  exports: [DataQueriesService],
})
export class DataQueriesModule {}
