import { Module } from '@nestjs/common';
import { DataSourcesService } from './data_sources.service';
import { DataSourcesController } from './data_sources.controller';
import { GlobalDataSourcesController } from './global_data_sources.controller';
import { GlobalDataSourcesService } from './global_data_sources.service';
import GoogleSheetsQueryService from './plugins/googlesheets/main';

@Module({
  providers: [
    DataSourcesService,
    GlobalDataSourcesService,
    GoogleSheetsQueryService,
  ],
  controllers: [DataSourcesController, GlobalDataSourcesController],
  exports: [DataSourcesService, GoogleSheetsQueryService],
})
export class DataSourcesModule {}
