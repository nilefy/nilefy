import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { EnvSchema, TConfigService } from '../evn.validation';
import { ConfigService } from '@nestjs/config';
import z from 'zod';
// import { GoogleAuthedRequest } from './auth.types';

const googleProfileSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  name: z.object({ familyName: z.string(), givenName: z.string() }),
  emails: z
    .array(z.object({ value: z.string().email(), verified: z.boolean() }))
    .min(1),
  photos: z.array(
    z.object({
      value: z.string().url(),
    }),
  ),
  provider: z.literal('google'),
});

@Injectable()
export class SignInGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private configService: TConfigService;

  constructor(configService: ConfigService<EnvSchema, true>) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/login/google-redirect',
      scope: ['email', 'profile'],
    });
    this.configService = configService;
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: unknown,
    done: VerifyCallback,
  ) {
    try {
      const parsedProfile = googleProfileSchema.parse(profile);
      const user = {
        email: parsedProfile.emails[0].value,
        isEmailVerified: parsedProfile.emails[0].verified,
        providerAccountId: parsedProfile.id,
        provider: 'google',
        avatar: parsedProfile.photos[0]?.value,
        username: parsedProfile.displayName,
        accessToken: _accessToken,
        refreshToken: _refreshToken,
      };
      done(null, user);
    } catch (e) {
      done(e, undefined);
    }
  }
}
