import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  dataSourcesInsert,
  DataSourceDb,
  DataSourceDto,
  DataSourceP,
} from '../dto/data_sources.dto';
import { GlobalDataSourcesService } from './global_data_sources.service';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('data-sources/global')
export class GlobalDataSourcesController {
  constructor(private dataSourceService: GlobalDataSourcesService) {}

  @Post()
  async add(
    @Body(new ZodValidationPipe(dataSourcesInsert))
    dataSource: DataSourceDb,
  ): Promise<DataSourceDto> {
    return await this.dataSourceService.add(dataSource);
  }

  @Get()
  async getAll(): Promise<DataSourceP[]> {
    return await this.dataSourceService.getAll();
  }

  @Get(':id')
  async getOne(
    @Param('id', ParseIntPipe) dataSourceId: number,
  ): Promise<DataSourceDto> {
    return await this.dataSourceService.getOne(dataSourceId);
  }
}
