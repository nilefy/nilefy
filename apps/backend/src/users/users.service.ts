import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto, UserDto } from '../dto/users.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { InferInsertModel, and, eq, isNull } from 'drizzle-orm';
import { accounts, users } from '../drizzle/schema/schema';
import { genSalt, hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@Inject(DrizzleAsyncProvider) private readonly db: DatabaseI) {}

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
      return u;
    });
  }

  async update(userId: number, updateDto: UpdateUserDto) {
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
}
