import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  AppQueriesDto,
  AppQueryDto,
  QueryDb,
  QueryDto,
  RunQueryBody,
  UpdateQueryDto,
} from '../dto/data_queries.dto';
import { QueryRunnerI } from './query.interface';
import { QueryRet } from './query.types';
import { getQueryService } from '../data_sources/plugins/common/service';
import { and, eq, sql } from 'drizzle-orm';
import { WorkspaceDto } from '../dto/workspace.dto';
import { DataSourcesService } from '../data_sources/data_sources.service';
import {
  DatabaseI,
  PgTrans,
  queries,
  workspaceDataSources,
} from '@nilefy/database';

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
    { evaluatedConfig: evaluatedQuery, env }: RunQueryBody,
  ): Promise<QueryRet> {
    const query = await this.getQuery(appId, queryId);
    if (!query.dataSourceId) {
      throw new BadRequestException(
        'query should be connected to datasource to run the query',
      );
    }
    const ds = await this.dataSourcesService.getOne(
      workspaceId,
      query.dataSourceId,
    );
    const service = this.getService(ds.dataSource.name);
    const res = await service.run(ds.config[env], {
      name: query.id,
      query: evaluatedQuery,
    });
    return res;
  }

  /**
   * @returns return complete query back
   */
  async addQuery(
    query: Omit<QueryDb, 'baseDataSourceId'> & {
      dataSourceId: number;
    },
  ): Promise<AppQueryDto> {
    // const insertQuery = sql`INSERT INTO  workspace_app_queries (
    //   id,
    //   app_id,
    //   created_by_id,
    //   query,
    //   trigger_mode,
    //   data_source_id,
    //   base_data_source_id
    // )

    // SELECT ${query.id},
    //         ${query.appId},
    //         ${query.createdById},
    //         ${query.query},
    //         ${query.triggerMode},
    //         ${query.dataSourceId},
    //         data_sources.id

    // FROM data_sources
    // WHERE data_sources.id = ${query.dataSourceId}
    // returning workspace_app_queries.id;`;
    // const q = await this.db.execute(insertQuery);
    // console.log(
    //   '🪵 [data_queries.service.ts:68] ~ token ~ \x1b[0;32mq\x1b[0m = ',
    //   q.rows,
    // );
    const baseDataSourceId = await this.db.query.workspaceDataSources.findFirst(
      {
        columns: {
          dataSourceId: true,
        },
        where: eq(workspaceDataSources.id, query.dataSourceId),
      },
    );
    const [q] = await this.db
      .insert(queries)
      .values({
        ...query,
        baseDataSourceId: baseDataSourceId!.dataSourceId,
      })
      .returning({
        id: queries.id,
      });
    return await this.getQuery(query.appId, q.id);
  }

  async insert(queriesDto: QueryDb[], options?: { tx?: PgTrans }) {
    await (options?.tx ? options.tx : this.db)
      .insert(queries)
      .values(queriesDto);
  }

  async getAppQueries(appId: QueryDto['appId']): Promise<AppQueriesDto> {
    const q = await this.db.query.queries.findMany({
      where: eq(queries.appId, appId),
      columns: {
        id: true,
        query: true,
        appId: true,
        dataSourceId: true,
        triggerMode: true,
      },
      with: {
        baseDataSource: {
          columns: {
            queryConfig: true,
            id: true,
            type: true,
            name: true,
          },
        },
        dataSource: {
          columns: {
            id: true,
            name: true,
            config: true,
          },
        },
      },
    });
    const ret = q.map((e) => {
      return {
        ...e,
        dataSource: {
          id: e.dataSource.id,
          name: e.dataSource.name,
          env: [...Object.keys(e.dataSource.config)],
        },
      };
    });
    return ret;
  }

  async getQuery(
    appId: QueryDto['appId'],
    queryId: QueryDto['id'],
  ): Promise<AppQueryDto> {
    const q = await this.db.query.queries.findFirst({
      where: and(eq(queries.id, queryId), eq(queries.appId, appId)),
      columns: {
        id: true,
        query: true,
        appId: true,
        dataSourceId: true,
        triggerMode: true,
      },
      with: {
        baseDataSource: {
          columns: {
            queryConfig: true,
            id: true,
            type: true,
            name: true,
          },
        },
        dataSource: {
          columns: {
            id: true,
            name: true,
          },
          with: {},
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
  }): Promise<AppQueryDto> {
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
