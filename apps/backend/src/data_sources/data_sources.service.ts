import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateWsDataSourceDb,
  WsDataSourceDto,
  UpdateWsDataSourceDto,
  WsDataSourceP,
} from '../dto/data_sources.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { workspaceDataSources } from '../drizzle/schema/data_sources.schema';
import { and, eq, sql } from 'drizzle-orm';

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
  ): Promise<WsDataSourceP[]> {
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
  ): Promise<WsDataSourceP> {
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
    return ds as WsDataSourceP;
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
    return ds as WsDataSourceDto[];
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
    return ds as WsDataSourceDto;
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
    return ds as WsDataSourceDto;
  }
}