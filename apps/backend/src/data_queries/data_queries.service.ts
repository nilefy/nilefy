import { Injectable, Inject } from '@nestjs/common';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { QueryDb, QueryDto } from '../dto/data_queries.dto';
import { QueryRunnerI } from './query.interface';
import { QueryRet } from './query.types';
import { queries } from '../drizzle/schema/data_sources.schema';
import { DataSourceConfigT } from '../dto/data_sources.dto';

@Injectable()
export class DataQueriesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async runQuery(config: DataSourceConfigT, query: QueryDb): Promise<QueryRet> {
    const service = this.getService();
    const ret = await service.run(config, {
      query: query.query,
      name: query.name,
    });

    if (ret.status === 200) {
      await this.addQuery(query);
    }
    return ret;
  }

  async addQuery(query: QueryDb): Promise<QueryDto> {
    const [q] = await this.db.insert(queries).values(query).returning();
    return q;
  }

  // TODO
  async getService(): QueryRunnerI {}
}
