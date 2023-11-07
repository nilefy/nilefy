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
import {
  PermissionsGuard,
  RequiredPermissions,
} from '../auth/permissions.guard';

@UseGuards(JwtGuard, PermissionsGuard)
@Controller('workspaces/:workspaceId/apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @RequiredPermissions('Apps-Write')
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

  @RequiredPermissions('Apps-Read')
  @Get()
  async findAll(
    @Param('workspaceId', ParseIntPipe) workspaceId: AppDto['workspaceId'],
  ) {
    return await this.appsService.findAll(workspaceId);
  }

  @RequiredPermissions('Apps-Read')
  @Get(':id')
  async findOne(
    @Param('workspaceId', ParseIntPipe) workspaceId: AppDto['workspaceId'],
    @Param('id', ParseIntPipe) appId: AppDto['id'],
  ) {
    return await this.appsService.findOne(workspaceId, appId);
  }

  @RequiredPermissions('Apps-Write')
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

  @RequiredPermissions('Apps-Delete')
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
