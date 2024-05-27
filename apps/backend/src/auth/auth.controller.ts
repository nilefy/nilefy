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
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Request, Response } from 'express';
import {
  CreateUserDto,
  LoginUserDto,
  signInSchema,
  signUpSchema,
} from '../dto/users.dto';
import { EnvSchema } from '../evn.validation';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { AuthService } from './auth.service';
import { GoogleAuthedRequest } from './auth.types';
import { SignInGoogleOAuthGuard } from './google.guard';
import { DataSourcesService } from '../data_sources/data_sources.service';
import { scopeMap } from '../data_sources/plugins/googlesheets/types';
import GoogleSheetsQueryService from '../data_sources/plugins/googlesheets/main';
@Controller('auth')
export class AuthController {
  constructor(
    private dataSourcesService: DataSourcesService,
    private authService: AuthService,
    private googleSheetsQueryService: GoogleSheetsQueryService,
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
  @Get('googlesheets/:ws/:ds')
  @Redirect()
  async googleLogin(
    @Param('ws') ws: string,
    @Param('ds') ds: string,
    @Res() res: Response,
  ) {
    const scope: string = (await this.dataSourcesService.getOne(+ws, +ds))
      .config.scope;
    console.log(scope);
    const scopeLinks = scopeMap[scope];
    console.log(scopeLinks);
    const authUrl = this.googleSheetsQueryService.getAuthUrl(scopeLinks);
    // Set cookies for ws and ds
    res.cookie('ws', ws, { httpOnly: true });
    res.cookie('ds', ds, { httpOnly: true });

    return { url: authUrl };
  }
  @Get('login/google-redirect')
  async callback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tokens = await this.googleSheetsQueryService.getTokensFromCode(code);
    // Now we can use the tokens to authenticate requests to Google Sheets API
    // For example, maybe  saving them in the database for use later when using the datasource
    console.log(tokens);
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
    res.redirect(`http://localhost:5173/${ws}/datasources/${ds}`);
  }

  @Get('profile')
  async getProfile(@Req() req: Request) {
    // console.log(req);
    const accessToken = req.cookies['access_token'];
    if (accessToken) {
      return (
        await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/1N9USlPVtWFBF20WGB7NmoKNcB8C_2ATFpkgA_hD4WuM/values/A4:C6`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
      ).data;
    }

    throw new UnauthorizedException('No access token');
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
