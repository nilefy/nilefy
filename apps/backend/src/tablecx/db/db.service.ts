import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseI, DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { Tablecx } from '../tablecx.model';
import { tablescx } from 'src/drizzle/schema/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class DbService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async getAllTables(): Promise<object> {
    const result = await this.db.query.tablescx.findMany();
    if (!result) {
      throw new NotFoundException('Method not implemented.');
    }
    return { ...result };
  }

  async createTablecx(tablecx: Tablecx): Promise<object> {
    const result = this.db.insert(tablescx).values(tablecx);
    if (!result) {
      throw new NotFoundException('Method not implemented.');
    }
    return { ...result };
  }

  async deleteTablecx(id: number): Promise<object> {
    const result = this.db.delete(tablescx).where(eq(tablescx.id, id));
    if (!result) {
      throw new NotFoundException('Method not implemented.');
    }
    return { ...result };
  }
}
