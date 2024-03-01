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
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('data-sources/global')
export class GlobalDataSourcesController {
  constructor(private dataSourceService: GlobalDataSourcesService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'add global data source',
    type: DataSourceDto,
  })
  async add(
    @Body(new ZodValidationPipe(dataSourcesInsert))
    dataSource: DataSourceDb,
  ): Promise<DataSourceDto> {
    return await this.dataSourceService.add(dataSource);
  }

  @Get()
  @ApiCreatedResponse({
    description: 'get global data sources',
    type: Array<DataSourceP>,
  })
  async getAll(): Promise<DataSourceP[]> {
    return await this.dataSourceService.getAll();
  }

  @Get(':id')
  @ApiCreatedResponse({
    description: 'get global data source',
    type: DataSourceDto,
  })
  async getOne(
    @Param('id', ParseIntPipe) dataSourceId: number,
  ): Promise<DataSourceDto> {
    return await this.dataSourceService.getOne(dataSourceId);
  }
}
