import { Injectable, Inject } from '@nestjs/common';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  DataSourceDto,
  DataSourceDb,
  DataSourceP,
} from '../dto/data_sources.dto';
import { dataSources } from '../drizzle/schema/data_sources.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class GlobalDataSourcesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async add(dataSource: DataSourceDb): Promise<DataSourceDto> {
    const [ds] = await this.db
      .insert(dataSources)
      .values(dataSource)
      .returning();
    return ds as DataSourceDto;
  }

  async getAll(): Promise<DataSourceP[]> {
    const ds = await this.db.query.dataSources.findMany({
      columns: {
        config: false,
        queryConfig: false,
      },
    });
    return ds;
  }

  async getOne(dataSourceId: DataSourceDto['id']): Promise<DataSourceDto> {
    const ds = await this.db.query.dataSources.findFirst({
      where: eq(dataSources.id, dataSourceId),
    });
    return ds as DataSourceDto;
  }
}
