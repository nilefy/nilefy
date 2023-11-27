import { Inject, Injectable } from '@nestjs/common';
import {
  CreateWsDataSourceDb,
  WsDataSourceDto,
  DataSourceDto,
  DataSourceDb,
} from '../dto/data_sources.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  dataSources,
  workspaceDataSources,
} from '../drizzle/schema/data_sources.schema';

@Injectable()
export class DataSourcesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async create(dataSourceDto: CreateWsDataSourceDb): Promise<WsDataSourceDto> {
    const [dataSource] = await this.db
      .insert(workspaceDataSources)
      .values(dataSourceDto)
      .returning();
    return dataSource as WsDataSourceDto;
  }

  async add(dataSource: DataSourceDb): Promise<DataSourceDto> {
    const [ds] = await this.db
      .insert(dataSources)
      .values(dataSource)
      .returning();
    return ds as DataSourceDto;
  }
}
