import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Body,
  Req,
  Get,
  Delete,
  Put,
} from '@nestjs/common';
import { DataQueriesService } from './data_queries.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ExpressAuthedRequest } from '../auth/auth.types';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import {
  addQuerySchema,
  AddQueryDto,
  QueryDto,
  updateQuerySchema,
  UpdateQueryDto,
} from '../dto/data_queries.dto';
import { DataSourcesService } from '../data_sources/data_sources.service';
import { DataSourceConfigT } from '../dto/data_sources.dto';
import { QueryRet } from './query.types';

@UseGuards(JwtGuard)
@Controller(
  'workspaces/:workspaceId/apps/:appId/datasources/:dataSourceId/queries',
)
export class DataQueriesController {
  constructor(
    private dataQueriesService: DataQueriesService,
    private dataSourcesService: DataSourcesService,
  ) {}

  @Post('run')
  async runQuery(
    @Param('dataSourceId', ParseIntPipe) dataSourceId: number,
    @Body(new ZodValidationPipe(addQuerySchema)) query: AddQueryDto,
  ): Promise<QueryRet> {
    const ds = await this.dataSourcesService.getOne(dataSourceId);

    return await this.dataQueriesService.runQuery(
      ds.config as DataSourceConfigT,
      query,
      dataSourceId,
    );
  }

  @Post('add')
  async addQuery(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('dataSourceId', ParseIntPipe) dataSourceId: number,
    @Body(new ZodValidationPipe(addQuerySchema)) query: AddQueryDto,
    @Req() req: ExpressAuthedRequest,
  ): Promise<QueryDto> {
    const jsonQuery: QueryDto['query'] = JSON.stringify(query.query);

    return await this.dataQueriesService.addQuery({
      name: query.name,
      query: jsonQuery,
      dataSourceId,
      createdById: req.user.userId,
      appId,
    });
  }

  @Get()
  async getDataSourceQueries(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('dataSourceId', ParseIntPipe) dataSourceId: number,
  ): Promise<QueryDto[]> {
    return await this.dataQueriesService.getDataSourceQueries(
      dataSourceId,
      appId,
    );
  }

  @Get(':id')
  async getQuery(
    @Param('id', ParseIntPipe) queryId: number,
  ): Promise<QueryDto> {
    return await this.dataQueriesService.getQuery(queryId);
  }

  @Delete(':id')
  async deleteQuery(
    @Param('id', ParseIntPipe) queryId: number,
  ): Promise<QueryDto> {
    return await this.dataQueriesService.deleteQuery(queryId);
  }

  @Delete()
  async deleteDataSourceQueries(
    @Param('dataSourceId', ParseIntPipe) dataSourceId: number,
  ): Promise<QueryDto[]> {
    return await this.dataQueriesService.deleteDataSourceQueries(dataSourceId);
  }

  @Put(':id')
  async updateQuery(
    @Param('id', ParseIntPipe) queryId: number,
    @Body(new ZodValidationPipe(updateQuerySchema)) query: UpdateQueryDto,
    @Req() req: ExpressAuthedRequest,
  ): Promise<QueryDto> {
    return await this.dataQueriesService.updateQuery({
      queryId,
      updatedById: req.user.userId,
      query,
    });
  }
}
