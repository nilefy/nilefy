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
import {
  SignInGoogleOAuthGuard,
  SignUpGoogleOAuthGuard,
  GoogleAuthedRequest,
} from './google.guard';
import { JwtGuard, ExpressAuthedRequest } from './jwt.guard';
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
  async signIn(@Body() userDto: LoginUserDto) {
    return await this.authService.signIn(userDto);
  }

  @UseGuards(SignInGoogleOAuthGuard)
  @Get('login/google')
  signInGoogleAuth() {}

  @UseGuards(SignUpGoogleOAuthGuard)
  @Get('signup/google')
  signUpGoogleAuth() {}

  @UseGuards(SignInGoogleOAuthGuard)
  @Get('login/google-redirect')
  async signInGoogleRedirect(@Req() req: GoogleAuthedRequest) {
    return await this.authService.signIn(req.user);
  }

  @UseGuards(SignUpGoogleOAuthGuard)
  @Get('signup/google-redirect')
  async signUpGoogleRedirect(@Req() req: GoogleAuthedRequest) {
    return await this.authService.signUp(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('main')
  main(@Req() req: ExpressAuthedRequest) {
    return req.user;
  }
}
