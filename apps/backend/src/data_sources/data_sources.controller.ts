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

  @Post(':dataSourceId') // global data source id
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

  @Get(':dataSourceId') // global data source id
  async getConnections(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WsDataSourceDto['workspaceId'],
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: WsDataSourceDto['dataSourceId'],
  ): Promise<WsDataSourceDto[]> {
    return await this.dataSourceService.getConnections({
      workspaceId,
      dataSourceId,
    });
  }

  @Get(':dataSourceId')
  async getOne(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WsDataSourceDto['workspaceId'],
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: WsDataSourceDto['id'],
  ) {
    return await this.dataSourceService.getOne(workspaceId, dataSourceId);
  }

  @Get()
  async getWsDataSources(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WsDataSourceDto['workspaceId'],
  ) {
    return await this.dataSourceService.getWsDataSources(workspaceId);
  }

  // @Delete(':dataSourceId') // global data source id
  // async deleteConnections(
  //   @Param('workspaceId', ParseIntPipe)
  //   workspaceId: WsDataSourceDto['workspaceId'],
  //   @Param('dataSourceId', ParseIntPipe)
  //   dataSourceId: WsDataSourceDto['dataSourceId'],
  //   @Req() req: ExpressAuthedRequest,
  // ): Promise<WsDataSourceDto[]> {
  //   return await this.dataSourceService.deleteConnections({
  //     deletedById: req.user.userId,
  //     workspaceId,
  //     dataSourceId,
  //   });
  // }
  // @Delete(':dataSourceId')
  // async deleteAll(
  //   @Param('workspaceId', ParseIntPipe)
  //   workspaceId: WsDataSourceDto['workspaceId'],
  //   @Param('dataSourceId', ParseIntPipe)
  //   dataSourceId: WsDataSourceDto['dataSourceId'],
  //   @Req() req: ExpressAuthedRequest,
  // ): Promise<WsDataSourceDto[]> {
  //   return await this.dataSourceService.deleteAll(req.user.userId, {
  //     workspaceId,
  //     dataSourceId,
  //   });
  // }

  @Delete(':dataSourceId')
  async deleteOne(
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: WsDataSourceDto['id'],
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WsDataSourceDto['workspaceId'],
    @Req() req: ExpressAuthedRequest,
  ): Promise<WsDataSourceDto> {
    return await this.dataSourceService.deleteOne({
      deletedById: req.user.userId,
      dataSourceId,
      workspaceId,
    });
  }

  @Put(':dataSourceId')
  async update(
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: WsDataSourceDto['id'],
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WsDataSourceDto['workspaceId'],
    @Body(new ZodValidationPipe(updateWsDataSourceSchema))
    data: UpdateWsDataSourceDto,
    @Req() req: ExpressAuthedRequest,
  ) {
    return this.dataSourceService.update(
      {
        workspaceId,
        dataSourceId,
        updatedById: req.user.userId,
      },
      data,
    );
  }
}
