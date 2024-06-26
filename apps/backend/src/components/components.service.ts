import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { PageDto } from '../dto/pages.dto';
import { and, eq, isNull, sql, ne, inArray } from 'drizzle-orm';
import {
  ComponentDto,
  CreateComponentDb,
  UpdateComponentDb,
  NilefyTree,
} from '../dto/components.dto';
import { EDITOR_CONSTANTS } from '@nilefy/constants';
import {
  components,
  DatabaseI,
  PgTrans,
  queries,
  jsQueries,
} from '@nilefy/database';
import { chunkArray } from '../utils';
import { QueryDto } from '../dto/data_queries.dto';
import { AppDto } from '../dto/apps.dto';
import { JsQueryDto } from '../dto/js_queries.dto';

@Injectable()
export class ComponentsService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  /**
   * components state is represented as tree, but notice there's case we don't have to handle while inserting
   * normally in trees(specially BST) you can insert node between two nodes, but we won't have this case you can only insert node as a leaf to some subtree
   */
  async create(
    componentDto: CreateComponentDb[],
    options?: {
      /**
       * if you want to put this operation in transaction
       */
      tx?: PgTrans;
    },
  ) {
    const res = [];
    const chunks = chunkArray(componentDto, 1000);
    for (const c of chunks) {
      res.push(
        ...(await (options?.tx ? options.tx : this.db)
          .insert(components)
          .values(c)
          .returning()),
      );
    }
    return res;
  }

  /**
   * unlike normal tree or graph when node get deleted the sub-tree under it gets deleted(on delete cascade)
   */
  async delete(
    pageId: PageDto['id'],
    componentIds: ComponentDto['id'][],
    options?: {
      /**
       * if you want to put this operation in transaction
       */
      tx?: PgTrans;
    },
  ) {
    const c = await (options?.tx ? options.tx : this.db)
      .delete(components)
      .where(
        and(
          eq(components.pageId, pageId),
          inArray(components.id, componentIds),
          ne(components.id, EDITOR_CONSTANTS.ROOT_NODE_ID),
        ),
      )
      .returning({ id: components.id });
    // either component doesn't exist or tried to delete root of page
    if (c.length === 0) {
      throw new BadRequestException();
    }
    return c;
  }

  /**
   * for now if user wants to update on field on the props the props object should be sent not only this field
   */
  async update(
    pageId: PageDto['id'],
    componentId: ComponentDto['id'],
    dto: UpdateComponentDb,
    options?: {
      tx?: PgTrans;
    },
  ) {
    // id/name is changed
    if (dto.newId && dto.newId !== componentId) {
      const newId = dto.newId;
      // there is a component with this new id
      const component = await this.getComponent(newId, pageId);
      if (component) {
        throw new BadRequestException(
          `There is another component with name ${newId}`,
        );
      }
      const { appId } = (await this.getComponent(componentId, pageId))!;
      const query = await this.getQueryById(newId, appId);
      if (query) {
        // there is a query with this id
        throw new BadRequestException(`There is a query with name ${newId}`);
      }
      const jsQuery = await this.getJsQueryById(newId, appId);
      if (jsQuery) {
        // there is a js query with this id
        throw new BadRequestException(`There is a JS query with name ${newId}`);
      }
    }

    // 1- the front stores the parentId of the root as the root itself, so if the front send update for the root it could contains parentId.
    // `getTreeForPage` get the head of the tree by searching for the node with parent(isNull).
    // so we need to keep this condition true => accept root updates but discard the `parentId` update
    return await (options?.tx ? options.tx : this.db)
      .update(components)
      .set({
        ...dto,
        id: (dto.newId as string) ?? componentId,
        parentId:
          componentId === EDITOR_CONSTANTS.ROOT_NODE_ID ? null : dto.parentId,
        updatedAt: sql`now()`,
      })
      .where(and(eq(components.pageId, pageId), eq(components.id, componentId)))
      .returning();
  }

  private convertComponentsToNilefyTree(
    coms: (ComponentDto & { level: number })[],
  ): NilefyTree {
    const tree: NilefyTree = {};
    coms.forEach((com) => {
      tree[com.id] = {
        id: com.id,
        nodes: [],
        // set root node as parent of itself
        parentId: com.parentId ?? com.id,
        props: com.props,
        type: com.type,
        col: com.col,
        row: com.row,
        columnsCount: com.columnsCount,
        rowsCount: com.rowsCount,
        columnWidth: 0,
      };
      if (com.level > 1) {
        tree[com.parentId!.toString()]['nodes'].push(com.id.toString());
      }
    });
    return tree;
  }

  /**
   * @returns  get components for a page as a list ordered by their level on the app tree
   */
  async getComponentsForPage(pageId: PageDto['id']) {
    const comps = await this.db.execute(sql`
    WITH RECURSIVE rectree AS (
      -- anchor element
      SELECT id, parent_id as "parentId",  props, type, col, row, rows_count as "rowsCount", columns_count as "columnsCount", 1 as level, page_id
        FROM ${components}
       WHERE ${and(isNull(components.parentId), eq(components.pageId, pageId))}
    UNION ALL 
    -- recursive
      SELECT t.id, t.parent_id as "parentId", t.props, t.type, t.col, t.row, t.rows_count as "rowsCount", t.columns_count as "columnsCount", (rectree.level + 1) as level, t.page_id
        FROM components as t
        JOIN rectree
          ON t.parent_id = rectree.id and t.page_id = rectree.page_id
    ) 
  SELECT * FROM rectree
  order by level;
    `);
    const rows = comps.rows as (ComponentDto & { level: number })[];
    if (rows.length === 0)
      throw new BadRequestException(
        'Page should contain at least one component(root)',
      ); // based on our business logic when page is created a root component is created with it and cannot delete the root node of a page
    return rows;
  }

  async getTreeForPage(pageId: PageDto['id']): Promise<NilefyTree> {
    const coms = await this.getComponentsForPage(pageId);
    return this.convertComponentsToNilefyTree(coms);
  }

  async getComponent(
    componentId: ComponentDto['id'],
    pageId: PageDto['id'],
  ): Promise<{ id: ComponentDto['id']; appId: AppDto['id'] } | undefined> {
    const ret = await this.db.query.components.findFirst({
      where: and(eq(components.id, componentId), eq(components.pageId, pageId)),
      columns: {
        id: true,
      },
      with: {
        page: {
          with: {
            app: {
              columns: {
                id: true,
              },
            },
          },
        },
      },
    });
    if (ret) {
      return {
        id: ret.id,
        appId: ret.page.app.id,
      };
    }
    return ret;
  }

  async getQueryById(
    queryId: QueryDto['id'],
    appId: AppDto['id'],
  ): Promise<QueryDto['id'] | undefined> {
    return (
      await this.db.query.queries.findFirst({
        where: and(eq(queries.id, queryId), eq(queries.appId, appId)),
        columns: {
          id: true,
        },
      })
    )?.id;
  }

  async getJsQueryById(
    jsQueryId: QueryDto['id'],
    appId: AppDto['id'],
  ): Promise<JsQueryDto['id'] | undefined> {
    return (
      await this.db.query.jsQueries.findFirst({
        where: and(eq(jsQueries.id, jsQueryId), eq(jsQueries.appId, appId)),
        columns: {
          id: true,
        },
      })
    )?.id;
  }
}
