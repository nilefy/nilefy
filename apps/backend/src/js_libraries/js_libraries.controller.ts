import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Body,
  Req,
  Get,
  Delete,
  Put,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { ExpressAuthedRequest } from '../auth/auth.types';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';

import {
  AddJsLibraryDto,
  addJsLibrarySchema,
  JsLibraryDto,
  UpdateJsLibraryDto,
  updateJsLibrarySchema,
} from 'src/dto/js_libraries.dto';
import { JsLibrariesService } from './js_libraries.service';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/apps/:appId/jsLibraries')
export class JsLibrariesController {
  constructor(private jsLibrariesService: JsLibrariesService) {}
  @Post('add')
  @ApiCreatedResponse({
    description: 'to create new js library in application',
    type: JsLibraryDto,
  })
  async add(
    @Param('appId', ParseIntPipe) appId: number,
    @Body(new ZodValidationPipe(addJsLibrarySchema)) query: AddJsLibraryDto,
    @Req() req: ExpressAuthedRequest,
  ): Promise<JsLibraryDto> {
    return await this.jsLibrariesService.create({
      ...query,
      createdById: req.user.userId,
      appId,
    });
  }

  @Get()
  @ApiCreatedResponse({
    description: 'get app js libraries',
    type: Array<JsLibraryDto>,
  })
  async getAppJsQueries(
    @Param('appId', ParseIntPipe) appId: number,
  ): Promise<JsLibraryDto[]> {
    return await this.jsLibrariesService.index(appId);
  }

  @Delete(':libraryId')
  @ApiCreatedResponse({
    description: 'delete app js library',
  })
  async deleteLibrary(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('libraryId') libraryId: string,
  ) {
    return await this.jsLibrariesService.delete(appId, libraryId);
  }

  @Put(':libraryId')
  @ApiCreatedResponse({
    description: 'update app js library',
    type: JsLibraryDto,
  })
  async updateLibrary(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('libraryId') libraryId: string,
    @Body(new ZodValidationPipe(updateJsLibrarySchema))
    query: UpdateJsLibraryDto,
    @Req() req: ExpressAuthedRequest,
  ) {
    return await this.jsLibrariesService.update({
      appId,
      jsLibraryId: libraryId,
      updatedById: req.user.userId,
      query,
    });
  }
}
