import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DatabaseI,
  DrizzleAsyncProvider,
  PgTrans,
} from '../drizzle/drizzle.provider';
import { CreatePageDb, PageDto, UpdatePageDb } from '../dto/pages.dto';
import { pages } from '../drizzle/schema/appsState.schema';
import { and, asc, eq, gt, gte, isNull, lt, lte, sql } from 'drizzle-orm';
import { AppDto } from '../dto/apps.dto';
import { UserDto } from '../dto/users.dto';
import { ComponentsService } from '../components/components.service';
import { WebloomNode, WebloomTree } from '../dto/components.dto';
import { EDITOR_CONSTANTS } from '@webloom/constants';
@Injectable()
export class PagesService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    private componentsService: ComponentsService,
  ) {}

  private getNewPageIndexInApp(appId: AppDto['id']) {
    return sql`(select (COALESCE(max(${pages.index}) , 0) + 1) from pages where pages.app_id = ${appId})`;
  }

  async create(
    pageDto: Omit<CreatePageDb, 'index' | 'handle' | 'index'> & {
      handle?: PageDto['handle'];
      index?: PageDto['index'];
    },
    options?: {
      tx?: PgTrans;
    },
  ) {
    const [p] = await (options?.tx ? options.tx : this.db)
      .insert(pages)
      .values({
        ...pageDto,
        handle: pageDto.handle ?? pageDto.name,
        index: this.getNewPageIndexInApp(pageDto.appId),
      })
      .returning();
    const rootComponent = await this.componentsService.create(
      {
        id: EDITOR_CONSTANTS.ROOT_NODE_ID,
        type: 'WebloomContainer',
        pageId: p.id,
        createdById: pageDto.createdById,
        parentId: null,
        props: {
          className: 'h-full w-full',
        },
        col: 0,
        row: 0,
        columnsCount: 32,
        rowsCount: 0,
      },
      {
        tx: options?.tx,
      },
    );
    return {
      ...p,
      tree: {
        [rootComponent.id]: {
          ...rootComponent,
          id: rootComponent.id,
          parentId: rootComponent.parentId ?? rootComponent.id,
          props: rootComponent.props as WebloomNode['props'],
          nodes: [],
        },
      } satisfies WebloomTree,
    };
  }

  async clone({
    appId,
    id: pageId,
    createdById,
  }: Pick<PageDto, 'id' | 'createdById' | 'appId'>) {
    // TODO: clone the tree state as well
    const origin = await this.db.query.pages.findFirst({
      columns: {
        id: true,
        name: true,
        handle: true,
      },
      where: and(eq(pages.appId, appId), eq(pages.id, pageId)),
    });
    if (!origin) throw new NotFoundException('no app or page with those ids');
    return await this.db
      .insert(pages)
      .values({
        name: origin.name + '(copy)',
        handle: origin.handle + '(copy)',
        createdById,
        appId,
        index: this.getNewPageIndexInApp(appId),
      })
      .returning();
  }

  async index(appId: number) {
    return await this.db.query.pages.findMany({
      where: and(eq(pages.appId, appId), isNull(pages.deletedAt)),
      orderBy: asc(pages.index),
    });
  }

  async findOne(appId: number, pageId: number) {
    const p = await this.db.query.pages.findFirst({
      where: and(
        eq(pages.appId, appId),
        eq(pages.id, pageId),
        isNull(pages.deletedAt),
      ),
    });
    if (!p) throw new NotFoundException('no app or page with those ids');
    const tree = await this.componentsService.getTreeForPage(p.id);
    return { ...p, tree };
  }

  async update(
    appId: AppDto['id'],
    pageId: PageDto['id'],
    pageDto: UpdatePageDb,
  ) {
    // if the user updated page index, it has side effects of all pages of this app
    if (pageDto.index !== undefined) {
      const oldIndex = await this.db.query.pages.findFirst({
        columns: { index: true },
        where: and(
          eq(pages.appId, appId),
          eq(pages.id, pageId),
          isNull(pages.deletedAt),
        ),
      });

      if (!oldIndex)
        throw new NotFoundException('no app or page with those ids');
      // two cases for the new index
      /**
       * index went down
       * inc index by 1 for [i - 1: j]
       *
       * index went up
       * dec index by one for [i + 1: j]
       */
      if (pageDto.index > oldIndex.index) {
        await this.db
          .update(pages)
          .set({ index: sql`${pages.index} - 1` })
          .where(
            and(
              eq(pages.appId, appId),
              isNull(pages.deletedAt),
              gt(pages.index, oldIndex.index),
              lte(pages.index, pageDto.index),
            ),
          );
      } else {
        await this.db
          .update(pages)
          .set({ index: sql`${pages.index} + 1` })
          .where(
            and(
              eq(pages.appId, appId),
              isNull(pages.deletedAt),
              lt(pages.index, oldIndex.index),
              gte(pages.index, pageDto.index),
            ),
          );
      }
    }
    return await this.db
      .update(pages)
      .set({
        ...pageDto,
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(pages.appId, appId),
          eq(pages.id, pageId),
          isNull(pages.deletedAt),
        ),
      )
      .returning();
  }

  // TODO: there must be at least one page in any app, throw if user tried to delete while there's only one page in app
  async delete({
    appId,
    pageId,
    deletedById,
  }: {
    appId: AppDto['id'];
    pageId: PageDto['id'];
    deletedById: UserDto['id'];
  }) {
    const [{ count }] = await this.db
      .select({
        count: sql<number>`cast(count(${pages.id}) as int)`,
      })
      .from(pages)
      .where(and(eq(pages.appId, appId), isNull(pages.deletedAt)));

    if (count === 1) {
      throw new BadRequestException('cannot delete the only page in an app');
    }

    return await this.db
      .update(pages)
      .set({
        deletedById: deletedById,
        deletedAt: sql`now()`,
      })
      .where(
        and(
          eq(pages.appId, appId),
          eq(pages.id, pageId),
          isNull(pages.deletedAt),
        ),
      )
      .returning();
  }
}
