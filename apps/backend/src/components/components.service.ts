import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  DatabaseI,
  DrizzleAsyncProvider,
  PgTrans,
} from '../drizzle/drizzle.provider';
import { PageDto } from '../dto/pages.dto';
import { WebloomNode, WebloomTree } from '../dto/apps.dto';
import { and, eq, isNull, sql, ne } from 'drizzle-orm';
import { components } from '../drizzle/schema/appsState.schema';
import {
  ComponentDto,
  CreateComponentDb,
  UpdateComponentDb,
} from '../dto/components.dto';

@Injectable()
export class ComponentsService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  /**
   * components state is represented as tree, but notice there's case we don't have to handle while inserting
   * normally in trees(specially BST) you can insert node between two nodes, but we won't have this case you can only insert node as child of a node
   */
  async create(
    componentDto: CreateComponentDb,
    options?: {
      tx?: PgTrans;
    },
  ) {
    return (
      await (options?.tx ? options.tx : this.db)
        .insert(components)
        .values(componentDto)
        .returning()
    )[0];
  }

  /**
   * unlike normal tree or graph when node get deleted the sub-tree under it gets deleted(on delete cascade)
   */
  async delete(pageId: PageDto['id'], componentId: ComponentDto['id']) {
    const [c] = await this.db
      .delete(components)
      .where(
        and(
          eq(components.pageId, pageId),
          eq(components.id, componentId),
          ne(components.name, 'ROOT'),
        ),
      )
      .returning({ id: components.id });
    // either component doesn't exist or tried to delete root of page
    if (c === undefined) {
      throw new BadRequestException();
    }
    return c;
  }

  /**
   * for now if user wants to update on field on the props the props object should be sent not only this field
   */
  async update(dto: UpdateComponentDb) {
    await this.db.update(components).set(dto);
  }

  async getTreeForPage(pageId: PageDto['id']): Promise<WebloomTree> {
    const comps = await this.db.execute(sql`
    WITH RECURSIVE rectree AS (
      -- anchor element
      SELECT id, name, parent_id as "parent", is_canvas as "isCanvas", props, type, col, row, rows_count as "rowsCount", columns_count as "columnsCount", 1 as level 
        FROM ${components}
       WHERE ${and(isNull(components.parent), eq(components.pageId, pageId))}
    UNION ALL 
    -- recursive
      SELECT t.id, t.name, t.parent_id as "parent", t.is_canvas as "isCanvas", t.props, t.type, t.col, t.row, t.rows_count as "rowsCount", t.columns_count as "columnsCount", (rectree.level + 1) as level
        FROM components as t
        JOIN rectree
          ON t.parent_id = rectree.id
    ) 
  SELECT * FROM rectree
  order by level;
    `);
    const rows = comps.rows as (ComponentDto & { level: number })[];
    const tree: WebloomTree = {};
    let rootId: string;
    rows.forEach((row) => {
      if (row.level === 1) {
        rootId = row.id.toString();
        tree['ROOT'] = {
          id: 'ROOT',
          name: row.name,
          nodes: [],
          parent: 'ROOT',
          isCanvas: true,
          props: row.props as WebloomNode['props'],
          type: row.type,
          col: row.col,
          row: row.row,
          columnsCount: row.columnsCount,
          rowsCount: row.rowsCount,
          columnWidth: 0,
        };
      } else {
        tree[row.id] = {
          id: row.level === 1 ? 'ROOT' : row.id.toString(),
          name: row.name,
          nodes: [],
          parent: row.parent?.toString() ?? 'ROOT',
          isCanvas: row.isCanvas ?? undefined,
          props: row.props as WebloomNode['props'],
          type: row.type,
          col: row.col,
          row: row.row,
          columnsCount: row.columnsCount,
          rowsCount: row.rowsCount,
        };
        // add children ids to parent
        const parentId = row.parent!.toString();
        tree[parentId === rootId ? 'ROOT' : parentId]['nodes'].push(
          row.id.toString(),
        );
      }
    });
    return tree;
  }
}
