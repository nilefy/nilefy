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
import { GlobalDataSourcesService } from './global_data_sources.service';

@Injectable()
export class DataSourcesService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    readonly globalDataSourceService: GlobalDataSourcesService,
  ) {}

  async create(dataSourceDto: CreateWsDataSourceDb): Promise<WsDataSourceDto> {
    console.log(dataSourceDto);
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
  ): Promise<WsDataSourcesDto[]> {
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

  private processConfig(
    config: any,
    uiSchema: Record<string, unknown> | undefined,
  ): any {
    if (!uiSchema) {
      return config;
    }

    console.log('pre config: ');
    console.log(config);

    console.log('pre ui scheme');
    console.log(uiSchema);

    const processedConfig = { ...config };

    for (const key in processedConfig) {
      if (processedConfig.hasOwnProperty(key)) {
        try {
          const value = processedConfig[key];

          if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          ) {
            // Recursively process nested objects with the corresponding uiSchema
            processedConfig[key] = this.processConfig(
              value,
              uiSchema[key] as Record<string, unknown>,
            );
          } else {
            if (
              uiSchema[key] &&
              (uiSchema[key] as any)['ui:encrypted'] === 'encrypted'
            ) {
              // processedConfig[key] = this.encrypt(value);
              processedConfig[key] = 'encrypted successfully';
            }
          }
        } catch (error) {
          console.error(`Error processing key "${key}": ${error.message}`);
        }
      }
    }

    return processedConfig;
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
    const r = await this.getOne(workspaceId, dataSourceId);
    const uiSchema = r['dataSource']['config']['uiSchema'];
    const config = this.processConfig(dataSourceDto['config'], { ...uiSchema });
    dataSourceDto['config'] = config;
    console.log('processed config');
    console.log(config);
    console.log('dataSourceDto');
    console.log(dataSourceDto);
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
