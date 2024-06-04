import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateWsDataSourceDb,
  WsDataSourceDto,
  UpdateWsDataSourceDto,
  DataSourceConnectionDto,
  WsDataSourcesDto,
  DataSourceDto,
} from '../dto/data_sources.dto';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { and, eq, sql } from 'drizzle-orm';
import { QueryRunnerI, TestConnectionT } from '../data_queries/query.interface';
import { getQueryService } from './plugins/common/service';
import { DatabaseI, workspaceDataSources } from '@nilefy/database';

@Injectable()
export class DataSourcesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async create(dataSourceDto: CreateWsDataSourceDb): Promise<WsDataSourceDto> {
    const [dataSource] = await this.db
      .insert(workspaceDataSources)
      .values(dataSourceDto)
      .returning();
    return dataSource;
  }

  async getConnections({
    workspaceId,
    dataSourceId,
  }: {
    workspaceId: WsDataSourceDto['workspaceId'];
    dataSourceId: WsDataSourceDto['dataSourceId'];
  }): Promise<WsDataSourceDto[]> {
    const ds = await this.db.query.workspaceDataSources.findMany({
      where: and(
        eq(workspaceDataSources.workspaceId, workspaceId),
        eq(workspaceDataSources.dataSourceId, dataSourceId),
      ),
    });
    return ds as WsDataSourceDto[];
  }

  async getWsDataSources(
    workspaceId: WsDataSourceDto['workspaceId'],
    env: 'development' | 'staging' | 'production' | 'any',
  ): Promise<WsDataSourcesDto[]> {
    if (env === 'any') {
      const ds = await this.db.query.workspaceDataSources.findMany({
        columns: {
          id: true,
          name: true,
          workspaceId: true,
        },
        with: {
          dataSource: {
            columns: {
              id: true,
              name: true,
              image: true,
              type: true,
            },
          },
        },
        where: eq(workspaceDataSources.workspaceId, workspaceId),
      });
      return ds;
    }
    const query = `
      SELECT
        workspace_data_sources.id,
        workspace_data_sources.name,
        workspace_data_sources.workspace_id AS workspace_id,
        data_sources.id AS datasource_id,
        data_sources.name AS datasource_name,
        data_sources.image_url AS image,
        data_sources.type
      FROM workspace_data_sources
      JOIN data_sources ON workspace_data_sources.data_source_id = data_sources.id
      WHERE workspace_data_sources.workspace_id = ${workspaceId} AND workspace_data_sources.config ? '${env}'
      `;
    const { rows } = await this.db.execute(sql.raw(query));
    const ds = rows.map((row) => {
      return {
        id: row.id,
        name: row.name,
        workspaceId: row.workspace_id,
        dataSource: {
          id: row.datasource_id,
          name: row.datasource_name,
          image: row.image,
          type: row.type,
        },
      };
    });
    return ds;
  }

  async getOne(
    workspaceId: WsDataSourceDto['workspaceId'],
    datasourceId: WsDataSourceDto['id'],
  ): Promise<DataSourceConnectionDto> {
    const ds = await this.db.query.workspaceDataSources.findFirst({
      columns: {
        id: true,
        name: true,
        workspaceId: true,
        config: true,
      },
      with: {
        dataSource: {
          columns: {
            id: true,
            name: true,
            image: true,
            config: true,
            type: true,
          },
        },
      },
      where: and(
        eq(workspaceDataSources.workspaceId, workspaceId),
        eq(workspaceDataSources.id, datasourceId),
      ),
    });
    if (!ds) {
      throw new NotFoundException('cannot find this data source');
    }
    return ds;
  }

  async deleteConnections({
    workspaceId,
    dataSourceId,
  }: {
    workspaceId: WsDataSourceDto['workspaceId'];
    dataSourceId: WsDataSourceDto['dataSourceId'];
  }): Promise<WsDataSourceDto[]> {
    const ds = await this.db
      .delete(workspaceDataSources)
      .where(
        and(
          eq(workspaceDataSources.workspaceId, workspaceId),
          eq(workspaceDataSources.dataSourceId, dataSourceId),
        ),
      )
      .returning();
    return ds;
  }

  async deleteOne(
    workspaceId: WsDataSourceDto['workspaceId'],
    dataSourceId: WsDataSourceDto['id'],
  ): Promise<WsDataSourceDto> {
    const [ds] = await this.db
      .delete(workspaceDataSources)
      .where(
        and(
          eq(workspaceDataSources.id, dataSourceId),
          eq(workspaceDataSources.workspaceId, workspaceId),
        ),
      )
      .returning();
    return ds;
  }

  async update(
    {
      workspaceId,
      dataSourceId,
      updatedById,
    }: {
      dataSourceId: WsDataSourceDto['id'];
      workspaceId: WsDataSourceDto['workspaceId'];
      updatedById: WsDataSourceDto['updatedById'];
    },
    dataSourceDto: UpdateWsDataSourceDto,
  ): Promise<WsDataSourceDto> {
    const { config, env, name } = dataSourceDto;
    if (config) {
      /**
       * jsonb_set (target jsonb, path text[], new_value jsonb [, create_if_missing boolean ])
       */
      const query = `
        UPDATE workspace_data_sources
        SET config = jsonb_set(config, '{${env}}'::text[], '${JSON.stringify(config)}'::jsonb, true),
        name = '${name}',
        updated_at = now(),
        updated_by_id = ${updatedById}
        WHERE id = ${dataSourceId} AND workspace_id = ${workspaceId}
      `;
      await this.db.execute(sql.raw(query));
      const ds = await this.db.query.workspaceDataSources.findFirst({
        columns: {
          id: true,
          name: true,
          workspaceId: true,
          dataSourceId: true,
          config: true,
          createdAt: true,
          updatedAt: true,
          createdById: true,
          updatedById: true,
        },
        where: and(
          eq(workspaceDataSources.workspaceId, workspaceId),
          eq(workspaceDataSources.id, dataSourceId),
        ),
      });
      if (!ds) throw new NotFoundException();
      return ds;
    } else {
      const [ds] = await this.db
        .update(workspaceDataSources)
        .set({ updatedAt: sql`now()`, updatedById, ...dataSourceDto })
        .where(
          and(
            eq(workspaceDataSources.workspaceId, workspaceId),
            eq(workspaceDataSources.id, dataSourceId),
          ),
        )
        .returning();
      if (!ds) throw new NotFoundException();
      return ds;
    }
  }
  async testConnection(
    {
      workspaceId,
      dataSourceId,
    }: {
      dataSourceId: DataSourceDto['id'];
      workspaceId: WsDataSourceDto['workspaceId'];
    },
    config: Record<string, unknown>,
  ): TestConnectionT {
    const ds = await this.getOne(workspaceId, dataSourceId);
    const service = this.getService(ds.dataSource.name);
    if (service.testConnection) {
      const res = await service.testConnection(config);
      if (res.connected) {
        return res;
      } else {
        throw new BadRequestException(res.msg);
      }
    } else {
      throw new BadRequestException(
        "this data source doesn't support test connection functionality",
      );
    }
  }

  private getService(dataSourceName: string): QueryRunnerI {
    return getQueryService(dataSourceName);
  }
}
