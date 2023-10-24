import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from './db/db.service';
import { TablecxDto } from '../dto/tablecx.dto';

@Injectable()
export class TablecxService {
  constructor(private readonly dbService: DbService) {}
  getAllTablecxs(): object {
    // validation logic here!
    return this.dbService.getAllTablecxs();
  }
  async createTablecx(tablecx: TablecxDto) {
    // validation logic here!
    // a little dubious to have 2 services but ok for now
    return await this.dbService.createTablecx(tablecx);
  }
  async deleteTablecx(id: number) {
    if (id < 1) {
      throw new BadRequestException('Tablecx id is required');
    }

    return await this.dbService.deleteTablecx(id);
  }
}
