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
  CreateAppDto,
  UpdateAppDto,
  createAppSchema,
  updateAppSchema,
} from '../dto/apps.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { ExpressAuthedRequest } from '../auth/auth.types';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post()
  async create(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body(new ZodValidationPipe(createAppSchema)) createAppDto: CreateAppDto,
  ) {
    return await this.appsService.create({
      createdById: req.user.userId,
      workspaceId,
      ...createAppDto,
    });
  }

  @Get()
  async findAll(@Param('workspaceId', ParseIntPipe) workspaceId: number) {
    return await this.appsService.findAll(workspaceId);
  }

  @Get(':id')
  async findOne(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) appId: number,
  ) {
    return await this.appsService.findOne(workspaceId, appId);
  }

  @Post(':id/clone')
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
  async update(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) appId: number,
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
