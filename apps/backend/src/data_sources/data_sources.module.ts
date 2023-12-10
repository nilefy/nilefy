import { Module } from '@nestjs/common';
import { DataSourcesService } from './data_sources.service';
import { DataSourcesController } from './data_sources.controller';
import { GlobalDataSourcesController } from './global_data_sources.controller';
import { GlobalDataSourcesService } from './global_data_sources.service';

@Module({
  providers: [DataSourcesService, GlobalDataSourcesService],
  controllers: [DataSourcesController, GlobalDataSourcesController],
  exports: [DataSourcesService],
})
export class DataSourcesModule {}