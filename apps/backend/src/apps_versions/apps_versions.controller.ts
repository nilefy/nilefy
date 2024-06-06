import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { AppsVersionsService } from './apps_versions.service';
import { ExpressAuthedRequest } from '../auth/auth.types';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import {
  CreateAppVersionDto,
  createAppVersionSchema,
} from '../dto/apps_versions.dto';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/apps/:appId/versions')
export class AppsVersionsController {
  constructor(private readonly appsVersionsService: AppsVersionsService) {}
  /**
   * create
   * read
   * update
   * delete
   * export
   * import
   * app versions
   */

  @Post()
  @ApiCreatedResponse({
    description: 'create app version',
    // type: CreateAppVersionRet,
  })
  async create(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('appId', ParseIntPipe) appId: number,
    @Body(new ZodValidationPipe(createAppVersionSchema))
    createAppVersionDto: CreateAppVersionDto,
  ) {
    return await this.appsVersionsService.create(
      {
        createdById: req.user.userId,
        appId,
        workspaceId,
      },
      createAppVersionDto,
    );
  }
}
