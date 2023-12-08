import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateWsDataSourceDb,
  WsDataSourceDto,
  GetWsDataSourceDto,
  UpdateWsDataSourceDto,
} from '../dto/data_sources.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { workspaceDataSources } from '../drizzle/schema/data_sources.schema';
import { and, eq, isNull, sql } from 'drizzle-orm';

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
            isNull(workspaceDataSources.deletedAt),
          )
        : and(
            eq(workspaceDataSources.workspaceId, obj.workspaceId),
            eq(workspaceDataSources.dataSourceId, obj.dataSourceId),
            isNull(workspaceDataSources.deletedAt),
          ),
    });
    return ds as WsDataSourceDto[];
  }

  async getWsDataSources(workspaceId: WsDataSourceDto['workspaceId']) {
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
      where: and(
        eq(workspaceDataSources.workspaceId, workspaceId),
        isNull(workspaceDataSources.deletedAt),
      ),
    });
    return ds;
  }

  async getOne(
    workspaceId: WsDataSourceDto['workspaceId'],
    datasourceId: WsDataSourceDto['id'],
  ) {
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
        isNull(workspaceDataSources.deletedAt),
      ),
    });
    if (!ds) {
      throw new NotFoundException('cannot find this data source');
    }
    return ds;
  }

  async deleteAll(
    deletedById: WsDataSourceDto['deletedById'],
    obj: GetWsDataSourceDto,
  ): Promise<WsDataSourceDto[]> {
    const ds = await this.db
      .update(workspaceDataSources)
      .set({ deletedAt: sql`now()`, deletedById })
      .where(
        and(
          eq(workspaceDataSources.workspaceId, obj.workspaceId),
          eq(workspaceDataSources.dataSourceId, obj.dataSourceId),
        ),
      )
      .returning();
    return ds as WsDataSourceDto[];
  }

  async deleteOne(
    deletedById: WsDataSourceDto['deletedById'],
    obj: GetWsDataSourceDto,
  ): Promise<WsDataSourceDto> {
    const [ds] = await this.db
      .update(workspaceDataSources)
      .set({ deletedAt: sql`now()`, deletedById })
      .where(
        and(
          eq(workspaceDataSources.workspaceId, obj.workspaceId),
          eq(workspaceDataSources.id, obj.dataSourceId),
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
      workspaceId: WsDataSourceDto['workspaceId'];
      dataSourceId: WsDataSourceDto['dataSourceId'];
      updatedById: WsDataSourceDto['updatedById'];
    },
    dataSourceDto: UpdateWsDataSourceDto,
  ) {
    const [ds] = await this.db
      .update(workspaceDataSources)
      .set({ updatedAt: sql`now()`, updatedById, ...dataSourceDto })
      .where(
        and(
          eq(workspaceDataSources.workspaceId, workspaceId),
          eq(workspaceDataSources.id, dataSourceId),
          isNull(workspaceDataSources.deletedAt),
        ),
      )
      .returning();
    if (!ds) throw new NotFoundException();
    return ds;
  }
}
