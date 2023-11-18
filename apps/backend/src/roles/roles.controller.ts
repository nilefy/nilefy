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
import { JwtGuard } from '../auth/jwt.guard';
import { RolesService } from './roles.service';
import { OnlyAdmin, PermissionsGuard } from '../auth/permissions.guard';
import { ExpressAuthedRequest } from '../auth/auth.types';
import {
  RoleInsertI,
  RoleUpdateI,
  RolesDto,
  createRoleSchema,
  updateRoleSchema,
} from '../dto/roles.dto';
import { ZodValidationPipe } from '../pipes/zod.pipe';

@UseGuards(JwtGuard, PermissionsGuard)
@OnlyAdmin()
@Controller('workspaces/:workspaceId/roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  async index(
    @Param('workspaceId', ParseIntPipe) workspaceId: RolesDto['workspaceId'],
  ) {
    return await this.rolesService.index(workspaceId);
  }

  @Get(':roleId')
  async one(
    @Param('workspaceId', ParseIntPipe) workspaceId: RolesDto['workspaceId'],
    @Param('roleId', ParseIntPipe) roleId: RolesDto['id'],
  ) {
    return await this.rolesService.one(workspaceId, roleId);
  }

  @Post()
  async create(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: RolesDto['workspaceId'],
    @Body(new ZodValidationPipe(createRoleSchema)) createRoleDto: RoleInsertI,
  ) {
    return await this.rolesService.create({
      createdById: req.user.userId,
      workspaceId: workspaceId,
      ...createRoleDto,
    });
  }

  @Put(':roleId')
  async update(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: RolesDto['workspaceId'],
    @Param('roleId', ParseIntPipe) roleId: RolesDto['id'],
    @Body(new ZodValidationPipe(updateRoleSchema)) updateRoleDto: RoleUpdateI,
  ) {
    return await this.rolesService.update(workspaceId, roleId, {
      updatedById: req.user.userId,
      ...updateRoleDto,
    });
  }

  @Delete(':roleId')
  async Delete(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: RolesDto['workspaceId'],
    @Param('roleId', ParseIntPipe) roleId: RolesDto['id'],
  ) {
    return await this.rolesService.delete({
      deletedById: req.user.userId,
      roleId: roleId,
      workspaceId: workspaceId,
    });
  }
}
