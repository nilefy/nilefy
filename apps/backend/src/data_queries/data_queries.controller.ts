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
} from '@nestjs/common';
import { DataQueriesService } from './data_queries.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ExpressAuthedRequest } from '../auth/auth.types';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { addQuerySchema, AddQueryDto, QueryDto } from '../dto/data_queries.dto';
import { DataSourcesService } from '../data_sources/data_sources.service';
import { DataSourceConfigT } from '../dto/data_sources.dto';
import { QueryRet } from './query.types';

@UseGuards(JwtGuard)
@Controller(
  'workspaces/:workspaceId/apps/:appId/datasources/:dataSourceId/:dataSourceName/queries',
)
export class DataQueriesController {
  constructor(
    private dataQueriesService: DataQueriesService,
    private dataSourcesService: DataSourcesService,
  ) {}

  @Post('run')
  async runQuery(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('appId', ParseIntPipe) appId: number,
    @Param('dataSourceId', ParseIntPipe) dataSourceId: number,
    @Param('dataSourceName') name: string,
    @Body(new ZodValidationPipe(addQuerySchema)) query: AddQueryDto,
    @Req() req: ExpressAuthedRequest,
  ): Promise<QueryRet> {
    const ds = (
      await this.dataSourcesService.get({ workspaceId, dataSourceId, name })
    )[0];

    return await this.dataQueriesService.runQuery(
      ds.config as DataSourceConfigT,
      {
        ...query,
        dataSourceId: ds.id,
        userId: req.user.userId,
        appId,
      },
      dataSourceId,
    );
  }

  @Post('add')
  async addQuery(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('appId', ParseIntPipe) appId: number,
    @Param('dataSourceId', ParseIntPipe) dataSourceId: number,
    @Param('dataSourceName') name: string,
    @Body(new ZodValidationPipe(addQuerySchema)) query: AddQueryDto,
    @Req() req: ExpressAuthedRequest,
  ): Promise<QueryDto> {
    const ds = (
      await this.dataSourcesService.get({ workspaceId, dataSourceId, name })
    )[0];

    return await this.dataQueriesService.addQuery({
      ...query,
      dataSourceId: ds.id,
      userId: req.user.userId,
      appId,
    });
  }

  @Get()
  async getAppQueries(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('appId', ParseIntPipe) appId: number,
    @Param('dataSourceId', ParseIntPipe) dataSourceId: number,
    @Param('dataSourceName') name: string,
  ): Promise<QueryDto[]> {
    const ds = (
      await this.dataSourcesService.get({ workspaceId, dataSourceId, name })
    )[0]?.id;

    return await this.dataQueriesService.getAppQueries(ds, appId);
  }

  @Get(':id')
  async getQuery(
    @Param('id', ParseIntPipe) queryId: number,
  ): Promise<QueryDto | undefined> {
    return await this.dataQueriesService.getQuery(queryId);
  }

  @Delete(':id')
  async deleteQuery(
    @Param('id', ParseIntPipe) queryId: number,
  ): Promise<QueryDto | undefined> {
    return await this.dataQueriesService.deleteQuery(queryId);
  }
}
