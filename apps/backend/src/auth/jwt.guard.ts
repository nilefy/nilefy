import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export type ExpressAuthedRequest = Request & {
  user: {
    sub: number;
    username: string;
  };
};

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}
