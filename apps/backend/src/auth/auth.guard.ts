import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { constants } from './auth.module';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const token = this.getToken(req);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const { username } = await this.jwtService.verifyAsync(token, {
        secret: constants.JWT_SECRET,
      });
      req['user'] = { username };
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
