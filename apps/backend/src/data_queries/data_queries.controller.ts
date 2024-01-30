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
} from '../dto/data_queries.dto';
import { QueryRet } from './query.types';
import { WorkspaceDto } from '../dto/workspace.dto';

@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/apps/:appId/queries')
export class DataQueriesController {
  constructor(private dataQueriesService: DataQueriesService) {}

  @Post('run/:queryId')
  async runQuery(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WorkspaceDto['id'],
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
  async addQuery(
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
    @Param('dataSourceId', ParseIntPipe) dataSourceId: number,
  ): Promise<QueryDto[]> {
    return await this.dataQueriesService.deleteDataSourceQueries(dataSourceId);
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
