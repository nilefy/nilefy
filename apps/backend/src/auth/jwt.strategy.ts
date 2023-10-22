import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { EnvSchema, TConfigService } from '../evn.validation';
import { ConfigService } from '@nestjs/config';
import { PayloadUser, RequestUser } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private configService: TConfigService;

  constructor(configService: ConfigService<EnvSchema, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
    this.configService = configService;
  }

  /**
   * validate gets the decoded JSON from passport
   * you can call the db here to get more data about the user and return it to use from `req.user`
   */
  async validate(payload: PayloadUser): Promise<RequestUser> {
    return { userId: payload.sub, username: payload.username };
  }
}
