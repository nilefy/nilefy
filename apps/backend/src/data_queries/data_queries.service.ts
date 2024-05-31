import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  AppQueriesDto,
  QueryDb,
  QueryDto,
  UpdateQueryDto,
} from '../dto/data_queries.dto';
import { QueryRunnerI } from './query.interface';
import { QueryRet } from './query.types';
import { getQueryService } from '../data_sources/plugins/common/service';
import { and, eq, sql } from 'drizzle-orm';
import { WorkspaceDto } from '../dto/workspace.dto';
import { DataSourcesService } from '../data_sources/data_sources.service';
import { DataSourceDto, WsDataSourceDto } from '../dto/data_sources.dto';
import { DatabaseI, queries } from '@nilefy/database';

export type CompleteQueryI = QueryDto & {
  dataSource: Pick<WsDataSourceDto, 'id' | 'name'> & {
    dataSource: Pick<DataSourceDto, 'id' | 'name' | 'type' | 'queryConfig'>;
  };
};

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
    const service = this.getService(ds.dataSource.name);
    const res = await service.run(ds.config, {
      name: query.id,
      query: evaluatedQuery,
    });
    return res;
  }

  async addQuery(query: QueryDb): Promise<CompleteQueryI> {
    const [q] = await this.db.insert(queries).values(query).returning({
      id: queries.id,
    });
    return await this.getQuery(query.appId, q.id);
  }

  async getAppQueries(appId: QueryDto['appId']): Promise<AppQueriesDto[]> {
    const q = await this.db.query.queries.findMany({
      where: eq(queries.appId, appId),
      columns: {
        id: true,
        query: true,
        updatedAt: true,
        createdAt: true,
        appId: true,
        createdById: true,
        updatedById: true,
        dataSourceId: true,
        triggerMode: true,
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
    return q;
  }

  async getQuery(
    appId: QueryDto['appId'],
    queryId: QueryDto['id'],
  ): Promise<CompleteQueryI> {
    const q = await this.db.query.queries.findFirst({
      where: and(eq(queries.id, queryId), eq(queries.appId, appId)),
      columns: {
        id: true,
        query: true,
        updatedAt: true,
        createdAt: true,
        appId: true,
        createdById: true,
        updatedById: true,
        dataSourceId: true,
        triggerMode: true,
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
    if (!q) {
      throw new NotFoundException(`Query ${queryId} not found`);
    }
    return q;
  }

  async deleteQuery(appId: QueryDto['appId'], queryId: QueryDto['id']) {
    const [q] = await this.db
      .delete(queries)
      .where(and(eq(queries.id, queryId), eq(queries.appId, appId)))
      .returning({ id: queries.id });
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
    appId,
    queryId,
    updatedById,
    query,
  }: {
    appId: QueryDto['appId'];
    queryId: QueryDto['id'];
    updatedById: QueryDto['updatedById'];
    query: UpdateQueryDto;
  }): Promise<CompleteQueryI> {
    const [q] = await this.db
      .update(queries)
      .set({ ...query, updatedById, updatedAt: sql`now()` })
      .where(and(eq(queries.id, queryId), eq(queries.appId, appId)))
      .returning({ id: queries.id });
    return await this.getQuery(appId, q.id);
  }

  getService(dataSourceName: string): QueryRunnerI {
    return getQueryService(dataSourceName);
  }
}
