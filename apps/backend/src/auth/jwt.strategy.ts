import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { EnvSchema, TConfigService } from '../evn.validation';
import { ConfigService } from '@nestjs/config';

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

  async validate(payload: any): Promise<any> {
    return { sub: payload.sub, username: payload.username };
  }
}
