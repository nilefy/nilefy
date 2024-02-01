import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ExpressAuthedRequest } from '../auth/auth.types';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import {
  CreatePageDto,
  UpdatePageDto,
  createPageSchema,
  updatePageSchema,
} from '../dto/pages.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/apps/:appId/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  async create(
    @Req() req: ExpressAuthedRequest,
    @Param('appId', ParseIntPipe) appId: number,
    @Body(new ZodValidationPipe(createPageSchema)) pageDto: CreatePageDto,
  ) {
    return await this.pagesService.create({
      createdById: req.user.userId,
      appId,
      ...pageDto,
    });
  }

  @Post(':pageId/clone')
  async clone(
    @Req() req: ExpressAuthedRequest,
    @Param('appId', ParseIntPipe) appId: number,
    @Param('pageId', ParseIntPipe) pageId: number,
  ) {
    return await this.pagesService.clone({
      appId,
      id: pageId,
      createdById: req.user.userId,
    });
  }

  @Get()
  async index(@Param('appId', ParseIntPipe) appId: number) {
    return await this.pagesService.index(appId);
  }

  @Get(':pageId')
  async findOne(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('pageId', ParseIntPipe) pageId: number,
  ) {
    return await this.pagesService.findOne(appId, pageId);
  }

  @Put(':pageId')
  async update(
    @Req() req: ExpressAuthedRequest,
    @Param('appId', ParseIntPipe) appId: number,
    @Param('pageId', ParseIntPipe) pageId: number,
    @Body(new ZodValidationPipe(updatePageSchema)) pageDto: UpdatePageDto,
  ) {
    return await this.pagesService.update(appId, pageId, {
      updatedById: req.user.userId,
      ...pageDto,
    });
  }

  @Delete(':pageId')
  async delete(
    @Req() req: ExpressAuthedRequest,
    @Param('appId', ParseIntPipe) appId: number,
    @Param('pageId', ParseIntPipe) pageId: number,
  ) {
    return await this.pagesService.delete({
      appId,
      pageId,
      deletedById: req.user.userId,
    });
  }
}
