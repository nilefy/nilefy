import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { and, eq, sql } from 'drizzle-orm';
import { JsQueryDb, JsQueryDto, UpdateJsQueryDto } from '../dto/js_queries.dto';
import { AppDto } from '../dto/apps.dto';
import { DatabaseI, jsQueries } from '@webloom/database';
import { apps } from '@webloom/database';
import { ComponentsService } from '../components/components.service';
import { PageDto } from '../dto/pages.dto';
import { queries } from '@webloom/database';

@Injectable()
export class JsQueriesService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    private componentsService: ComponentsService,
  ) {}

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
    if (query.id && query.id !== jsQueryId) {
      const newId = query.id;
      const jsQuery = await this.db.query.jsQueries.findFirst({
        where: and(eq(jsQueries.id, newId), eq(jsQueries.appId, appId)),
        columns: {
          id: true,
        },
      });
      if (jsQuery) {
        // there is a js query with this new id
        throw new BadRequestException(
          `There is another JS query with name ${newId}`,
        );
      }
      const q = await this.db.query.queries.findFirst({
        where: and(eq(queries.id, newId), eq(queries.appId, appId)),
        columns: {
          id: true,
        },
      });
      if (q) {
        // there is a query with this new id
        throw new BadRequestException(`There is a query with name ${newId}`);
      }
      const appPages = (
        await this.db.query.apps.findFirst({
          where: eq(apps.id, appId),
          with: {
            pages: {
              columns: {
                id: true,
              },
            },
          },
        })
      )?.pages;
      (appPages ?? []).forEach(async (page: { id: PageDto['id'] }) => {
        const pageId = page.id;
        const ret = await this.componentsService.getComponent(newId, pageId);
        if (ret) {
          // there is a component with this new id
          throw new BadRequestException(
            `There is a component with name ${newId}, page ${pageId}`,
          );
        }
      });
    }
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
