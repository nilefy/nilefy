import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UsePipes,
  Res,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInGoogleOAuthGuard } from './google.guard';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import {
  signUpSchema,
  signInSchema,
  CreateUserDto,
  LoginUserDto,
} from '../dto/users.dto';
import { GoogleAuthedRequest } from './auth.types';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../evn.validation';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService<EnvSchema, true>,
  ) {}

  @Post('signup')
  async signUp(
    @Body(new ZodValidationPipe(signUpSchema)) userDto: CreateUserDto,
  ) {
    return await this.authService.signUp(userDto);
  }

  @UsePipes(new ZodValidationPipe(signInSchema))
  @Post('login')
  async signIn(@Body() userDto: LoginUserDto) {
    return await this.authService.signIn(userDto);
  }

  // will redirect user to google signin
  @UseGuards(SignInGoogleOAuthGuard)
  @Get('login/google')
  signInGoogleAuth() {}

  @UseGuards(SignInGoogleOAuthGuard)
  @Get('login/google-redirect')
  async signInGoogleRedirect(
    @Req() req: GoogleAuthedRequest,
    @Res() response: Response,
  ) {
    const frontURL = new URL('/signin', this.configService.get('BASE_URL_FE'));
    frontURL.searchParams.set(
      'token',
      (await this.authService.authWithOAuth(req.user)).access_token,
    );
    response.redirect(302, frontURL.toString());
  }

  @Get('confirm/:email/:token')
  async confirm(
    @Res() response: Response,
    @Param('email') email: string,
    @Param('token') token: string,
  ) {
    const frontURL = new URL('/signin', this.configService.get('BASE_URL_FE'));
    try {
      const msg = await this.authService.confirm(email, token);
      frontURL.searchParams.set('msg', msg);
    } catch (err) {
      if (err instanceof BadRequestException) {
        frontURL.searchParams.set('errorMsg', err.message);
      }
    }
    response.redirect(302, frontURL.toString());
    return;
  }
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return await this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('token') token: string,
  ) {
    const values = {
      email,
      password,
      token,
    };
    console.log(values);
    return await this.authService.resetPassword(email, password, token);
  }
}
