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
import { JwtGuard } from '../auth/jwt.guard';
import { ExpressAuthedRequest } from '../auth/auth.types';

@UseGuards(JwtGuard)
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
}
