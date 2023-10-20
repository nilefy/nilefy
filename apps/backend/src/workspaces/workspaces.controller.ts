import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';

// TODO: remove this type after creating zod schema
export type Workspace = {
  id: number;
  name: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspaceService: WorkspacesService) {}

  @Get()
  async index(): Promise<Workspace[]> {}

  //TODO: add validation
  @Post()
  async create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<Workspace> {}

  //TODO: add validation
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<Workspace> {}
}
