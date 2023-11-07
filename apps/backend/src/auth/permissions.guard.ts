import { Reflector } from '@nestjs/core';
import {
  SetMetadata,
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import { ExpressAuthedRequest } from './auth.types';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema/schema';
import { PermissionTypes } from '../dto/permissions.dto';
import { UserDto } from '../dto/users.dto';

const PERMISSIONS_KEY = 'permissions_key';

export const RequiredPermissions = (...permissions: PermissionTypes[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * only works if used after `JwtGuard` or any middleware that override the `Request` to have `{user: RequestUser}`
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    private reflector: Reflector,
  ) {}

  private async getUserWithPermissions(userId: UserDto['id']) {
    const user = await this.db.query.users.findFirst({
      columns: {
        password: false,
      },
      where: eq(users.id, userId),
      with: {
        //TODO: drizzle throws error
        // @link: https://github.com/drizzle-team/drizzle-orm/issues/1477
        // usersToGroups: {
        //   with: {
        //     group: {
        //       with: {
        //         rolesToGroups: {
        //           with: {
        //             role: {
        //               with: {
        //                 permissionsToRoles: {
        //                   with: {
        //                     permission: true,
        //                   },
        //                 },
        //               },
        //             },
        //           },
        //         },
        //       },
        //     },
        //   },
        // },
        usersToRoles: {
          with: {
            role: {
              with: {
                permissionsToRoles: {
                  with: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // no such user WEIRD!
    if (!user) return undefined;

    const userPermissions: Set<PermissionTypes> = new Set();
    // extract user permissions
    user.usersToRoles.forEach((role) =>
      role.role.permissionsToRoles.forEach((permission) =>
        userPermissions.add(permission.permission.name),
      ),
    );
    // TODO: re-enable
    // user.usersToGroups.forEach((group) =>
    //   group.group.rolesToGroups.forEach((role) =>
    //     role.role.permissionsToRoles.forEach((permission) =>
    //       userPermissions.add(permission.permission.name),
    //     ),
    //   ),
    // );

    return [user, userPermissions] as const;
  }

  private hasEnoughPermissions(
    requiredPermissions: PermissionTypes[],
    userPermissions: Set<PermissionTypes>,
  ): boolean {
    for (const per of requiredPermissions) {
      if (!userPermissions.has(per)) return false;
    }
    return true;
  }

  async canActivate(context: ExecutionContext) {
    const requiedPermissions = this.reflector.getAllAndMerge<PermissionTypes[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    // no required permissions exit early
    if (requiedPermissions.length === 0) return true;
    const { user: requestUser } = context
      .switchToHttp()
      .getRequest<ExpressAuthedRequest>();
    // as of now call the db with each request for the permissions
    // we don't care what roles nor groups user in, we only care about the permissions these roles/groups have
    const userWithPermissions = await this.getUserWithPermissions(
      requestUser.userId,
    );
    if (!userWithPermissions) {
      return false;
    }
    const permissions = userWithPermissions[1];
    return this.hasEnoughPermissions(requiedPermissions, permissions);
  }
}
