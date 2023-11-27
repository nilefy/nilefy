import { Inject, Injectable } from '@nestjs/common';
import {
  CreateWsDataSourceDb,
  WsDataSourceDto,
  DataSourceDto,
  DataSourceDb,
  GetWsDataSourceDto,
} from '../dto/data_sources.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  dataSources,
  workspaceDataSources,
} from '../drizzle/schema/data_sources.schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class DataSourcesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async create(dataSourceDto: CreateWsDataSourceDb): Promise<WsDataSourceDto> {
    const [dataSource] = await this.db
      .insert(workspaceDataSources)
      .values(dataSourceDto)
      .returning();
    return dataSource as WsDataSourceDto;
  }

  async get(obj: GetWsDataSourceDto): Promise<WsDataSourceDto[]> {
    const ds = await this.db.query.workspaceDataSources.findMany({
      where: obj.name
        ? and(
            eq(workspaceDataSources.workspaceId, obj.workspaceId),
            eq(workspaceDataSources.dataSourceId, obj.dataSourceId),
            eq(workspaceDataSources.name, obj.name),
          )
        : and(
            eq(workspaceDataSources.workspaceId, obj.workspaceId),
            eq(workspaceDataSources.dataSourceId, obj.dataSourceId),
          ),
    });
    return ds as WsDataSourceDto[];
  }

  // GLOBAL
  async add(dataSource: DataSourceDb): Promise<DataSourceDto> {
    const [ds] = await this.db
      .insert(dataSources)
      .values(dataSource)
      .returning();
    return ds as DataSourceDto;
  }
}
