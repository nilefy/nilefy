import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SignInGoogleSheetsOAuthGuard } from './googlesheets.guard';
import { GooglesheetsService } from './googlesheets.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('googlesheetss')
export class GooglesheetsController {
  constructor(private readonly googleSheetService: GooglesheetsService) {}
  @Get('login')
  @UseGuards(SignInGoogleSheetsOAuthGuard)
  googleLogin() {}

  @Get('login/google-redirect')
  @UseGuards(AuthGuard('google-sheets'))
  googleLoginCallback(@Req() req: any, @Res() res: any) {
    const googleToken = req.user.accessToken;
    const googleRefreshToken = req.user.refreshToken;
    // console.log(req);
    res.cookie('access_token', googleToken, { httpOnly: true });
    res.cookie('refresh_token', googleRefreshToken, {
      httpOnly: true,
    });

    res.redirect('http://localhost:3000/googlesheets/profile');
  }

  //   @UseGuards(SignInGoogleOAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    // console.log(req);
    const accessToken = req.cookies['access_token'];
    if (accessToken) return {};
    // return (await this.googleSheetService.getSheets(accessToken)).data;
    // throw new UnauthorizedException('No access token');
  }
}
