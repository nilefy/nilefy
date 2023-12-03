import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ComponentsModule } from '../components/components.module';

@Module({
  imports: [ComponentsModule],
  providers: [EventsGateway],
})
export class EventsModule {}
