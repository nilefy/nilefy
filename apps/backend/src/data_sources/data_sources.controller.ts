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
  DataSourceConnectionDto,
  WsDataSourcesDto,
} from '../dto/data_sources.dto';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { ExpressAuthedRequest } from '../auth/auth.types';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { TestConnectionT } from '../data_queries/query.interface';
import z from 'zod';
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/data-sources')
export class DataSourcesController {
  constructor(private dataSourceService: DataSourcesService) {}

  @Post(':dataSourceId/testConnection') // ws data source id
  @ApiCreatedResponse({
    description: 'test data source connection if the plugin supports it',
  })
  async testConnection(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: number,
    @Body(
      new ZodValidationPipe(
        z.object({
          config: z.record(z.unknown()),
        }),
      ),
    )
    data: { config: Record<string, unknown> },
  ): TestConnectionT {
    return this.dataSourceService.testConnection(
      {
        workspaceId,
        dataSourceId,
      },
      data.config,
    );
  }

  @Post(':dataSourceId') // global data source id
  @ApiCreatedResponse({
    description: 'add data source to workspace',
    type: WsDataSourceDto,
  })
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
  @ApiCreatedResponse({
    description: 'get data source connections',
    type: Array<WsDataSourceDto>,
  })
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
  @ApiCreatedResponse({
    description: 'get data source connection',
    type: DataSourceConnectionDto,
  })
  async getOne(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: number,
  ): Promise<DataSourceConnectionDto> {
    return await this.dataSourceService.getOne(workspaceId, dataSourceId);
  }

  @Get()
  @ApiCreatedResponse({
    description: 'get workspace data sources',
    type: Array<WsDataSourcesDto>,
  })
  async getWsDataSources(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
  ): Promise<WsDataSourcesDto[]> {
    return await this.dataSourceService.getWsDataSources(workspaceId);
  }

  @Delete(':dataSourceId/all') // global data source id
  @ApiCreatedResponse({
    description: 'delete data source connections',
    type: Array<WsDataSourceDto>,
  })
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
  @ApiCreatedResponse({
    description: 'delete data source connection',
    type: WsDataSourceDto,
  })
  async deleteOne(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Param('dataSourceId', ParseIntPipe)
    dataSourceId: number,
  ): Promise<WsDataSourceDto> {
    return await this.dataSourceService.deleteOne(workspaceId, dataSourceId);
  }

  @Put(':dataSourceId')
  @ApiCreatedResponse({
    description: 'update data source',
    type: WsDataSourceDto,
  })
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
