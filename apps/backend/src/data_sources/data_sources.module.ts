import { Module } from '@nestjs/common';
import { DataSourcesService } from './data_sources.service';
import { DataSourcesController } from './data_sources.controller';
import { GlobalDataSourcesController } from './global_data_sources.controller';
import { GlobalDataSourcesService } from './global_data_sources.service';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
  providers: [DataSourcesService, GlobalDataSourcesService, EncryptionService],
  controllers: [DataSourcesController, GlobalDataSourcesController],
  exports: [DataSourcesService],
})
export class DataSourcesModule {}
