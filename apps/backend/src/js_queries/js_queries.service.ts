import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { and, eq, sql } from 'drizzle-orm';
import { JsQueryDb, JsQueryDto, UpdateJsQueryDto } from '../dto/js_queries.dto';
import { AppDto } from '../dto/apps.dto';
import { DatabaseI, jsQueries } from '@webloom/database';

@Injectable()
export class JsQueriesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async create(jsQuery: JsQueryDb) {
    const [q] = await this.db.insert(jsQueries).values(jsQuery).returning();
    return q;
  }

  async update({
    appId,
    jsQueryId,
    updatedById,
    query,
  }: {
    appId: JsQueryDto['appId'];
    jsQueryId: JsQueryDto['id'];
    updatedById: JsQueryDto['updatedById'];
    query: UpdateJsQueryDto;
  }): Promise<JsQueryDto> {
    const [q] = await this.db
      .update(jsQueries)
      .set({ ...query, updatedById, updatedAt: sql`now()` })
      .where(and(eq(jsQueries.id, jsQueryId), eq(jsQueries.appId, appId)))
      .returning();
    if (!q) throw new NotFoundException(`no js query with the id ${jsQueryId}`);
    return q;
  }

  /**
   * get app js queries
   */
  async index(appId: AppDto['id']) {
    return await this.db.query.jsQueries.findMany({
      where: eq(jsQueries.appId, appId),
    });
  }

  async delete(appId: JsQueryDto['appId'], id: JsQueryDto['id']) {
    const [q] = await this.db
      .delete(jsQueries)
      .where(and(eq(jsQueries.id, id), eq(jsQueries.appId, appId)))
      .returning({
        id: jsQueries.id,
      });
    return q;
  }
}
