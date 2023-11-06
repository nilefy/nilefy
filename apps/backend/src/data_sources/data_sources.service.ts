import { Inject, Injectable } from '@nestjs/common';
import { DataSourceDto, dataSourceT } from '../dto/data_sources.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { availableDataSources, dataSources } from '../drizzle/schema/schema';

@Injectable()
export class DataSourcesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  // TODO: fix json type stored in db

  async create(dataSourceDto: DataSourceDto): Promise<DataSourceDto> {
    const [dataSource] = await this.db
      .insert(dataSources)
      .values(dataSourceDto)
      .returning();
    return dataSource;
  }

  async add(dataSource: dataSourceT): Promise<dataSourceT> {
    const [ds] = await this.db
      .insert(availableDataSources)
      .values(dataSource)
      .returning();
    return ds;
  }
}

/*
Host
Port
SSL
Database Name
Username
Password
Connection Options
SSL Certificate
*/
