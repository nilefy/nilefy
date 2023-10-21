import { Inject, Injectable } from '@nestjs/common';
import { DrizzleAsyncProvider, DatabaseI } from '../drizzle/drizzle.provider';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceDto,
} from './workspace.dto';
import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import * as schema from '../drizzle/schema/schema';

@Injectable()
export class WorkspacesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async index(includeDeleted: boolean): Promise<WorkspaceDto[]> {
    const ws = await this.db.query.workspaces.findMany({
      where: includeDeleted
        ? isNotNull(schema.workspaces.deletedAt)
        : undefined,
    });
    console.log(ws);
    return ws;
  }

  async create(ws: CreateWorkspaceDto): Promise<WorkspaceDto> {
    const workspace = await this.db
      .insert(schema.workspaces)
      .values(ws)
      .returning();
    console.log(workspace);
    return workspace[0];
  }

  async update(id: number, ws: UpdateWorkspaceDto): Promise<WorkspaceDto> {
    const workspace = await this.db
      .update(schema.workspaces)
      .set({ ...ws, updatedAt: sql`now()` })
      .where(
        and(eq(schema.workspaces.id, id), isNull(schema.workspaces.deletedAt)),
      )
      .returning();
    console.log(workspace);
    return workspace[0];
  }
}
