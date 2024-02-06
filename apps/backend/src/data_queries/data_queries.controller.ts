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
  runQueryBody,
  RunQueryBody,
  deleteDatasourceQueriesSchema,
  DeleteDatasourceQueriesDto,
} from '../dto/data_queries.dto';
import { QueryRet } from './query.types';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/apps/:appId/queries')
export class DataQueriesController {
  constructor(private dataQueriesService: DataQueriesService) {}

  @Post('run/:queryId')
  @ApiCreatedResponse({
    description: 'query return type',
    type: QueryRet,
  })
  async runQuery(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Param('appId', ParseIntPipe) appId: number,
    @Param('queryId') queryId: string,
    // any query should send its evaluated config
    @Body(new ZodValidationPipe(runQueryBody)) query: RunQueryBody,
  ): Promise<QueryRet> {
    return await this.dataQueriesService.runQuery(
      workspaceId,
      appId,
      queryId,
      query.evaluatedConfig,
    );
  }

  @Post('add')
  @ApiCreatedResponse({
    description: 'to create new query in application',
    type: QueryDto,
  })
  async addQuery(
    @Param('workspaceId', ParseIntPipe)
    _workspaceId: number,
    @Param('appId', ParseIntPipe) appId: number,
    @Body(new ZodValidationPipe(addQuerySchema)) query: AddQueryDto,
    @Req() req: ExpressAuthedRequest,
  ): Promise<QueryDto> {
    return await this.dataQueriesService.addQuery({
      ...query,
      createdById: req.user.userId,
      appId,
    });
  }

  @Get()
  async getAppQueries(@Param('appId', ParseIntPipe) appId: number) {
    return await this.dataQueriesService.getAppQueries(appId);
  }

  @Get(':queryId')
  async getQuery(
    @Param('queryId') queryId: string,
    @Param('appId', ParseIntPipe) appId: number,
  ): Promise<QueryDto> {
    return await this.dataQueriesService.getQuery(appId, queryId);
  }

  @Delete(':queryId')
  async deleteQuery(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('queryId') queryId: string,
  ) {
    return await this.dataQueriesService.deleteQuery(appId, queryId);
  }

  @Delete()
  async deleteDataSourceQueries(
    @Body(deleteDatasourceQueriesSchema)
    body: DeleteDatasourceQueriesDto,
  ): Promise<QueryDto[]> {
    return await this.dataQueriesService.deleteDataSourceQueries(
      body.dataSourceId,
    );
  }

  @Put(':queryId')
  async updateQuery(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('queryId') queryId: string,
    @Body(new ZodValidationPipe(updateQuerySchema)) query: UpdateQueryDto,
    @Req() req: ExpressAuthedRequest,
  ) {
    return await this.dataQueriesService.updateQuery({
      appId,
      queryId,
      updatedById: req.user.userId,
      query,
    });
  }
}
