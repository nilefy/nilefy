import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
  ParseIntPipe,
  UsePipes,
} from '@nestjs/common';
import { TablecxService } from './tablecx.service';
import { TablecxDto, tablecxSchema } from '../dto/webloom_table.dto';
import { ZodValidationPipe } from '../pipes/zod.pipe';

@Controller('tables')
export class TablecxController {
  constructor(private readonly tablecxService: TablecxService) {}

  @Get(':id')
  async getAllDataByTableId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<object> {
    return await this.tablecxService.getAllDataByTableId(id);
  }

  // @Get(':userId')
  @Get()
  async getAllTablecxs(@Param('userId') userId: string): Promise<object> {
    if (userId === '') {
      return new BadRequestException('userId is required');
    }
    //! verify userId has access
    return await this.tablecxService.getAllTablecxs();
  }

  @Post('insert/:id')
  async insertDataByTableId(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: object,
  ): Promise<object> {
    return await this.tablecxService.insertDataByTableId(id, data);
  }

  @UsePipes(new ZodValidationPipe(tablecxSchema))
  @Post()
  async createTablecx(@Body() tablecx: TablecxDto): Promise<object> {
    return await this.tablecxService.createTablecx(tablecx);
  }

  @Delete(':id')
  async deleteTablecx(@Param('id', ParseIntPipe) id: number): Promise<object> {
    return await this.tablecxService.deleteTablecx(id);
  }
}
