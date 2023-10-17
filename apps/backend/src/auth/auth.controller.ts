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
import { AuthGuard } from './auth.guard';
import { ValidationPipe } from '../pipes/users.pipe';
import {
  signUpSchema,
  signInSchema,
  createUserDto,
  loginUserDto,
} from '../dto/users.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UsePipes(new ValidationPipe(signUpSchema))
  @Post('signup')
  async signUp(@Body() userDto: createUserDto) {
    return await this.authService.signUp(userDto);
  }

  @UsePipes(new ValidationPipe(signInSchema))
  @Post('login')
  signIn(@Body() userDto: loginUserDto) {
    return this.authService.signIn(userDto);
  }

  @UseGuards(AuthGuard)
  @Get('main')
  main(@Req() req) {
    return req.user;
  }
}
