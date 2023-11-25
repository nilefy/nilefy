import { Injectable, Inject } from '@nestjs/common';
import {
  DatabaseI,
  DrizzleAsyncProvider,
} from '../../drizzle/drizzle.provider';
import { QueryDb } from './data_queries.dto';
import { QueryRunnerI } from './query.interface';
import { QueryRet } from './query.types';
import { availableDataSources as ds } from '../../drizzle/schema/data_sources.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class DataQueriesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async runQuery(operation: string, query: QueryDb): Promise<QueryRet> {
    //data source
    const [dataSourceConfig] = await this.db.query.ds.findFirst({
      column: { config: true },
      where: eq(ds.id, query.dataSourceId),
    });
    //query
    const service = this.getService();
    return service.run(dataSourceConfig, { operation, query });
  }

  getService(): QueryRunnerI {}
}
