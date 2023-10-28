import {
  BadRequestException,
  Body,
  Controller,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, updateUserSchema } from '../dto/users.dto';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { JwtGuard } from '../auth/jwt.guard';
import { ExpressAuthedRequest } from '../auth/auth.types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Put()
  async updateProfile(
    @Request() req: ExpressAuthedRequest,
    @Body(new ZodValidationPipe(updateUserSchema))
    data: UpdateUserDto,
  ) {
    if (!data.password && !data.username) {
      throw new BadRequestException(
        `Please provide either "username" or "password"`,
      );
    }
    return await this.usersService.update(req.user.userId, data);
  }
}
