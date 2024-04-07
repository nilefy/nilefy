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
  CreatePageRetDto,
  PageDto,
  UpdatePageDto,
  createPageSchema,
  updatePageSchema,
} from '../dto/pages.dto';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/apps/:appId/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'create app page',
    type: CreatePageRetDto,
  })
  async create(
    @Req() req: ExpressAuthedRequest,
    @Param('appId', ParseIntPipe) appId: number,
    @Body(new ZodValidationPipe(createPageSchema)) pageDto: CreatePageDto,
  ): Promise<CreatePageRetDto> {
    return await this.pagesService.create({
      createdById: req.user.userId,
      appId,
      ...pageDto,
    });
  }

  @Post(':pageId/clone')
  @ApiCreatedResponse({
    description: 'clone app page',
    type: PageDto,
  })
  async clone(
    @Req() req: ExpressAuthedRequest,
    @Param('appId', ParseIntPipe) appId: number,
    @Param('pageId', ParseIntPipe) pageId: number,
  ): Promise<PageDto> {
    return await this.pagesService.clone({
      appId,
      id: pageId,
      createdById: req.user.userId,
    });
  }

  @Get()
  @ApiCreatedResponse({
    description: 'get app pages',
    type: Array<PageDto>,
  })
  async index(@Param('appId', ParseIntPipe) appId: number): Promise<PageDto[]> {
    return await this.pagesService.index(appId);
  }

  @Get(':pageId')
  @ApiCreatedResponse({
    description: 'get app page',
    type: CreatePageRetDto,
  })
  async findOne(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('pageId', ParseIntPipe) pageId: number,
  ): Promise<CreatePageRetDto> {
    return await this.pagesService.findOne(appId, pageId);
  }

  @Put(':pageId')
  @ApiCreatedResponse({
    description: 'update app page',
    type: Array<PageDto>,
  })
  async update(
    @Req() req: ExpressAuthedRequest,
    @Param('appId', ParseIntPipe) appId: number,
    @Param('pageId', ParseIntPipe) pageId: number,
    @Body(new ZodValidationPipe(updatePageSchema)) pageDto: UpdatePageDto,
  ): Promise<PageDto[]> {
    return await this.pagesService.update(appId, pageId, {
      updatedById: req.user.userId,
      ...pageDto,
    });
  }

  @Delete(':pageId')
  @ApiCreatedResponse({
    description: 'delete app page',
    type: Array<PageDto>,
  })
  async delete(
    @Req() req: ExpressAuthedRequest,
    @Param('appId', ParseIntPipe) appId: number,
    @Param('pageId', ParseIntPipe) pageId: number,
  ): Promise<PageDto[]> {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return await this.pagesService.delete({
      appId,
      pageId,
      deletedById: req.user.userId,
    });
  }
}
