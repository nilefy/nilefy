import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  // Res,
  // Response,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import {
  WorkspaceDto,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  UpdateWorkspaceDto,
  CreateWorkspaceDto,
} from '../dto/workspace.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { ExpressAuthedRequest } from '../auth/auth.types';
import { Readable } from 'node:stream';
import { FileInterceptor, MulterModule } from '@nestjs/platform-express';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

// @UseGuards(JwtGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspaceService: WorkspacesService) {}

  @Get()
  async index(): Promise<WorkspaceDto[]> {
    return await this.workspaceService.index(false);
  }

  @Post()
  async create(
    @Request() req: ExpressAuthedRequest,
    @Body(new ZodValidationPipe(createWorkspaceSchema))
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    return await this.workspaceService.create({
      createdById: req.user.userId,
      ...createWorkspaceDto,
    });
  }

  @Put(':id')
  async update(
    @Request() req: ExpressAuthedRequest,
    @Body(new ZodValidationPipe(updateWorkspaceSchema))
    updateWorkspaceDto: UpdateWorkspaceDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WorkspaceDto> {
    return await this.workspaceService.update(id, {
      updatedById: req.user.userId,
      ...updateWorkspaceDto,
    });
  }
  @Get('export/:id')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=workspace.json')
  async exportOne(
    // @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const workspace: string =
      await this.workspaceService.findOneAndConvertToJson(id);

    const stream = Readable.from([workspace]);
    return new StreamableFile(stream);
  }
  // make the import endpoint

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importWorkspace(@UploadedFile() file: Express.Multer.File) {
    file;
    return await this.workspaceService.createFromJson(file);
  }
}
