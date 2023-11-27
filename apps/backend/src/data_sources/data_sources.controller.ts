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
  CreateWsDataSourceDto,
  WsDataSourceDto,
  createWsDataSourceSchema,
  dataSourcesInsert,
  DataSourceDb,
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
    workspaceId: WsDataSourceDto['workspaceId'],
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: WsDataSourceDto['dataSourceId'],
    @Body(new ZodValidationPipe(createWsDataSourceSchema))
    createDataSourceDto: CreateWsDataSourceDto,
    @Req() req: ExpressAuthedRequest,
  ) {
    const { name, config } = createDataSourceDto;
    const jsonConfig: WsDataSourceDto['config'] = JSON.stringify(config);

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
    @Body(new ZodValidationPipe(dataSourcesInsert))
    dataSource: DataSourceDb,
  ) {
    return await this.dataSourceService.add(dataSource);
  }
}
