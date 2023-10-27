import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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

@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspaceService: WorkspacesService) {}

  @Get()
  async index(): Promise<WorkspaceDto[]> {
    return await this.workspaceService.index(false);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createWorkspaceSchema))
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    return await this.workspaceService.create(createWorkspaceDto);
  }

  @Put(':id')
  async update(
    @Body(new ZodValidationPipe(updateWorkspaceSchema))
    updateWorkspaceDto: UpdateWorkspaceDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WorkspaceDto> {
    return await this.workspaceService.update(id, updateWorkspaceDto);
  }
}
