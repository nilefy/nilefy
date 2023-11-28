import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common';
import { DataQueriesService } from './data_queries.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ExpressAuthedRequest } from '../auth/auth.types';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { runQuerySchema, RunQueryDto } from '../dto/data_queries.dto';

@UseGuards(JwtGuard)
@Controller('queries/:workspaceId/:appId/')
export class DataQueriesController {
  constructor(private dataQueriesService: DataQueriesService) {}

  @Post('run/:operation')
  async runQuery(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('appId', ParseIntPipe) appId: number,
    @Param('operation') operation: string,
    @Body(new ZodValidationPipe(runQuerySchema)) runQueryDto: RunQueryDto,
    @Req() req: ExpressAuthedRequest,
  ) {
    this.dataQueriesService.runQuery(operation, {
      ...runQueryDto,
      // workspaceId, // quick fix for now.
      appId,
      userId: req.user.userId,
    });
  }
}
