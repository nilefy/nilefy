import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * please notice after using this as a gurd the type of the request is changed to `ExpressAuthedRequest`
 *
 * to include `RequestUser`
 */
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}
