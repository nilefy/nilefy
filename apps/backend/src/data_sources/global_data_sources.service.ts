import { Injectable, Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  DataSourceDto,
  DataSourceDb,
  DataSourceP,
} from '../dto/data_sources.dto';
import { eq } from 'drizzle-orm';
import { DatabaseI, dataSources, PgTrans } from '@nilefy/database';

@Injectable()
export class GlobalDataSourcesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async add(dataSource: DataSourceDb, options?: { tx?: PgTrans }) {
    const [ds] = await (options?.tx ? options.tx : this.db)
      .insert(dataSources)
      .values(dataSource)
      .returning();
    return ds;
  }

  async getAll(): Promise<DataSourceP[]> {
    const ds = await this.db.query.dataSources.findMany({
      columns: {
        config: false,
        queryConfig: false,
      },
    });
    return ds;
  }

  async getOne(dataSourceId: DataSourceDto['id']) {
    const ds = await this.db.query.dataSources.findFirst({
      where: eq(dataSources.id, dataSourceId),
    });
    return ds;
  }
}
