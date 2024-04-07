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
  createRoleSchema,
  updateRoleSchema,
} from '../dto/roles.dto';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtGuard, PermissionsGuard)
@OnlyAdmin()
@Controller('workspaces/:workspaceId/roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  async index(@Param('workspaceId', ParseIntPipe) workspaceId: number) {
    return await this.rolesService.index(workspaceId);
  }

  @Get(':roleId')
  async one(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return await this.rolesService.one(workspaceId, roleId);
  }

  @Post()
  async create(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
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
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body(new ZodValidationPipe(updateRoleSchema)) updateRoleDto: RoleUpdateI,
  ) {
    return await this.rolesService.update(workspaceId, roleId, {
      updatedById: req.user.userId,
      ...updateRoleDto,
    });
  }

  @Put(':roleId/togglepermission/:permissionId')
  async togglePermission(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return await this.rolesService.togglePermission(
      workspaceId,
      roleId,
      permissionId,
    );
  }

  @Delete(':roleId')
  async Delete(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return await this.rolesService.delete({
      deletedById: req.user.userId,
      roleId: roleId,
      workspaceId: workspaceId,
    });
  }
}
