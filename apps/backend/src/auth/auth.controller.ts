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
import { SignInGoogleOAuthGuard, SignUpGoogleOAuthGuard } from './google.guard';
import { JwtGuard } from './jwt.guard';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import {
  signUpSchema,
  signInSchema,
  CreateUserDto,
  LoginUserDto,
} from '../dto/users.dto';
import {
  ExpressAuthedRequest,
  GoogleAuthedRequest,
  JwtRequest,
} from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UsePipes(new ZodValidationPipe(signUpSchema))
  @Post('signup')
  async signUp(@Body() userDto: CreateUserDto, @Req() req: JwtRequest) {
    req.user = await this.authService.signUp(userDto);
    return;
  }

  @UsePipes(new ZodValidationPipe(signInSchema))
  @Post('login')
  async signIn(@Body() userDto: LoginUserDto, @Req() req: JwtRequest) {
    req.user = await this.authService.signIn(userDto);
    return;
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
    req.user = await this.authService.signIn(req.user as LoginUserDto);
    return;
  }

  @UseGuards(SignUpGoogleOAuthGuard)
  @Get('signup/google-redirect')
  async signUpGoogleRedirect(@Req() req: GoogleAuthedRequest) {
    req.user = await this.authService.signUp(req.user as CreateUserDto);
    return;
  }

  @UseGuards(JwtGuard)
  @Get('main')
  main(@Req() req: ExpressAuthedRequest) {
    return req.user;
  }
}
