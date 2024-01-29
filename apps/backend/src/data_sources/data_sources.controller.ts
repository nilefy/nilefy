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
  WsDataSourceP,
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
    workspaceId: number,
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: number,
    @Body(new ZodValidationPipe(createWsDataSourceSchema))
    createDataSourceDto: CreateWsDataSourceDto,
    @Req() req: ExpressAuthedRequest,
  ): Promise<WsDataSourceDto> {
    return await this.dataSourceService.create({
      ...createDataSourceDto,
      workspaceId,
      dataSourceId,
      createdById: req.user.userId,
    });
  }

  @Get(':dataSourceId/all') // global data source id
  async getConnections(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: number,
  ): Promise<WsDataSourceDto[]> {
    return await this.dataSourceService.getConnections({
      workspaceId,
      dataSourceId,
    });
  }

  @Get(':dataSourceId')
  async getOne(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: number,
  ) {
    return await this.dataSourceService.getOne(workspaceId, dataSourceId);
  }

  @Get()
  async getWsDataSources(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
  ): Promise<WsDataSourceP[]> {
    return await this.dataSourceService.getWsDataSources(workspaceId);
  }

  @Delete(':dataSourceId/all') // global data source id
  async deleteConnections(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: number,
  ): Promise<WsDataSourceDto[]> {
    return await this.dataSourceService.deleteConnections({
      workspaceId,
      dataSourceId,
    });
  }

  @Delete(':dataSourceId')
  async deleteOne(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: number,
  ): Promise<WsDataSourceDto> {
    return await this.dataSourceService.deleteOne(workspaceId, dataSourceId);
  }

  @Put(':dataSourceId')
  async update(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: number,
    @Body(new ZodValidationPipe(updateWsDataSourceSchema))
    data: UpdateWsDataSourceDto,
    @Req() req: ExpressAuthedRequest,
  ): Promise<WsDataSourceDto> {
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
