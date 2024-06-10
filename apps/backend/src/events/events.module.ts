import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ComponentsModule } from '../components/components.module';
import { DataQueriesModule } from '../data_queries/data_queries.module';
import { JsQueriesModule } from '../js_queries/js_queries.module';

@Module({
  imports: [ComponentsModule, DataQueriesModule, JsQueriesModule],
  providers: [EventsGateway],
})
export class EventsModule {}
