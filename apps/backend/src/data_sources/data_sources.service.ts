import { Inject, Injectable } from '@nestjs/common';
import {
  CreateWsDataSourceDb,
  WsDataSourceDto,
  UpdateWsDataSourceDto,
} from '../dto/data_sources.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { workspaceDataSources } from '../drizzle/schema/data_sources.schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
// import { DataQueriesService } from '../data_queries/data_queries.service';

@Injectable()
export class DataSourcesService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    // private dataQueriesService: DataQueriesService,
  ) {}

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
        isNull(workspaceDataSources.deletedAt),
      ),
    });
    return ds as WsDataSourceDto[];
  }

  async getOne(dataSourceId: WsDataSourceDto['id']): Promise<WsDataSourceDto> {
    const ds = await this.db.query.workspaceDataSources.findFirst({
      where: and(
        eq(workspaceDataSources.id, dataSourceId),
        isNull(workspaceDataSources.deletedAt),
      ),
    });
    return ds as WsDataSourceDto;
  }

  async getWsDataSources(
    workspaceId: WsDataSourceDto['workspaceId'],
  ): Promise<WsDataSourceDto[]> {
    const ds = await this.db.query.workspaceDataSources.findMany({
      where: and(
        eq(workspaceDataSources.workspaceId, workspaceId),
        isNull(workspaceDataSources.deletedAt),
      ),
    });
    return ds as WsDataSourceDto[];
  }

  async deleteConnections({
    deletedById,
    workspaceId,
    dataSourceId,
  }: {
    deletedById: WsDataSourceDto['deletedById'];
    workspaceId: WsDataSourceDto['workspaceId'];
    dataSourceId: WsDataSourceDto['dataSourceId'];
  }): Promise<WsDataSourceDto['id'][]> {
    const ds = (
      await this.db
        .update(workspaceDataSources)
        .set({ deletedAt: sql`now()`, deletedById })
        .where(
          and(
            eq(workspaceDataSources.workspaceId, workspaceId),
            eq(workspaceDataSources.dataSourceId, dataSourceId),
          ),
        )
        .returning({ id: workspaceDataSources.id })
    ).map((d) => d.id);

    // delete data source connections' queries
    // await this.dataQueriesService.deleteDataSourceQueries(ds, deletedById);

    return ds as WsDataSourceDto['id'][];
  }

  async deleteOne({
    deletedById,
    dataSourceId,
  }: {
    deletedById: WsDataSourceDto['deletedById'];
    dataSourceId: WsDataSourceDto['id'];
  }): Promise<WsDataSourceDto> {
    const [ds] = await this.db
      .update(workspaceDataSources)
      .set({ deletedAt: sql`now()`, deletedById })
      .where(eq(workspaceDataSources.id, dataSourceId))
      .returning();

    // delete data source connection's queries
    // await this.dataQueriesService.deleteDataSourceQueries([ds.id], deletedById);

    return ds as WsDataSourceDto;
  }

  async update(
    {
      dataSourceId,
      updatedById,
    }: {
      dataSourceId: WsDataSourceDto['id'];
      updatedById: WsDataSourceDto['updatedById'];
    },
    dataSourceDto: UpdateWsDataSourceDto,
  ): Promise<WsDataSourceDto> {
    const [ds] = await this.db
      .update(workspaceDataSources)
      .set({ updatedAt: sql`now()`, updatedById, ...dataSourceDto })
      .where(
        and(
          eq(workspaceDataSources.id, dataSourceId),
          isNull(workspaceDataSources.deletedAt),
        ),
      )
      .returning();
    return ds as WsDataSourceDto;
  }
}
