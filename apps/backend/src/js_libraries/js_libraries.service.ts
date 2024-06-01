import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { and, eq, sql } from 'drizzle-orm';
import { AppDto } from '../dto/apps.dto';
import { DatabaseI, jsLibraries } from '@nilefy/database';
import {
  JsLibraryDb,
  JsLibraryDto,
  UpdateJsLibraryDto,
} from '../dto/js_libraries.dto';

@Injectable()
export class JsLibrariesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async create(jsQuery: JsLibraryDb) {
    const [q] = await this.db.insert(jsLibraries).values(jsQuery).returning();
    return q;
  }

  async update({
    appId,
    jsLibraryId,
    updatedById,
    library,
  }: {
    appId: JsLibraryDto['appId'];
    jsLibraryId: JsLibraryDto['id'];
    updatedById: JsLibraryDto['updatedById'];
    library: UpdateJsLibraryDto;
  }): Promise<JsLibraryDto> {
    const [q] = await this.db
      .update(jsLibraries)
      .set({ ...library, updatedById, updatedAt: sql`now()` })
      .where(and(eq(jsLibraries.id, jsLibraryId), eq(jsLibraries.appId, appId)))
      .returning();
    if (!q)
      throw new NotFoundException(`no js query with the id ${jsLibraryId}`);
    return q;
  }

  /**
   * @returns get app js libs
   */
  async index(appId: AppDto['id']) {
    return await this.db.query.jsLibraries.findMany({
      where: eq(jsLibraries.appId, appId),
    });
  }

  async delete(appId: JsLibraryDto['appId'], id: JsLibraryDto['id']) {
    const [q] = await this.db
      .delete(jsLibraries)
      .where(and(eq(jsLibraries.id, id), eq(jsLibraries.appId, appId)))
      .returning({
        id: jsLibraries.id,
      });
    return [q];
  }
}
