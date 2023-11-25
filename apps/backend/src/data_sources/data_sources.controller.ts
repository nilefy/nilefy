import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DataSourcesService } from './data_sources.service';
import { JwtGuard } from '../auth/jwt.guard';
import {
  CreateDataSourceDto,
  DataSourceDto,
  createDataSourceSchema,
  availableDataSourcesInsert,
  dataSourceDb,
} from '../dto/data_sources.dto';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { ExpressAuthedRequest } from '../auth/auth.types';

@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/data-sources')
export class DataSourcesController {
  constructor(private dataSourceService: DataSourcesService) {}

  @Post('/:dataSourceId')
  async create(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: DataSourceDto['workspaceId'],
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: DataSourceDto['dataSourceId'],
    @Body(new ZodValidationPipe(createDataSourceSchema))
    createDataSourceDto: CreateDataSourceDto,
    @Req() req: ExpressAuthedRequest,
  ) {
    const { name, config } = createDataSourceDto;
    const jsonConfig: DataSourceDto['config'] = JSON.stringify(config);

    // TODO: check whether config matches the plugin requirements

    return await this.dataSourceService.create({
      name,
      workspaceId,
      dataSourceId,
      config: jsonConfig,
      createdById: req.user.userId,
    });
  }

  // TODO: another controller for global data sources
  @Post('')
  async add(
    @Body(new ZodValidationPipe(availableDataSourcesInsert))
    dataSource: dataSourceDb,
  ) {
    return await this.dataSourceService.add(dataSource);
  }
}
