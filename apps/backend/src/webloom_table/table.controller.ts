import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WebloomDbService } from './table.service';
import {
  InsertDto,
  InsertWebloomTableDto,
  insertSchema,
  webloomTableInsertDto,
} from '../dto/webloom_table.dto';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { JwtGuard } from '../auth/jwt.guard';
import { ExpressAuthedRequest } from '../auth/auth.types';

@UseGuards(JwtGuard)
@Controller('workspaces/:workspaceId/database')
export class WebloomDbController {
  constructor(private readonly webloomDbService: WebloomDbService) {}

  @Get()
  async index(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
  ) {
    return await this.webloomDbService.index(workspaceId);
  }

  @Get(':id')
  async findOne(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Param('id', ParseIntPipe) tableId: number,
  ) {
    return await this.webloomDbService.findOne(workspaceId, tableId);
  }

  @Post()
  async createTable(
    @Req() req: ExpressAuthedRequest,
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Body(new ZodValidationPipe(webloomTableInsertDto))
    tableDto: InsertWebloomTableDto,
  ) {
    return await this.webloomDbService.create({
      createdById: req.user.userId,
      workspaceId,
      ...tableDto,
    });
  }

  @Post(':id')
  async insertDataByTableId(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Param('id', ParseIntPipe) tableId: number,
    @Body(new ZodValidationPipe(insertSchema))
    data: InsertDto,
  ) {
    return await this.webloomDbService.insertDataByTableId(
      workspaceId,
      tableId,
      data.data,
    );
  }

  @Delete(':id')
  async deleteTable(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,
    @Param('id', ParseIntPipe) tableId: number,
  ) {
    return await this.webloomDbService.delete(workspaceId, tableId);
  }
}
