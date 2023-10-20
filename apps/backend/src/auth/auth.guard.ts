import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from 'src/evn.validation';

export type ExpressAuthedRequest = Request & {
  user: { username: string };
};

/**
 * please notice after using this as a gurd the type of the request is changed to `ExpressAuthedRequest`
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<EnvSchema>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const token = this.getToken(req);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const { username } = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      (req as ExpressAuthedRequest)['user'] = { username };
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private getToken(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
