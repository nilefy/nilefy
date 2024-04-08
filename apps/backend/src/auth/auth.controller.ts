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
  UnauthorizedException,
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
import axios from 'axios';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService<EnvSchema, true>,
  ) {}
  @Get('googlesheets')
  @UseGuards(SignInGoogleOAuthGuard)
  googleLogin() {}

  @Get('login/google-redirect')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req: any, @Res() res: any) {
    const googleToken = req.user.accessToken;
    const googleRefreshToken = req.user.refreshToken;
    // console.log(req);
    res.cookie('access_token', googleToken, { httpOnly: true });
    res.cookie('refresh_token', googleRefreshToken, {
      httpOnly: true,
    });

    res.redirect('http://localhost:3000/auth/profile');
  }

  //   @UseGuards(SignInGoogleOAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    // console.log(req);
    const accessToken = req.cookies['access_token'];
    if (accessToken) {
      return (
        await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/1N9USlPVtWFBF20WGB7NmoKNcB8C_2ATFpkgA_hD4WuM/values/A4:C6`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Include access token in the request headers
            },
          },
        )
      ).data;
    }

    throw new UnauthorizedException('No access token');
  }
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
}
