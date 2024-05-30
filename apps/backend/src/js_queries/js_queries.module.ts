import { Module } from '@nestjs/common';
import { JsQueriesController } from './js_queries.controller';
import { JsQueriesService } from './js_queries.service';

@Module({
  controllers: [JsQueriesController],
  providers: [JsQueriesService],
})
export class JsQueriesModule {}
