import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  CreatePageDb,
  CreatePageRetDto,
  PageDto,
  UpdatePageDb,
} from '../dto/pages.dto';
import { and, asc, eq, gt, gte, lt, lte, sql } from 'drizzle-orm';
import { AppDto } from '../dto/apps.dto';
import { ComponentsService } from '../components/components.service';
import { NilefyNode, NilefyTree } from '../dto/components.dto';
import { EDITOR_CONSTANTS } from '@nilefy/constants';
import { alias } from 'drizzle-orm/pg-core';
import { DatabaseI, pages, PgTrans, components } from '@nilefy/database';
@Injectable()
export class PagesService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    private componentsService: ComponentsService,
  ) {}

  private getNewPageIndexInApp(appId: AppDto['id']) {
    return sql`(select (COALESCE(max(${pages.index}) , 0) + 1) from pages where pages.app_id = ${appId})`;
  }

  /**
   * create page with the default root component
   */
  async create(
    pageDto: Omit<CreatePageDb, 'index' | 'handle' | 'index'> & {
      handle?: PageDto['handle'];
      index?: PageDto['index'];
    },
    options?: {
      tx?: PgTrans;
    },
  ): Promise<CreatePageRetDto> {
    const [p] = await (options?.tx ? options.tx : this.db)
      .insert(pages)
      .values({
        ...pageDto,
        handle: pageDto.handle ?? pageDto.name,
        index: this.getNewPageIndexInApp(pageDto.appId),
      })
      .returning();
    const [rootComponent] = await this.componentsService.create(
      [
        {
          id: EDITOR_CONSTANTS.ROOT_NODE_ID,
          type: EDITOR_CONSTANTS.WIDGET_CONTAINER_TYPE_NAME,
          pageId: p.id,
          createdById: pageDto.createdById,
          parentId: null,
          props: {
            className: 'h-full w-full',
          },
          col: 0,
          row: 0,
          columnsCount: EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
          rowsCount: 0,
        },
      ],
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
          props: rootComponent.props as NilefyNode['props'],
          nodes: [],
        },
      } satisfies NilefyTree,
    };
  }

  async clone({
    appId,
    id: pageId,
    createdById,
  }: Pick<PageDto, 'id' | 'createdById' | 'appId'>): Promise<PageDto> {
    return await this.db.transaction(async (tx) => {
      const pages2 = alias(pages, 'p2');
      const copyPage = sql`
      insert into ${pages} (app_id, created_by_id, handle, name, disabled, visible, index)
      select ${appId}, ${createdById}, ${pages2.handle} || ' (copy)', ${pages2.name} || ' (copy)', ${pages2.enabled}, ${pages2.visible}, (${this.getNewPageIndexInApp(appId)})
      from ${pages} as ${pages2}
      where ${pages2.id} = ${pageId} and ${pages2.appId} = ${appId}
      returning *;
      `;
      const newPage = (await tx.execute(copyPage))
        .rows[0] as unknown as PageDto;
      if (!newPage) {
        throw new NotFoundException('no app or page with those ids');
      }
      const components2 = alias(components, 'c2');
      const copyComponents = sql`
      insert into ${components} (created_by_id, id, type, props, parent_id, col, row, columns_count, rows_count, page_id)
      select ${createdById}, ${components2.id}, ${components2.type}, ${components2.props}, ${components2.parentId} , ${components2.col}, ${components2.row}, ${components2.columnsCount}, ${components2.rowsCount}, ${newPage.id}
      from ${components} as ${components2}
      where ${components2.pageId} = ${pageId}
      order by ${components2.createdAt} ASC;
      `;
      await tx.execute(copyComponents);
      return newPage;
    });
  }

  async index(appId: number): Promise<PageDto[]> {
    return await this.db.query.pages.findMany({
      where: eq(pages.appId, appId),
      orderBy: asc(pages.index),
    });
  }

  async findOne(appId: number, pageId: number): Promise<CreatePageRetDto> {
    const p = await this.db.query.pages.findFirst({
      where: and(eq(pages.appId, appId), eq(pages.id, pageId)),
    });
    if (!p)
      throw new NotFoundException(
        `No page with id ${pageId} in app with id ${appId}`,
      );
    const tree = await this.componentsService.getTreeForPage(p.id);
    return { ...p, tree };
  }

  async update(
    appId: AppDto['id'],
    pageId: PageDto['id'],
    pageDto: UpdatePageDb,
  ): Promise<PageDto[]> {
    // if the user updated page index, it has side effects of all pages of this app
    if (pageDto.index !== undefined) {
      const oldIndex = await this.db.query.pages.findFirst({
        columns: { index: true },
        where: and(eq(pages.appId, appId), eq(pages.id, pageId)),
      });

      if (!oldIndex)
        throw new NotFoundException('No app or page with those ids');
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
      .where(and(eq(pages.appId, appId), eq(pages.id, pageId)))
      .returning();
  }

  async createWithoutDefaultRoot(
    pageDto: CreatePageDb[],
    options?: { tx?: PgTrans },
  ) {
    const res = await (options?.tx ? options.tx : this.db)
      .insert(pages)
      .values(pageDto)
      .returning();
    return res;
  }

  // TODO: there must be at least one page in any app, throw if user tried to delete while there's only one page in app
  async delete({
    appId,
    pageId,
  }: {
    appId: AppDto['id'];
    pageId: PageDto['id'];
  }): Promise<PageDto[]> {
    const [{ count }] = await this.db
      .select({
        count: sql<number>`cast(count(${pages.id}) as int)`,
      })
      .from(pages)
      .where(eq(pages.appId, appId));

    if (count === 1) {
      throw new BadRequestException('Cannot delete the only page in an app');
    }

    return await this.db
      .delete(pages)
      .where(and(eq(pages.appId, appId), eq(pages.id, pageId)))
      .returning();
  }
}
