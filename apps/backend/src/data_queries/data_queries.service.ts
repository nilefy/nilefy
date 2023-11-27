import { Injectable, Inject } from '@nestjs/common';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { QueryDb } from '../dto/data_queries.dto';
import { QueryRunnerI } from './query.interface';
import { QueryRet } from './query.types';
import { dataSources as ds } from '../drizzle/schema/data_sources.schema';
import { eq } from 'drizzle-orm';
import { DataSourceConfigT } from '../dto/data_sources.dto';

@Injectable()
export class DataQueriesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async runQuery(operation: string, query: QueryDb): Promise<QueryRet> {
    const dataSource = await this.db.query.workspaceDataSources.findFirst({
      columns: { config: true },
      where: eq(ds.id, query.dataSourceId),
    });
    const service = this.getService(query.dataSourceId);
    return service.run(dataSource?.config as DataSourceConfigT, {
      operation,
      query,
    });
  }

  // TODO
  async getService(dataSourceId: number): QueryRunnerI {
    const dataSource = await this.db.query.dataSources.findFirst({
      columns: { name: true },
      where: eq(ds.id, dataSourceId),
    });
  }
}
