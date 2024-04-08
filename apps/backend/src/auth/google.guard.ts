import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SignInGoogleOAuthGuard extends AuthGuard('google') {
  constructor() {
    super({
      accessType: 'offline',
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });
  }
}
