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
import { JwtGuard } from '../auth/jwt.guard';
import { ExpressAuthedRequest } from '../auth/auth.types';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { JsQueriesService } from './js_queries.service';
import {
  AddJsQueryDto,
  JsQueryDto,
  UpdateJsQueryDto,
  addJsQuerySchema,
  updateJsQuerySchema,
} from '../dto/js_queries.dto';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/apps/:appId/jsQueries')
export class JsQueriesController {
  constructor(private jsQueriesService: JsQueriesService) {}

  @Post('add')
  @ApiCreatedResponse({
    description: 'to create new js query in application',
    type: JsQueryDto,
  })
  async add(
    @Param('appId', ParseIntPipe) appId: number,
    @Body(new ZodValidationPipe(addJsQuerySchema)) query: AddJsQueryDto,
    @Req() req: ExpressAuthedRequest,
  ): Promise<JsQueryDto> {
    return await this.jsQueriesService.create({
      ...query,
      createdById: req.user.userId,
      appId,
    });
  }

  @Get()
  @ApiCreatedResponse({
    description: 'get app js queries',
    type: Array<JsQueryDto>,
  })
  async getAppJsQueries(
    @Param('appId', ParseIntPipe) appId: number,
  ): Promise<JsQueryDto[]> {
    return await this.jsQueriesService.index(appId);
  }

  @Delete(':queryId')
  @ApiCreatedResponse({
    description: 'delete app js query',
  })
  async deleteQuery(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('queryId') queryId: string,
  ) {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return await this.jsQueriesService.delete(appId, queryId);
  }

  @Put(':queryId')
  @ApiCreatedResponse({
    description: 'update app js query',
    type: JsQueryDto,
  })
  async updateQuery(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('queryId') queryId: string,
    @Body(new ZodValidationPipe(updateJsQuerySchema)) query: UpdateJsQueryDto,
    @Req() req: ExpressAuthedRequest,
  ) {
    return await this.jsQueriesService.update({
      appId,
      jsQueryId: queryId,
      updatedById: req.user.userId,
      query,
    });
  }
}
