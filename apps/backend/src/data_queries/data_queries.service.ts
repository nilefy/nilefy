import { Injectable, Inject } from '@nestjs/common';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { QueryDb, QueryDto } from '../dto/data_queries.dto';
import { QueryRunnerI } from './query.interface';
import { QueryRet } from './query.types';
import { dataSources, queries } from '../drizzle/schema/data_sources.schema';
import { DataSourceConfigT } from '../dto/data_sources.dto';
import { getQueryService } from '../data_sources/plugins/common/service';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class DataQueriesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async runQuery(
    config: DataSourceConfigT,
    query: QueryDb,
    dataSourceId: QueryDto['dataSourceId'],
  ): Promise<QueryRet> {
    const service = await this.getService(dataSourceId);
    return await service.run(config, {
      query: query.query,
      name: query.name,
    });
  }

  async addQuery(query: QueryDb): Promise<QueryDto> {
    const [q] = await this.db.insert(queries).values(query).returning();
    return q;
  }

  async getAppQueries(
    dataSourceId: QueryDto['dataSourceId'],
    appId: QueryDto['appId'],
  ): Promise<QueryDto[]> {
    const q = await this.db.query.queries.findMany({
      where: and(
        eq(queries.dataSourceId, dataSourceId),
        eq(queries.appId, appId),
      ),
    });
    return q;
  }

  async getQuery(queryId: QueryDto['id']): Promise<QueryDto | undefined> {
    const q = await this.db.query.queries.findFirst({
      where: and(eq(queries.id, queryId)),
    });
    return q;
  }

  async deleteQuery(queryId: QueryDto['id']): Promise<QueryDto | undefined> {
    const [q] = await this.db
      .delete(queries)
      .where(and(eq(queries.id, queryId)))
      .returning();
    return q;
  }

  async getService(dataSourceId: number): Promise<QueryRunnerI> {
    const ds = await this.db.query.dataSources.findFirst({
      where: eq(dataSources.id, dataSourceId),
    });
    return getQueryService(ds?.name as string);
  }
}
