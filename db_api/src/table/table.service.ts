import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { Table } from './table.model';

@Injectable()
export class TableService {
  constructor(private readonly dbService: DbService  ) { }
  getAllTables(): {} {
    // validation logic here!
    return this.dbService.getAllTables()  ;
  }
  createTable(table: Table): {} | PromiseLike<{}> {

    // validation logic here!
    // a little dubious to have 2 services but ok for now
    if (!table.name) {
      throw new BadRequestException('Table name is required');
    }
    return this.dbService.createTable(table);
  }
  async deleteTable(id: number): Promise<{}> {
    if (id < 1) {
      throw new BadRequestException('Table id is required');
     }

    return await this.dbService.delete( id  );


  }
}
