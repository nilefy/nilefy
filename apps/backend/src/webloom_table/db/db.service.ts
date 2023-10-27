import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DatabaseI,
  DrizzleAsyncProvider,
} from '../../drizzle/drizzle.provider';
import { webloomTables } from '../../drizzle/schema/schema';
import {
  eq,
  sql,
  // sql,
} from 'drizzle-orm';
import { WebloomTableDto } from '../../dto/webloom_table.dto';

@Injectable()
export class DbService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async getAllTablecxs() {
    const result = await this.db.query.webloomTables.findMany();
    if (!result) {
      throw new NotFoundException('Method not implemented.');
    }
    return result;
  }

  async createTablecx(tablecx: WebloomTableDto): Promise<WebloomTableDto> {
    const result = await this.db
      .insert(webloomTables)
      .values(tablecx)
      .returning();
    if (!result) {
      throw new NotFoundException('Method not implemented.');
    }
    const query = this._generateCreateTableQuery(tablecx);
    await this.db.execute(sql.raw(`${query}`));
    return result['0'] as WebloomTableDto;
  }

  async deleteTablecx(id: number): Promise<WebloomTableDto> {
    const result = await this.db
      .delete(webloomTables)
      .where(eq(webloomTables.id, id))
      .returning();
    if (!result) {
      throw new NotFoundException('Method not implemented.');
    }
    return result['0'] as WebloomTableDto;
  }

  async getAllDataByTableId(id: number): Promise<object> {
    const name = await this._getTableNameById(id);
    const { rows } = await this.db.execute(sql.raw(`SELECT * FROM ${name}`));
    return [...rows];
  }

  async insertDataByTableId(id: number, data: object): Promise<object> {
    const tables = await this.db
      .select()
      .from(webloomTables)
      .where(eq(webloomTables.id, id));
    if (tables.length === 0) {
      throw new NotFoundException('Method not implemented.');
    }
    const tableDefinition = validateAndConvertToTableDefinition(tables['0']);
    const { name } = tables[0];
    if (!tableDefinition) {
      throw new NotFoundException('Method not implemented.');
    }

    const isValid = isDataValid(tableDefinition, [data]);
    if (!isValid) {
      throw new NotFoundException('Method not implemented.');
    }
    console.log(tableDefinition.name);
    console.log(data);
    name;
    //todo : insert data into table
    //!!!!!! not done yet!!!!
    return await this.db.execute(sql.raw(``));
    // return await this.db.execute(sql.raw(query));
    // return new NotFoundException('Method not implemented.');
  }

  async _getTableNameById(id: number): Promise<string | null> {
    const res = await this.db
      .select()
      .from(webloomTables)
      .where(eq(webloomTables.id, id));
    // if res size is 0, throw not found exception
    if (res.length === 0) {
      throw new NotFoundException('this table id does not exist');
    }
    const { name } = res['0'];
    if (!name) {
      throw new NotFoundException('name not found');
      return null;
    }
    return name;
  }

  // helper method
  _generateCreateTableQuery(tableDefinition: WebloomTableDto): string {
    const { name, columns } = tableDefinition;

    if (!name || columns.length === 0) {
      throw new Error('Table name and columns must be provided.');
    }

    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${name} (
      id SERIAL PRIMARY KEY,
      ${columns.map((column) => `${column.name} ${column.type}`).join(',\n')}
    );`;

    return createTableQuery;
  }
}
interface TableDefinition {
  id: number;
  name: string;
  created_at: string;
  columns: Array<{ name: string; type: string }>;
}

interface DataRow {
  [key: string]: any;
}

function isDataValid(table: TableDefinition, data: DataRow[]): boolean {
  const columnNames = table.columns.map((column) => column.name);

  for (const row of data) {
    for (const columnName of columnNames) {
      if (!(columnName in row)) {
        console.log('h');
        console.log(`Missing field "${columnName}" in the inserted data.`);
        return false;
      }

      const expectedType = table.columns.find(
        (column) => column.name === columnName,
      )?.type;
      const actualValue = row[columnName];

      if (expectedType === 'boolean' && typeof actualValue !== 'boolean') {
        console.error(`Invalid value for "${columnName}": Expected boolean.`);
        return false;
      }

      if (
        expectedType === 'text' &&
        (typeof actualValue !== 'string' || actualValue === '')
      ) {
        console.error(
          `Invalid value for "${columnName}": Expected non-empty string.`,
        );
        return false;
      }
    }
  }

  // If all data passed validation, you can insert it into the database here
  // Replace this with your actual database insert code

  console.log('Data passed validation and can be inserted into the database.');
  return true;
}
function validateAndConvertToTableDefinition(
  data: any,
): TableDefinition | null {
  if (data && typeof data === 'object' && 'name' in data && 'columns' in data) {
    const { name, columns } = data;

    if (typeof name === 'string' && Array.isArray(columns)) {
      const validColumns = columns.every((column: any) => {
        return (
          typeof column === 'object' &&
          'name' in column &&
          'type' in column &&
          typeof column.name === 'string' &&
          typeof column.type === 'string'
        );
      });

      if (validColumns) {
        return {
          id: data.id || 0,
          name,
          created_at: data.created_at || '',
          columns,
        };
      }
    }
  }

  return null;
}
