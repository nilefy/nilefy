import { Module } from '@nestjs/common';
import { ComponentsService } from './components.service';
import { DataQueriesModule } from '../data_queries/data_queries.module';

@Module({
  imports: [DataQueriesModule],
  providers: [ComponentsService],
  exports: [ComponentsService],
})
export class ComponentsModule {}
