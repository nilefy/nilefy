import { Inject, Injectable } from '@nestjs/common';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { asc } from 'drizzle-orm';
import { permissions } from '../drizzle/schema/schema';
import { PermissionDto } from '../dto/permissions.dto';

@Injectable()
export class PermissionsService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async index(): Promise<PermissionDto[]> {
    return await this.db.query.permissions.findMany({
      orderBy: asc(permissions.name),
    });
  }
}
