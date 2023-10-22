import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../dto/users.dto';

export type GoogleAuthedRequest = Request & { user: CreateUserDto };

@Injectable()
export class SignInGoogleOAuthGuard extends AuthGuard('google_login') {
  constructor() {
    super({ accessType: 'offline' });
  }
}

@Injectable()
export class SignUpGoogleOAuthGuard extends AuthGuard('google_signup') {
  constructor() {
    super({ accessType: 'offline' });
  }
}
