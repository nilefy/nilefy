import { Inject, Injectable } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  CreateWorkspaceDb,
  UpdateWorkspaceDb,
  WorkspaceDto,
} from '../dto/workspace.dto';
import { and, eq, sql } from 'drizzle-orm';
import * as schema from '@webloom/database';
import { UserDto } from '../dto/users.dto';

@Injectable()
export class WorkspacesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: schema.DatabaseI) {}

  async index(userId: UserDto['id']): Promise<WorkspaceDto[]> {
    const ws = (
      await this.db.query.usersToWorkspaces.findMany({
        where: eq(schema.usersToWorkspaces.userId, userId),
        with: {
          workspace: true,
        },
      })
    ).map((u) => u.workspace);
    return ws;
  }

  async create(
    ws: CreateWorkspaceDb,
    options?: { tx: schema.PgTrans },
  ): Promise<WorkspaceDto> {
    return await (options?.tx
      ? this.createHelper(ws, options.tx)
      : this.db.transaction(async (tx) => {
          return await this.createHelper(ws, tx);
        }));
  }

  private async createHelper(ws: CreateWorkspaceDb, tx: schema.PgTrans) {
    const workspace = await tx.insert(schema.workspaces).values(ws).returning();
    await tx
      .insert(schema.usersToWorkspaces)
      .values({ userId: ws.createdById, workspaceId: workspace[0].id })
      .returning();
    return workspace[0];
  }

  async update(id: number, ws: UpdateWorkspaceDb): Promise<WorkspaceDto> {
    const workspace = await this.db
      .update(schema.workspaces)
      .set({ ...ws, updatedById: ws.updatedById, updatedAt: sql`now()` })
      .where(and(eq(schema.workspaces.id, id)))
      .returning();
    return workspace[0];
  }
}
