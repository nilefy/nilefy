import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SignInGoogleSheetsOAuthGuard extends AuthGuard('google-sheets') {
  constructor() {
    super({ accessType: 'offline' });
  }
}
