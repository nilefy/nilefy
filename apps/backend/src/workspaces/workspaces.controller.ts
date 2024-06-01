import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Request,
  UseGuards,
  Query,
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
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { z } from 'zod';

const workspaceUserFilter = z.object({
  page: z.number().min(0).optional(),
  pageSize: z.number().min(1).optional(),
  searchQ: z.string().optional(),
});
type WorkspaceUserFilterI = z.infer<typeof workspaceUserFilter>;

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspaceService: WorkspacesService) {}

  @Get()
  @ApiCreatedResponse({
    description: 'get user workspaces',
    type: Array<WorkspaceDto>,
  })
  async index(@Req() req: ExpressAuthedRequest): Promise<WorkspaceDto[]> {
    return await this.workspaceService.index(req.user.userId);
  }

  @Get(':id/users')
  async getWorkspaceUsers(
    @Param('id', ParseIntPipe) workspaceId: number,
    @Body(new ZodValidationPipe(workspaceUserFilter))
    userFilters: WorkspaceUserFilterI,
    @Query('page', new ZodValidationPipe(z.coerce.number().optional()))
    page?: number,
    @Query('pageSize', new ZodValidationPipe(z.coerce.number().optional()))
    pageSize?: number,
    @Query('searchQ') searchQ?: string,
  ) {
    return await this.workspaceService.workspaceUsers(
      workspaceId,
      userFilters.page ?? page,
      userFilters.pageSize ?? pageSize,
      userFilters.searchQ ?? searchQ,
    );
  }

  @Post()
  @ApiCreatedResponse({
    description: 'create workspace',
    type: WorkspaceDto,
  })
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
  @ApiCreatedResponse({
    description: 'update workspace',
    type: WorkspaceDto,
  })
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
