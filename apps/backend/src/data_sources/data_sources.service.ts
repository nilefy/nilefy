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
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class DataSourcesService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    readonly globalDataSourceService: GlobalDataSourcesService,
    readonly encryptionService: EncryptionService,
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
    console.log('old ds: ');
    console.log(ds);
    const config = this.decryptConfigRequiredFields(
      { ...ds['dataSource']['config'] },
      { ...ds['dataSource']['config']['uiSchema'] },
    );
    ds['dataSource']['config'] = config;
    console.log('new ds:');
    console.log(ds);
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

  private encryptConfigRequiredFields(
    config: any,
    uiSchema: Record<string, unknown> | undefined,
    isDecryption = false,
  ): any {
    if (!uiSchema) {
      return config;
    }
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
            processedConfig[key] = this.encryptConfigRequiredFields(
              value,
              uiSchema[key] as Record<string, unknown>,
            );
          } else {
            if (
              uiSchema[key] &&
              (uiSchema[key] as any)['ui:encrypted'] === 'encrypted'
            ) {
              console.log('before donig anything value: ');
              console.log(value);
              if (isDecryption) {
                console.log('decryption');
                processedConfig[key] =
                  'after decryption ' + this.encryptionService.decrypt(value);
              } else {
                console.log('encryption');
                processedConfig[key] = this.encryptionService.encrypt(value);
              }
              console.log('after decryption/encryption');
              console.log(processedConfig[key]);
            }
          }
        } catch (error) {
          console.error(`Error processing key "${key}": ${error.message}`);
        }
      }
    }

    return processedConfig;
  }

  private decryptConfigRequiredFields(
    config: any,
    uiSchema: Record<string, unknown> | undefined,
  ): any {
    return this.encryptConfigRequiredFields(config, uiSchema, true);
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
    const config = this.encryptConfigRequiredFields(dataSourceDto['config'], {
      ...uiSchema,
    });
    dataSourceDto['config'] = config;
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
