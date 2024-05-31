import { Module } from '@nestjs/common';
import { JsQueriesController } from './js_queries.controller';
import { JsQueriesService } from './js_queries.service';
import { ComponentsModule } from '../components/components.module';

@Module({
  imports: [ComponentsModule],
  controllers: [JsQueriesController],
  providers: [JsQueriesService],
})
export class JsQueriesModule {}
