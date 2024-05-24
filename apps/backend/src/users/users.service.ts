import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDb, UpdateUserRetDto, UserDto } from '../dto/users.dto';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { InferInsertModel, and, eq, isNull } from 'drizzle-orm';
import { genSalt, hash } from 'bcrypt';
import { accounts, DatabaseI, users } from '@nilefy/database';
import { WorkspacesService } from '../workspaces/workspaces.service';

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

  async create(
    user: InferInsertModel<typeof users> & {
      accounts?: Omit<InferInsertModel<typeof accounts>, 'userId'>;
    },
  ): Promise<UserDto> {
    return this.db.transaction(async (tx) => {
      const [u] = await tx.insert(users).values(user).returning();
      if (user.accounts) {
        await tx.insert(accounts).values({ userId: u.id, ...user.accounts });
      }
      await this.workspacesService.create(
        {
          name: 'New Workspace',
          createdById: u.id,
        },
        {
          tx: tx,
        },
      );
      return u;
    });
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
