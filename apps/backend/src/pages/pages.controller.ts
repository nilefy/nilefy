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
import { AppDto } from '../dto/apps.dto';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import {
  CreatePageDto,
  PageDto,
  UpdatePageDto,
  createPageSchema,
  updatePageSchema,
} from '../dto/pages.dto';

@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/apps/:appId/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  async create(
    @Req() req: ExpressAuthedRequest,
    @Param('appId', ParseIntPipe) appId: AppDto['id'],
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
    @Param('appId', ParseIntPipe) appId: AppDto['id'],
    @Param('pageId', ParseIntPipe) pageId: PageDto['id'],
  ) {
    return await this.pagesService.clone({
      appId,
      id: pageId,
      createdById: req.user.userId,
    });
  }

  @Get()
  async index(@Param('appId', ParseIntPipe) appId: AppDto['id']) {
    return await this.pagesService.index(appId);
  }

  @Get(':pageId')
  async findOne(
    @Param('appId', ParseIntPipe) appId: AppDto['id'],
    @Param('pageId', ParseIntPipe) pageId: PageDto['id'],
  ) {
    return await this.pagesService.findOne(appId, pageId);
  }

  @Put(':pageId')
  async update(
    @Req() req: ExpressAuthedRequest,
    @Param('appId', ParseIntPipe) appId: AppDto['id'],
    @Param('pageId', ParseIntPipe) pageId: PageDto['id'],
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
    @Param('appId', ParseIntPipe) appId: AppDto['id'],
    @Param('pageId', ParseIntPipe) pageId: PageDto['id'],
  ) {
    return await this.pagesService.delete({
      appId,
      pageId,
      deletedById: req.user.userId,
    });
  }
}
