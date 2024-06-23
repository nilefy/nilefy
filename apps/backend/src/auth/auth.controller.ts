import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import {
  CreateUserDto,
  LoginUserDto,
  forgotPasswordSchema,
  ForgotPasswordDto,
  ResetPasswordDto,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '../dto/users.dto';
import { EnvSchema } from '../evn.validation';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { AuthService } from './auth.service';
import { ExpressAuthedRequest, GoogleAuthedRequest } from './auth.types';
import { SignInGoogleOAuthGuard } from './google.guard';
import { DataSourcesService } from '../data_sources/data_sources.service';
import { scopeMap } from '../data_sources/plugins/googlesheets/types';
import GoogleSheetsQueryService from '../data_sources/plugins/googlesheets/main';
import { JwtGuard } from './jwt.guard';
@Controller('auth')
export class AuthController {
  constructor(
    private dataSourcesService: DataSourcesService,
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
    const frontURL = new URL(
      '/signin',
      this.configService.get('NODE_ENV') === 'development'
        ? this.configService.get('BASE_URL_FE')
        : this.configService.get('BASE_URL_BE'),
    );
    frontURL.searchParams.set(
      'token',
      (await this.authService.authWithOAuth(req.user)).access_token,
    );
    response.redirect(302, frontURL.toString());
  }

  // TODO: should we move this to data queries controller?
  @Get('googlesheets/:ws/:ds')
  @Redirect()
  async googleLogin(
    @Param('ws') ws: string,
    @Param('ds') ds: string,
    @Res() res: Response,
  ) {
    const scope: string = (await this.dataSourcesService.getOne(+ws, +ds))
      .config.scope;
    const scopeLinks = scopeMap[scope];
    const sheetsService = new GoogleSheetsQueryService();
    const authUrl = sheetsService.getAuthUrl(scopeLinks);
    // Set cookies for ws and ds
    res.cookie('ws', ws, { httpOnly: true });
    res.cookie('ds', ds, { httpOnly: true });

    return { url: authUrl };
  }
  @Get('login/google-sheets-redirect')
  async callback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('error') error?: string,
  ) {
    if (error) {
      // TODO: redirect back to google sheet page with error message
      throw new BadRequestException();
    }
    const sheetsService = new GoogleSheetsQueryService();
    const tokens = await sheetsService.getTokensFromCode(code!);
    // Now we can use the tokens to authenticate requests to Google Sheets API
    // For example, maybe  saving them in the database for use later when using the datasource
    const googleToken = tokens.access_token;
    const googleRefreshToken = tokens.refresh_token;
    // Get ws and ds from cookies
    const ws = req.cookies.ws;
    const ds = req.cookies.ds;
    const dataSource = await this.dataSourcesService.getOne(+ws, +ds);
    this.dataSourcesService.update(
      {
        dataSourceId: +ds,
        workspaceId: +ws,
        updatedById: null,
      },
      {
        config: {
          ...dataSource.config,
          access_token: googleToken,
          refresh_token: googleRefreshToken,
        },
      },
    );
    // Save the tokens in the database
    res.cookie('access_token', googleToken, { httpOnly: true });
    res.cookie('refresh_token', googleRefreshToken, { httpOnly: true });
    const redirectUrl = new URL(
      `/${ws}/datasources/${ds}`,
      this.configService.get('NODE_ENV') === 'development'
        ? this.configService.get('BASE_URL_FE')
        : this.configService.get('BASE_URL_BE'),
    );
    res.redirect(redirectUrl.toString());
  }

  @Get('confirm/:email/:token')
  async confirm(
    @Res() response: Response,
    @Param('email') email: string,
    @Param('token') token: string,
  ) {
    const frontURL = new URL(
      '/signin',
      this.configService.get('NODE_ENV') === 'development'
        ? this.configService.get('BASE_URL_FE')
        : this.configService.get('BASE_URL_BE'),
    );
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
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema))
    forgotPasswordDto: ForgotPasswordDto,
  ) {
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema))
    resetPasswordDto: ResetPasswordDto,
  ) {
    const { password, token } = resetPasswordDto;
    return await this.authService.resetPassword(password, token);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  async me(@Req() req: ExpressAuthedRequest) {
    return await this.authService.me(req.user.userId);
  }
}
