import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { PermissionsService } from './permissions.service';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { PermissionDto } from '../dto/permissions.dto';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  /**
   * this route is for one simple reason: when the front wants to say add or remove a permission from role it needs to know its id
   */
  @Get()
  @ApiCreatedResponse({
    description: 'get permissions',
    type: Array<PermissionDto>,
  })
  async index(): Promise<PermissionDto[]> {
    return await this.permissionsService.index();
  }
}
