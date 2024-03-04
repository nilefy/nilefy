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
  CreateAppRetDto,
  AppsRetDto,
  CreateAppDto,
  UpdateAppDto,
  createAppSchema,
  updateAppSchema,
  AppRetDto,
  AppDto,
} from '../dto/apps.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { ExpressAuthedRequest } from '../auth/auth.types';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'create app',
    type: CreateAppRetDto,
  })
  async create(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body(new ZodValidationPipe(createAppSchema)) createAppDto: CreateAppDto,
  ): Promise<CreateAppRetDto> {
    return await this.appsService.create({
      createdById: req.user.userId,
      workspaceId,
      ...createAppDto,
    });
  }

  @Get()
  @ApiCreatedResponse({
    description: 'get workspace apps',
    type: Array<AppsRetDto>,
  })
  async findAll(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ): Promise<AppsRetDto[]> {
    return await this.appsService.findAll(workspaceId);
  }

  @Get(':appId')
  @ApiCreatedResponse({
    description: 'get workspace app',
    type: AppRetDto,
  })
  async findOne(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('appId', ParseIntPipe) appId: number,
  ): Promise<AppRetDto> {
    return await this.appsService.findOne(workspaceId, appId);
  }

  @Post(':id/clone')
  @ApiCreatedResponse({
    description: 'clone app',
    type: CreateAppRetDto,
  })
  async clone(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) appId: number,
  ) {
    return await this.appsService.clone({
      workspaceId,
      appId,
      createdById: req.user.userId,
    });
  }

  @Put(':id')
  @ApiCreatedResponse({
    description: 'update workspace app',
    type: AppDto,
  })
  async update(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) appId: number,
    @Body(new ZodValidationPipe(updateAppSchema)) updateAppDto: UpdateAppDto,
  ): Promise<AppDto> {
    return await this.appsService.update(workspaceId, appId, {
      updatedById: req.user.userId,
      ...updateAppDto,
    });
  }

  @Delete(':id')
  @ApiCreatedResponse({
    description: 'delete workspace app',
    type: AppDto,
  })
  async delete(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) appId: number,
  ) {
    return await this.appsService.delete({
      workspaceId,
      appId,
      deletedById: req.user.userId,
    });
  }
}
