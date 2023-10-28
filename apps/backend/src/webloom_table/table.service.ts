import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from './db/db.table.service';
import { WebloomTableDto } from '../dto/webloom_table.dto';

@Injectable()
export class TablecxService {
  constructor(private readonly dbService: DbService) {}
  getAllTablecxs(): object {
    // validation logic here!
    return this.dbService.getAllTables();
  }
  async createTablecx(tablecx: WebloomTableDto) {
    // validation logic here!
    // a little dubious to have 2 services but ok for now
    return await this.dbService.createTable(tablecx);
  }
  async deleteTablecx(id: number) {
    if (id < 1) {
      throw new BadRequestException('Tablecx id is required');
    }

    return await this.dbService.deleteTablecx(id);
  }
  getAllDataByTableId(id: number): object | PromiseLike<object> {
    if (id < 1) {
      throw new Error('Method not implemented.');
    }
    return this.dbService.getAllDataByTableId(id);
  }

  insertDataByTableId(id: number, data: object): object | PromiseLike<object> {
    return this.dbService.insertDataByTableId(id, data);
  }
}
