import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { TablecxService } from './tablecx.service';
import { TablecxDto } from 'src/dto/tablecx.dto';

@Controller('tablecxs')
export class TablecxController {
  constructor(private readonly tablecxService: TablecxService) {}

  @Get(':userId')
  async getAllTablecxs(@Param('userId') userId: string): Promise<object> {
    if (userId === '') {
      return new BadRequestException('userId is required');
    }
    //! verify userId has access
    return await this.tablecxService.getAllTablecxs();
  }

  @Post()
  async createTablecx(@Body() tablecx: TablecxDto): Promise<object> {
    return await this.tablecxService.createTablecx(tablecx);
  }

  @Delete(':id')
  async deleteTablecx(@Param('id', ParseIntPipe) id: number): Promise<object> {
    return await this.tablecxService.deleteTablecx(id);
  }
}
