import { Inject, Injectable } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  CreateWorkspaceDb,
  UpdateWorkspaceDb,
  WorkspaceDto,
} from '../dto/workspace.dto';
import { and, eq, isNull, sql } from 'drizzle-orm';
import * as schema from '@webloom/database';
@Injectable()
export class WorkspacesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: schema.DatabaseI) {}

  async index(includeDeleted: boolean): Promise<WorkspaceDto[]> {
    const ws = await this.db.query.workspaces.findMany({
      where: includeDeleted ? undefined : isNull(schema.workspaces.deletedAt),
    });
    return ws;
  }

  async create(ws: CreateWorkspaceDb): Promise<WorkspaceDto> {
    const workspace = await this.db
      .insert(schema.workspaces)
      .values(ws)
      .returning();
    return workspace[0];
  }
  async getUserWorkspaces(userId: number): Promise<WorkspaceDto[]> {
    const workspaces = await this.db.query.workspaces.findMany({}).returning();
  }
  async update(id: number, ws: UpdateWorkspaceDb): Promise<WorkspaceDto> {
    const workspace = await this.db
      .update(schema.workspaces)
      .set({ ...ws, updatedById: ws.updatedById, updatedAt: sql`now()` })
      .where(
        and(eq(schema.workspaces.id, id), isNull(schema.workspaces.deletedAt)),
      )
      .returning();
    return workspace[0];
  }
}
