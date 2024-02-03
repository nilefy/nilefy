import { ExecutionContext, Injectable, Redirect } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthedRequest } from './auth.types';
import { Response } from 'express';

@Injectable()
export class SignInGoogleOAuthGuard extends AuthGuard('google') {
  constructor() {
    super({ accessType: 'offline' });
  }
}
