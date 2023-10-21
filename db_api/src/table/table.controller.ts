import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TableService } from './table.service';
import { Table } from './table.model';

@Controller('tables')
export class TableController {

  constructor(private readonly tableService: TableService) { };


  @Get(':userId')
  async getAllTables(  @Param('userId') userId: string ): Promise<{}> {
    //! verify userId has access
    return await this.tableService.getAllTables();
  }

  @Post()
  async createTable(@Body() table: Table): Promise<{}> {

    return await this.tableService.createTable(table);
  }

  @Delete(':id')
  async deleteTable(@Param('id') id: number): Promise<{}> {

    return await this.tableService.deleteTable(id);
  }
}
