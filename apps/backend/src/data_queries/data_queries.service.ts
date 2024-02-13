import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  AppQueriesDto,
  QueryDb,
  QueryDto,
  UpdateQueryDto,
} from '../dto/data_queries.dto';
import { QueryRunnerI } from './query.interface';
import { QueryRet } from './query.types';
import { queries } from '../drizzle/schema/data_sources.schema';
import { getQueryService } from '../data_sources/plugins/common/service';
import { and, eq, sql } from 'drizzle-orm';
import { WorkspaceDto } from '../dto/workspace.dto';
import { DataSourcesService } from '../data_sources/data_sources.service';

@Injectable()
export class DataQueriesService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    private dataSourcesService: DataSourcesService,
  ) {}

  async runQuery(
    workspaceId: WorkspaceDto['id'],
    appId: QueryDto['appId'],
    queryId: QueryDto['id'],
    evaluatedQuery: Record<string, unknown>,
  ): Promise<QueryRet> {
    const query = await this.getQuery(appId, queryId);
    const ds = await this.dataSourcesService.getOne(
      workspaceId,
      query.dataSourceId,
    );
    const service = await this.getService(ds.dataSource.name);
    return await service.run(ds.config, {
      name: query.name,
      query: evaluatedQuery,
    });
  }

  async addQuery(query: QueryDb): Promise<QueryDto> {
    const [q] = await this.db.insert(queries).values(query).returning();
    return q;
  }

  async getAppQueries(appId: QueryDto['appId']): Promise<AppQueriesDto[]> {
    const q = await this.db.query.queries.findMany({
      where: eq(queries.appId, appId),
      columns: {
        id: true,
        name: true,
        query: true,
      },
      with: {
        dataSource: {
          columns: {
            id: true,
            name: true,
          },
          with: {
            dataSource: {
              columns: {
                queryConfig: true,
                id: true,
                type: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return q as AppQueriesDto[];
  }

  async getQuery(
    appId: QueryDto['appId'],
    queryId: QueryDto['id'],
  ): Promise<QueryDto> {
    const q = await this.db.query.queries.findFirst({
      where: and(eq(queries.id, queryId), eq(queries.appId, appId)),
    });
    if (!q) {
      throw new NotFoundException(`Query ${queryId} not found`);
    }
    return q;
  }

  async deleteQuery(
    appId: QueryDto['appId'],
    queryId: QueryDto['id'],
  ): Promise<QueryDto> {
    const [q] = await this.db
      .delete(queries)
      .where(and(eq(queries.id, queryId), eq(queries.appId, appId)))
      .returning();
    return q;
  }

  async deleteDataSourceQueries(
    dataSourceId: QueryDto['dataSourceId'],
  ): Promise<QueryDto[]> {
    const q = await this.db
      .delete(queries)
      .where(eq(queries.dataSourceId, dataSourceId))
      .returning();
    return q;
  }

  async updateQuery({
    queryId,
    updatedById,
    query,
  }: {
    queryId: QueryDto['id'];
    updatedById: QueryDto['updatedById'];
    query: UpdateQueryDto;
  }): Promise<QueryDto> {
    const [q] = await this.db
      .update(queries)
      .set({ ...query, updatedById, updatedAt: sql`now()` })
      .where(eq(queries.id, queryId))
      .returning();
    return q;
  }

  async getService(dataSourceName: string): Promise<QueryRunnerI> {
    return getQueryService(dataSourceName);
  }
}
