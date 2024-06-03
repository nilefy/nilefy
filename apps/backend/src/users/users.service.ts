import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDb, UpdateUserRetDto, UserDto } from '../dto/users.dto';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { InferInsertModel, and, eq, isNull } from 'drizzle-orm';
import { genSalt, hash } from 'bcrypt';
import { accounts, DatabaseI, PgTrans, users } from '@nilefy/database';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceDto } from '../dto/workspace.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: DatabaseI,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async findOne(email: string) {
    const u = await this.db.query.users.findFirst({
      where: and(eq(users.email, email), isNull(users.deletedAt)),
      with: {
        accounts: true,
      },
    });
    return u;
  }

  /**
   *  create user with default workspace(this user will be the admin of the workspace)
   */
  async create(
    user: InferInsertModel<typeof users> & {
      accounts?: Omit<InferInsertModel<typeof accounts>, 'userId'>;
    },
    options?: { tx: PgTrans },
  ): Promise<UserDto & { workspace: WorkspaceDto }> {
    return await (options?.tx
      ? this.createHelper(user, options.tx)
      : this.db.transaction(async (tx) => {
          return await this.createHelper(user, tx);
        }));
  }

  private async createHelper(
    user: InferInsertModel<typeof users> & {
      accounts?: Omit<InferInsertModel<typeof accounts>, 'userId'>;
    },
    tx: PgTrans,
  ): Promise<UserDto & { workspace: WorkspaceDto }> {
    if (user.password) {
      const salt = await genSalt(10);
      const hashed = await hash(user.password, salt);
      user.password = hashed;
    }
    const [u] = await tx.insert(users).values(user).returning();
    if (user.accounts) {
      await tx.insert(accounts).values({ userId: u.id, ...user.accounts });
    }
    const w = await this.workspacesService.create(
      {
        name: 'New Workspace',
        createdById: u.id,
      },
      {
        tx: tx,
      },
    );
    return {
      ...u,
      workspace: w,
    };
  }

  async update(
    userId: number,
    updateDto: UpdateUserDb,
  ): Promise<UpdateUserRetDto> {
    if (updateDto.password) {
      const salt = await genSalt(10);
      updateDto.password = await hash(updateDto.password, salt);
    }
    const updatedUser = (
      await this.db
        .update(users)
        .set({ updatedAt: new Date(), ...updateDto })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
    )[0];
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async updateOnboarding(userId: number, onboardingCompleted = true) {
    const update = (
      await this.db
        .update(users)
        .set({ onboardingCompleted })
        .where(eq(users.id, userId))
        .returning({
          onboardingCompleted: users.onboardingCompleted,
        })
    )[0];
    if (!update) {
      throw new NotFoundException('User not found');
    }
    return update;
  }
}
