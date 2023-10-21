import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { db } from './index';
import { Client } from 'pg';
import { Table } from 'src/table/table.model';
import { tables } from './schema';
import { eq } from 'drizzle-orm';
import { Column } from 'src/table/column.model';

@Injectable()
export class DbService {
  db: any;
  constructor() {
    this.db = db;
  }
  async getAllTables(): Promise<{}> {
    const result = await this.db.query.tables.findMany();
    if (!result) {
      throw new NotFoundException('Method not implemented.');
    }
    return { ...result };
  }
  async createTable(table: Table): Promise<{} | PromiseLike<{}>> {
    let res;

    if (!table.columns || table.columns.length === 0  ) {

      throw new NotAcceptableException('Columns are required');
    } else if (isNotArrayOfMyColumns(table.columns)) {




      // throw new NotAcceptableException('Columns must be an array of value defined Column');
    }
    if (table.name) {
const validate = ({ name, type }) => {
  return name && (type === "boolean" || type === "text");
};

      const isValid = table.columns.every(validate) ;
      if (!isValid) {
        throw new NotAcceptableException('Columns must have name and type');
       }
     res = await db.insert(tables).values(table).returning({ id: tables.id });

      // make a new table in the database based on the table object's columns, below
      const createTable = await this.db.cre;






      return res[0];
     }

    throw new Error('Method not implemented.');
  }

  async delete(id: number): Promise<{}> {
    if(id){
      return await db.delete(tables).where(eq(tables.id, id)).returning();
    }
  }
}

function isNotArrayOfMyColumns(json: any): json is Column[] {
  return !Array.isArray(json) || !json.every((item) => {
        for (const key in Column ) {
      if (typeof item[key] !== typeof Column[key]) {
        return false;
      }
    }
  });
}
