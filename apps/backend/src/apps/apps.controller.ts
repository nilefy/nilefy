import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  Put,
  StreamableFile,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  Header,
  UseGuards,
  Query,
  Res,
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
  AppExportSchema,
} from '../dto/apps.dto';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { ExpressAuthedRequest } from '../auth/auth.types';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { Readable } from 'node:stream';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { JwtGuard } from '../auth/jwt.guard';
import { z } from 'zod';
import type { Response } from 'express';

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

  @Get('export/:appId')
  @Header('Content-Type', 'application/json')
  @ApiCreatedResponse({
    type: AppRetDto,
  })
  async exportOne(
    @Req() req: ExpressAuthedRequest,
    @Res({ passthrough: true }) res: Response,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('appId', ParseIntPipe) appId: number,
  ): Promise<StreamableFile> {
    const app = await this.appsService.exportAppJSON(
      req.user.userId,
      workspaceId,
      appId,
    );
    res.set({
      'Content-Disposition': `attachment; filename="${app.name}"`,
    });
    const appJson = JSON.stringify(app);

    const stream: Readable = Readable.from([appJson]);

    return new StreamableFile(stream);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importOne(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    // TODO: validate json file content
    const jsonData = JSON.parse(file.buffer.toString()) as AppExportSchema;

    return await this.appsService.importAppJSON(
      req.user.userId,
      workspaceId,
      jsonData,
    );
  }

  @Get(':appId')
  @ApiCreatedResponse({
    description: 'get workspace app',
    type: AppRetDto,
  })
  async findOne(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('appId', ParseIntPipe) appId: number,
    @Req() req: ExpressAuthedRequest,
    @Query('pageId', new ZodValidationPipe(z.coerce.number().optional()))
    pageId: number,
  ): Promise<AppRetDto> {
    return await this.appsService.findOne(
      req.user.userId,
      workspaceId,
      appId,
      pageId,
    );
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
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) appId: number,
  ) {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return await this.appsService.delete({
      workspaceId,
      appId,
    });
  }
}
