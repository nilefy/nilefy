import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InsertWebloomColumnDb,
  InsertWebloomColumnDto,
  InsertWebloomTableDb,
  WebloomColumnDto,
  WebloomTableDto,
} from '../dto/webloom_table.dto';
import { WorkspaceDto } from '../dto/workspace.dto';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { and, eq, sql } from 'drizzle-orm';
import * as schema from '@nilefy/database';

@Injectable()
export class WebloomDbService {
  constructor(@Inject(DrizzleAsyncProvider) private db: schema.DatabaseI) {}

  async index(workspaceId: WorkspaceDto['id']): Promise<WebloomTableDto[]> {
    return await this.db.query.webloomTables.findMany({
      where: eq(schema.webloomTables.workspaceId, workspaceId),
    });
  }

  private getTableActualName(
    name: WebloomTableDto['name'],
    id: WebloomTableDto['id'],
  ): string {
    return `${name}_${id}`;
  }

  /**
   * find table with its data
   */
  async findOne(
    workspaceId: WorkspaceDto['id'],
    tableId: WebloomTableDto['id'],
  ): Promise<
    WebloomTableDto & {
      columns: WebloomColumnDto[];
      data: Record<string, unknown>[];
    }
  > {
    const table = await this.db.query.webloomTables.findFirst({
      where: and(
        eq(schema.webloomTables.id, tableId),
        eq(schema.webloomTables.workspaceId, workspaceId),
      ),
      with: {
        columns: true,
      },
    });
    if (!table) {
      throw new NotFoundException('this table id does not exist');
    }

    const { rows } = await this.db.execute(
      sql.raw(`SELECT * FROM ${this.getTableActualName(table.name, table.id)}`),
    );
    return {
      ...table,
      data: rows,
    };
  }

  async create(
    tableDto: InsertWebloomTableDb & { columns: InsertWebloomColumnDto[] },
  ): Promise<
    WebloomTableDto & {
      columns: WebloomColumnDto[];
      data: Record<string, unknown>[];
    }
  > {
    return await this.db.transaction(async (trx) => {
      const temp = (
        await trx.insert(schema.webloomTables).values(tableDto).returning()
      )[0];
      const colValues: InsertWebloomColumnDb[] = tableDto.columns.map(
        (column) => {
          return {
            name: column.name,
            type: column.type,
            tableId: temp.id,
          };
        },
      );
      const cols = await trx
        .insert(schema.webloomColumns)
        .values(colValues)
        .returning();
      await trx.execute(
        sql.raw(
          `CREATE TABLE ${this.getTableActualName(temp.name, temp.id)} (${cols
            .map((column) => `${column.name} ${column.type}`)
            .join(',\n')});`,
        ),
      );
      return {
        ...temp,
        columns: cols,
        data: [],
      };
    });
  }

  async delete(
    workspaceId: WorkspaceDto['id'],
    tableId: WebloomTableDto['id'],
  ): Promise<WebloomTableDto & { columns: WebloomColumnDto[] }> {
    return await this.db.transaction(async (trx) => {
      const temp = (
        await trx
          .delete(schema.webloomTables)
          .where(
            and(
              eq(schema.webloomTables.id, tableId),
              eq(schema.webloomTables.workspaceId, workspaceId),
            ),
          )
          .returning()
      )[0];
      if (!temp) {
        throw new NotFoundException('table is not found in this workspace');
      }

      const cols = await trx
        .delete(schema.webloomColumns)
        .where(eq(schema.webloomColumns.tableId, temp.id))
        .returning();
      await trx.execute(
        sql.raw(`DROP TABLE ${this.getTableActualName(temp.name, temp.id)}`),
      );
      return {
        ...temp,
        columns: cols,
      };
    });
  }

  /**
   * note only return new inserted data
   */
  async insertDataByTableId(
    workspaceId: WorkspaceDto['id'],
    tableId: WebloomTableDto['id'],
    data: Record<string, unknown>[],
  ): Promise<{
    data: Record<string, unknown>[];
  }> {
    const table = await this.db.query.webloomTables.findFirst({
      where: and(
        eq(schema.webloomTables.id, tableId),
        eq(schema.webloomTables.workspaceId, workspaceId),
      ),
    });
    if (!table) {
      throw new NotFoundException('Table doesn t exist');
    }
    const idArray = [];
    const values = [];
    const columns = await this.db.query.webloomColumns.findMany({
      where: eq(schema.webloomColumns.tableId, tableId),
    });
    if (columns.length === 0) {
      throw new NotFoundException('No columns!');
    }
    for (const item of columns) {
      idArray.push(item['name']);
    }
    for (const i of data) {
      const vs = [];
      for (const id of idArray) {
        if (!(id in i)) {
          throw new BadRequestException('Invalid data.');
        }
        vs.push(i[id]);
      }
      values.push(vs);
    }

    const columnNames = idArray.join(', ');
    const valueRow = values
      .map(
        (v) =>
          `(${v
            .map((v) => (typeof v === 'number' ? v : `'${v}'`))
            .join(', ')})`,
      )
      .join(', ');

    const query = `INSERT INTO ${this.getTableActualName(
      table.name,
      table.id,
    )} (${columnNames}) VALUES ${valueRow};`;
    await this.db.execute(sql.raw(query));
    return { data };
  }
}
