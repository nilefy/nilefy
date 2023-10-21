import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard, ExpressAuthedRequest } from './auth.guard';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import {
  signUpSchema,
  signInSchema,
  CreateUserDto,
  LoginUserDto,
} from '../dto/users.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UsePipes(new ZodValidationPipe(signUpSchema))
  @Post('signup')
  async signUp(@Body() userDto: CreateUserDto) {
    return await this.authService.signUp(userDto);
  }

  @UsePipes(new ZodValidationPipe(signInSchema))
  @Post('login')
  signIn(@Body() userDto: LoginUserDto) {
    return this.authService.signIn(userDto);
  }

  @UseGuards(AuthGuard)
  @Get('main')
  main(@Req() req: ExpressAuthedRequest) {
    return req.user;
  }
}
