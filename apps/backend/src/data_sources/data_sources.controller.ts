import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Req,
  Get,
  Delete,
  Put,
} from '@nestjs/common';
import { DataSourcesService } from './data_sources.service';
import { JwtGuard } from '../auth/jwt.guard';
import {
  CreateWsDataSourceDto,
  WsDataSourceDto,
  createWsDataSourceSchema,
  updateWsDataSourceSchema,
  UpdateWsDataSourceDto,
} from '../dto/data_sources.dto';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { ExpressAuthedRequest } from '../auth/auth.types';

@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/data-sources')
export class DataSourcesController {
  constructor(private dataSourceService: DataSourcesService) {}

  @Post(':dataSourceId')
  async create(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WsDataSourceDto['workspaceId'],
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: WsDataSourceDto['dataSourceId'],
    @Body(new ZodValidationPipe(createWsDataSourceSchema))
    createDataSourceDto: CreateWsDataSourceDto,
    @Req() req: ExpressAuthedRequest,
  ): Promise<WsDataSourceDto> {
    const { name, config } = createDataSourceDto;
    const jsonConfig: WsDataSourceDto['config'] = JSON.stringify(config);

    return await this.dataSourceService.create({
      name,
      workspaceId,
      dataSourceId,
      config: jsonConfig,
      createdById: req.user.userId,
    });
  }

  @Get(':dataSourceId')
  async get(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WsDataSourceDto['workspaceId'],
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: WsDataSourceDto['dataSourceId'],
  ): Promise<WsDataSourceDto[]> {
    return await this.dataSourceService.get({ workspaceId, dataSourceId });
  }

  @Get()
  async getWsDataSources(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WsDataSourceDto['workspaceId'],
  ): Promise<WsDataSourceDto[]> {
    return await this.dataSourceService.getWsDataSources(workspaceId);
  }

  @Delete(':dataSourceId')
  async deleteAll(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WsDataSourceDto['workspaceId'],
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: WsDataSourceDto['dataSourceId'],
    @Req() req: ExpressAuthedRequest,
  ): Promise<WsDataSourceDto[]> {
    return await this.dataSourceService.deleteAll(req.user.userId, {
      workspaceId,
      dataSourceId,
    });
  }

  @Delete(':dataSourceId/:dataSourceName')
  async deleteOne(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WsDataSourceDto['workspaceId'],
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: WsDataSourceDto['dataSourceId'],
    @Param('dataSourceName')
    dataSourceName: WsDataSourceDto['name'],
    @Req() req: ExpressAuthedRequest,
  ): Promise<WsDataSourceDto> {
    return await this.dataSourceService.deleteOne(req.user.userId, {
      workspaceId,
      dataSourceId,
      name: dataSourceName,
    });
  }

  @Put(':dataSourceId/:dataSourceName')
  async update(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WsDataSourceDto['workspaceId'],
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: WsDataSourceDto['dataSourceId'],
    @Param('dataSourceName')
    dataSourceName: WsDataSourceDto['name'],
    @Body(new ZodValidationPipe(updateWsDataSourceSchema))
    data: UpdateWsDataSourceDto,
    @Req() req: ExpressAuthedRequest,
  ) {
    return this.dataSourceService.update(
      {
        workspaceId,
        dataSourceId,
        dataSourceName,
        updatedById: req.user.userId,
      },
      data,
    );
  }
}
