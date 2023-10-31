import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
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
import { JwtGuard } from 'src/auth/jwt.guard';
import { ExpressAuthedRequest } from '../auth/auth.types';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspaceService: WorkspacesService) {}

  @Get()
  async index(): Promise<WorkspaceDto[]> {
    return await this.workspaceService.index(false);
  }

  @UseGuards(JwtGuard)
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

  @UseGuards(JwtGuard)
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
}
