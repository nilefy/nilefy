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

const PERMISSIONS_KEY = 'permissions_key' as const;
const ONLY_ADMIN_KEY = 'need_admin_key' as const;
type RequiredPermissionsI = {
  permissions: PermissionTypes[];
  options: {
    /**  should have the role admin whatever their permissions
     */
    admin: boolean;
  };
};

export const RequiredPermissions = (
  ...permissions: RequiredPermissionsI['permissions']
) =>
  SetMetadata<typeof PERMISSIONS_KEY, RequiredPermissionsI['permissions']>(
    PERMISSIONS_KEY,
    permissions,
  );

export const OnlyAdmin = (
  onlyAdmin: RequiredPermissionsI['options']['admin'] = true,
) =>
  SetMetadata<typeof ONLY_ADMIN_KEY, RequiredPermissionsI['options']['admin']>(
    ONLY_ADMIN_KEY,
    onlyAdmin,
  );

/**
 * only works if used after `JwtGuard` or any middleware that override the `Request` to have `{user: RequestUser}`
 *
 * NOTE: if `onlyAdmin` is provided in the class or method we don't test for permissions only test whether they have role `admin` or not
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

    const userRoles = user.usersToRoles.map((role) => role.role.name);
    const isAdmin = userRoles.includes('admin');

    return [user, userPermissions, userRoles, isAdmin] as const;
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
    const requiedPermissions = this.reflector.getAllAndMerge<
      RequiredPermissionsI['permissions']
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // one of them is true = true
    const onlyAdminHandler = this.reflector.get<
      RequiredPermissionsI['options']['admin'] | undefined
    >(ONLY_ADMIN_KEY, context.getHandler());
    const onlyAdminClass = this.reflector.get<
      RequiredPermissionsI['options']['admin'] | undefined
    >(ONLY_ADMIN_KEY, context.getClass());
    const onlyAdmin = onlyAdminHandler || onlyAdminClass || false;
    // no required permissions exit early
    if (requiedPermissions.length === 0 && !onlyAdmin) return true;
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
    const isAdmin = userWithPermissions[3];
    if (isAdmin) return true;
    // if only admin is required, we don't test permissions
    if (onlyAdmin) return isAdmin;
    return this.hasEnoughPermissions(requiedPermissions, permissions);
  }
}
