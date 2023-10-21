import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SignInGoogleStrategy extends PassportStrategy(
  Strategy,
  'google_login',
) {
  constructor(private configService: ConfigService) {
    super({
      clientID: '',
      clientSecret: '',
      callbackURL: '/auth/login/google-redirect',
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log(profile);
    const user = {
      email: profile.emails[0].value,
      password: profile.id,
    };
    done(null, user);
  }
}

@Injectable()
export class SignUpGoogleStrategy extends PassportStrategy(
  Strategy,
  'google_signup',
) {
  constructor(private configService: ConfigService) {
    super({
      clientID: '',
      clientSecret: '',
      callbackURL: '/auth/signup/google-redirect',
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log(profile);
    const user = {
      email: profile.emails[0].value,
      username: profile.displayName,
      password: profile.id,
    };
    done(null, user);
  }
}
