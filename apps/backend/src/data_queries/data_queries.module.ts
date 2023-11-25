import { Module } from '@nestjs/common';
import { DataQueriesController } from './data_queries.controller';
import { DataQueriesService } from './data_queries.service';

@Module({
  controllers: [DataQueriesController],
  providers: [DataQueriesService],
})
export class DataQueriesModule {}
