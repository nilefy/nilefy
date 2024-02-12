import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UsePipes,
  Param,
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
import { ExpressAuthedRequest, GoogleAuthedRequest } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService, // private readOnly: EmailService,
  ) {}

  @UsePipes(new ZodValidationPipe(signUpSchema))
  @Post('signup')
  async signUp(@Body() userDto: CreateUserDto) {
    return await this.authService.signUp(userDto);
  }

  @UsePipes(new ZodValidationPipe(signInSchema))
  @Post('login')
  async signIn(@Body() userDto: LoginUserDto) {
    return await this.authService.logIn(userDto);
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
    return await this.authService.logIn(req.user as LoginUserDto);
  }

  @UseGuards(SignUpGoogleOAuthGuard)
  @Get('signup/google-redirect')
  async signUpGoogleRedirect(@Req() req: GoogleAuthedRequest) {
    return await this.authService.signUp(req.user as CreateUserDto);
  }

  @Get('confirm/:email/:token')
  async confirm(@Param('email') email: string, @Param('token') token: string) {
    return await this.authService.confirm(email, token);
  }

  @Post('reset-password-request/:email')
  async resetPasswordRequest(@Param('email') email: string) {
    return await this.authService.resetPasswordRequest(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('token') token: string,
    @Body('new_password') newPassword: string,
  ) {
    return await this.authService.resetPassword(email, token, newPassword);
  }

  @UseGuards(JwtGuard)
  @Get('main')
  main(@Req() req: ExpressAuthedRequest) {
    return req.user;
  }
}
