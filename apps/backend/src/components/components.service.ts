import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  DatabaseI,
  DrizzleAsyncProvider,
  PgTrans,
} from '../drizzle/drizzle.provider';
import { PageDto } from '../dto/pages.dto';
import { and, eq, isNull, sql, ne, inArray } from 'drizzle-orm';
import { components } from '../drizzle/schema/appsState.schema';
import {
  ComponentDto,
  createComponentDb,
  CreateComponentDb,
  UpdateComponentDb,
  WebloomTree,
} from '../dto/components.dto';
import { EDITOR_CONSTANTS } from '@webloom/constants';

@Injectable()
export class ComponentsService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  /**
   * components state is represented as tree, but notice there's case we don't have to handle while inserting
   * normally in trees(specially BST) you can insert node between two nodes, but we won't have this case you can only insert node as child of a node
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
    console.log(componentDto);
    return await (options?.tx ? options.tx : this.db)
      .insert(components)
      .values(componentDto)
      .returning();
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
    // 1- the front stores the parentId of the root as the root itself, so if the front send update for the root it could contains parentId.
    // `getTreeForPage` get the head of the tree by searching for the node with parent(isNull).
    // so we need to keep this condition true => accept root updates but discard the `parentId` update
    return await (options?.tx ? options.tx : this.db)
      .update(components)
      .set({
        ...dto,
        parentId:
          componentId === EDITOR_CONSTANTS.ROOT_NODE_ID ? null : dto.parentId,
        updatedAt: sql`now()`,
      })
      .where(and(eq(components.pageId, pageId), eq(components.id, componentId)))
      .returning();
  }

  async getTreeForPage(pageId: PageDto['id']): Promise<WebloomTree> {
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
        'page should contain at least one component(root)',
      ); // based on our business logic when page is created a root component is created with it and cannot delete the root node of a page
    const tree: WebloomTree = {};
    rows.forEach((row) => {
      tree[row.id] = {
        id: row.id,
        nodes: [],
        // set root node as parent of itself
        parentId: row.parentId ?? row.id,
        props: row.props,
        type: row.type,
        col: row.col,
        row: row.row,
        columnsCount: row.columnsCount,
        rowsCount: row.rowsCount,
        columnWidth: 0,
      };
      if (row.level > 1) {
        tree[row.parentId!.toString()]['nodes'].push(row.id.toString());
      }
    });
    return tree;
  }

  async createTreeForPageImport(
    pageId: PageDto['id'],
    createdById: PageDto['createdById'],
    componentsDto:
      | ImportTreeDto
      | {
          [key: string]: {
            id: string;
            nodes: string[];
            parentId: string;
            props: {
              [key: string]: any;
            };
            type: string;
            col: number;
            row: number;
            columnsCount: number;
            rowsCount: number;
            columnWidth: number;
          };
        },
    options?: {
      tx?: PgTrans;
    },
  ) {
    console.log('from createTreeForPageImport: ');
    console.log(componentsDto);
    pageId;
    componentsDto;
    options;

    const [t] = await (options?.tx ? options.tx : this.db)
      .insert(components)
      .values({
        id: EDITOR_CONSTANTS.ROOT_NODE_ID,
        type: 'WebloomContainer',
        pageId: pageId,
        createdById: createdById,
        parentId: null,
        props: {
          className: 'h-full w-full',
          isCanvas: 'true',
        },
        col: 0,
        row: 0,
        columnsCount: 32,
        rowsCount: 0,
      })
      .returning();

    for (const key in componentsDto) {
      if (componentsDto.hasOwnProperty(key)) {
        try {
          if (key === EDITOR_CONSTANTS.ROOT_NODE_ID) continue;
          const obj = componentsDto[key];
          await (options?.tx ? options.tx : this.db)
            .insert(components)
            .values({
              ...obj,
              pageId: pageId,
              createdById: createdById,
              id: key,
              parentId: obj.parentId,
            })
            .returning();
        } catch (e) {
          console.log('error in createTreeForPageImport: ' + e);
        }
      }
    }

    const tree = await this.getTreeForPage(pageId);
    console.log('Tree from db:');
    console.log(tree);

    const keys = Object.keys(componentsDto);
    ///
    /// nodes: keys.filter((k) => k !== EDITOR_CONSTANTS.ROOT_NODE_ID),
    ///

    // const [s] = await (options?.tx ? options.tx : this.db)
    //   .insert(components)
    //   .values({
    //     id: componentsDto,
    //     type: 'WebloomContainer',
    //     pageId: pageId,
    //     createdById: createdById,
    //     parentId: null,
    //     props: {
    //       className: 'h-full w-full',
    //       isCanvas: 'true',
    //     },
    //     col: 0,
    //     row: 0,
    //     columnsCount: 32,
    //     rowsCount: 0,
    //   })
    //   .returning();

    // console.log('output tree:');
    // console.log(t);

    // const [ta] = await (options?.tx ? options.tx : this.db)
    //   .insert(components)
    //   .values({
    //     id: 'WebloomContainer16',
    //     type: 'WebloomContainer',
    //     pageId: pageId,
    //     createdById: createdById,
    //     parentId: '0',
    //     props: { color: '#a883f2', layoutMode: 'fixed' },
    //     col: 0,
    //     row: 0,
    //     columnsCount: 10,
    //     rowsCount: 40,
    //   })
    //   .returning();
    return [t];
  }
}

type ImportTreeDto = {
  [key: string]: {
    id: string;
    nodes: string[];
    parentId: string;
    props: {
      [key: string]: any;
    };
    type: string;
    col: number;
    row: number;
    columnsCount: number;
    rowsCount: number;
    columnWidth: number;
  };
};
