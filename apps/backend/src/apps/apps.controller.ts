import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
  Put,
} from '@nestjs/common';
import { AppsService } from './apps.service';
import {
  AppDto,
  CreateAppDto,
  UpdateAppDto,
  createAppSchema,
  updateAppSchema,
} from '../dto/apps.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { ExpressAuthedRequest } from '../auth/auth.types';

@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post()
  async create(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: AppDto['workspaceId'],
    @Body(new ZodValidationPipe(createAppSchema)) createAppDto: CreateAppDto,
  ) {
    return await this.appsService.create({
      createdById: req.user.userId,
      workspaceId,
      ...createAppDto,
    });
  }

  @Get()
  async findAll(
    @Param('workspaceId', ParseIntPipe) workspaceId: AppDto['workspaceId'],
  ) {
    return await this.appsService.findAll(workspaceId);
  }

  @Get(':appId')
  async findOne(
    @Param('workspaceId', ParseIntPipe) workspaceId: AppDto['workspaceId'],
    @Param('appId', ParseIntPipe) appId: AppDto['id'],
  ) {
    return await this.appsService.findOne(workspaceId, appId);
  }

  @Post(':id/clone')
  async clone(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: AppDto['workspaceId'],
    @Param('id', ParseIntPipe) appId: AppDto['id'],
  ) {
    return await this.appsService.clone({
      workspaceId,
      appId,
      createdById: req.user.userId,
    });
  }

  @Put(':id')
  async update(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: AppDto['workspaceId'],
    @Param('id', ParseIntPipe) appId: AppDto['id'],
    @Body(new ZodValidationPipe(updateAppSchema)) updateAppDto: UpdateAppDto,
  ) {
    return await this.appsService.update(workspaceId, appId, {
      updatedById: req.user.userId,
      ...updateAppDto,
    });
  }

  @Delete(':id')
  async delete(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: AppDto['workspaceId'],
    @Param('id', ParseIntPipe) appId: AppDto['id'],
  ) {
    return await this.appsService.delete({
      workspaceId,
      appId,
      deletedById: req.user.userId,
    });
  }
}
