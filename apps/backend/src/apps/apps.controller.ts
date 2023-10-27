import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { AppsService } from './apps.service';
import {
  CreateAppDto,
  UpdateAppDto,
  createAppSchema,
  updateAppSchema,
} from '../dto/apps.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { ExpressAuthedRequest } from '../auth/auth.types';

@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @UseGuards(JwtGuard)
  @UsePipes(new ZodValidationPipe(createAppSchema))
  @Post()
  async create(
    @Body() createAppDto: CreateAppDto,
    @Req() req: ExpressAuthedRequest,
  ) {
    return await this.appsService.create(req.user, createAppDto);
  }

  @UseGuards(JwtGuard)
  @Get()
  async findAll(@Req() req: ExpressAuthedRequest) {
    return await this.appsService.findAll(req.user);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ExpressAuthedRequest,
  ) {
    return await this.appsService.findOne(req.user, id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Body(new ZodValidationPipe(updateAppSchema)) updateAppDto: UpdateAppDto,
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ExpressAuthedRequest,
  ) {
    return await this.appsService.update(req.user, id, updateAppDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ExpressAuthedRequest,
  ) {
    return await this.appsService.delete(req.user, id);
  }
}
