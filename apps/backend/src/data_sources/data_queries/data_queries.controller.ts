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
import { JwtGuard } from 'src/auth/jwt.guard';
import { ExpressAuthedRequest } from 'src/auth/auth.types';
import { ZodValidationPipe } from 'src/pipes/zod.pipe';
import { runQuerySchema, RunQueryDto } from './data_queries.dto';

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
      workspaceId,
      appId,
      userId: req.user.userId,
    });
  }
}
