import { Inject, Injectable } from '@nestjs/common';
import { DrizzleAsyncProvider, DatabaseI } from '../drizzle/drizzle.provider';
import {
  CreateWorkspaceDb,
  CreateWorkspaceDto,
  UpdateWorkspaceDb,
  WorkspaceDto,
} from '../dto/workspace.dto';
import { and, eq, isNull, sql } from 'drizzle-orm';
import * as schema from '../drizzle/schema/schema';

@Injectable()
export class WorkspacesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

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

  async findOneAndConvertToJson(id: number): Promise<string> {
    const workspace = await this.db.query.workspaces.findFirst({
      where: and(
        eq(schema.workspaces.id, id),
        isNull(schema.workspaces.deletedAt),
      ),
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    return JSON.stringify(workspace);
  }

  async createFromJson(file: Express.Multer.File): Promise<WorkspaceDto> {
    let workspace: CreateWorkspaceDto = JSON.parse(file.buffer.toString());
    workspace = await this.db
      .insert(schema.workspaces)
      .values(workspace)
      //todo: fix this (returning doesn't exist)
      .returning();
    workspace;

    return workspace;
  }
}
