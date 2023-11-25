import { Inject, Injectable } from '@nestjs/common';
import {
  CreateDataSourceDb,
  DataSourceDto,
  dataSourceT,
  dataSourceDb,
} from '../dto/data_sources.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  availableDataSources,
  dataSources,
} from '../drizzle/schema/data_sources.schema';

@Injectable()
export class DataSourcesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async create(dataSourceDto: CreateDataSourceDb): Promise<DataSourceDto> {
    const [dataSource] = await this.db
      .insert(dataSources)
      .values(dataSourceDto)
      .returning();
    return dataSource as DataSourceDto;
  }

  async add(dataSource: dataSourceDb): Promise<dataSourceT> {
    const [ds] = await this.db
      .insert(availableDataSources)
      .values(dataSource)
      .returning();
    return ds as dataSourceT;
  }
}
