import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { EnvSchema, TConfigService } from '../evn.validation';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SignInGoogleStrategy extends PassportStrategy(
  Strategy,
  'google_login',
) {
  private configService: TConfigService;

  constructor(configService: ConfigService<EnvSchema, true>) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: '/auth/login/google-redirect',
      scope: ['email', 'profile'],
    });
    this.configService = configService;
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    // TODO: add type
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
  private configService: TConfigService;

  constructor(configService: ConfigService<EnvSchema, true>) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: '/auth/signup/google-redirect',
      scope: ['email', 'profile'],
    });
    this.configService = configService;
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    // TODO: add type
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
