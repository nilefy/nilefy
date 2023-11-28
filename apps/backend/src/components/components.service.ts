import { Injectable, Inject } from '@nestjs/common';
import {
  DatabaseI,
  DrizzleAsyncProvider,
  PgTrans,
} from '../drizzle/drizzle.provider';
import { PageDto } from '../dto/pages.dto';
import { WebloomNode, WebloomTree } from '../dto/apps.dto';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { components } from '../drizzle/schema/appsState.schema';
import { ComponentDto, CreateComponentDb } from '../dto/components.dto';

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

  // TODO: throw if user tried to delete root node
  async delete() {
    throw new Error('implement');
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
    rows.forEach((row) => {
      tree[row.id] = {
        id: row.id.toString(),
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
      if (row.level > 1) {
        tree[row.parent!.toString()]['nodes'].push(row.id.toString());
      }
    });
    return tree;
  }
}
