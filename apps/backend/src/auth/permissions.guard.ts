import { Reflector } from '@nestjs/core';
import {
  SetMetadata,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ExpressAuthedRequest } from './auth.types';

const PERMISSIONS_KEY = 'permissions_key';

/**
 * manage == can do all
 * write == insert/update
 */
export const PermissionsEnum = {
  // WORKSPACES
  'Workspaces-Read': 'workspacesRead',
  'Workspaces-Write': 'workspacesWrite',
  'Workspaces-Delete': 'workspacesDelete',
  'Workspaces-Manage': 'workspacesManage',
  // APPS
  'Apps-Read': 'appsRead',
  'Apps-Write': 'appsWrite',
  'Apps-Delete': 'appsDelete',
  'Apps-Manage': 'appsManage',
} as const;

export type PermissionsEnum =
  (typeof PermissionsEnum)[keyof typeof PermissionsEnum];

export const RequiredPermissions = (...permissions: PermissionsEnum[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * only works if used after `JwtGuard` or any middleware that override the `Request` to have `{user: RequestUser}`
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiedPermissions = this.reflector.getAllAndMerge<PermissionsEnum[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    console.log('permissions: ', requiedPermissions);
    const { user } = context.switchToHttp().getRequest<ExpressAuthedRequest>();
    console.log('user', user);
    return true;
  }
}
