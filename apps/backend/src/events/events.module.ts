import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ComponentsModule } from '../components/components.module';
import { DataQueriesModule } from '../data_queries/data_queries.module';

@Module({
  imports: [ComponentsModule, DataQueriesModule],
  providers: [EventsGateway],
})
export class EventsModule {}
