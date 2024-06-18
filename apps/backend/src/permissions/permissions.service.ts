import { Inject, Injectable } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { asc } from 'drizzle-orm';
import { PermissionDto } from '../dto/permissions.dto';
import { DatabaseI, permissions } from '@nilefy/database';

@Injectable()
export class PermissionsService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async index(): Promise<PermissionDto[]> {
    return await this.db.query.permissions.findMany({
      orderBy: asc(permissions.name),
    });
  }
}
