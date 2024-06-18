import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { AppsController } from './apps.controller';
import { PagesModule } from '../pages/pages.module';
import { ComponentsModule } from '../components/components.module';
import { DataQueriesModule } from '../data_queries/data_queries.module';
import { JsQueriesModule } from '../js_queries/js_queries.module';
import { JsLibrariesModule } from '../js_libraries/js_libraries.module';

@Module({
  imports: [
    PagesModule,
    ComponentsModule,
    DataQueriesModule,
    JsQueriesModule,
    JsLibrariesModule,
  ],
  controllers: [AppsController],
  providers: [AppsService],
})
export class AppsModule {}
