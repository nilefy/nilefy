import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UsePipes,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WebloomDbService } from './table.service';
import {
  InsertWebloomTableDto,
  WebloomTableDto,
  webloomTableInsertDto,
} from '../dto/webloom_table.dto';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { JwtGuard } from '../auth/jwt.guard';
import { WorkspaceDto } from '../dto/workspace.dto';
import { ExpressAuthedRequest } from '../auth/auth.types';

@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/database')
export class WebloomDbController {
  constructor(private readonly webloomDbService: WebloomDbService) {}

  @Get()
  async index(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WorkspaceDto['id'],
  ) {
    return await this.webloomDbService.index(workspaceId);
  }

  @Get(':id')
  async findOne(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WorkspaceDto['id'],
    @Param('id', ParseIntPipe) tableId: WebloomTableDto['id'],
  ) {
    return await this.webloomDbService.findOne(workspaceId, tableId);
  }

  @UsePipes()
  @Post()
  async createTable(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WorkspaceDto['id'],
    @Body(new ZodValidationPipe(webloomTableInsertDto))
    tableDto: InsertWebloomTableDto,
  ) {
    return await this.webloomDbService.create({
      createdById: req.user.userId,
      workspaceId,
      ...tableDto,
    });
  }

  @Post('insert/:id')
  async insertDataByTableId(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WorkspaceDto['id'],
    @Param('id', ParseIntPipe) tableId: WebloomTableDto['id'],
    @Body() data: Record<string, unknown>[],
  ) {
    return await this.webloomDbService.insertDataByTableId(
      workspaceId,
      tableId,
      data,
    );
  }

  @Delete(':id')
  async deleteTable(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: WorkspaceDto['id'],
    @Param('id', ParseIntPipe) tableId: WebloomTableDto['id'],
  ) {
    return await this.webloomDbService.delete(workspaceId, tableId);
  }
}
