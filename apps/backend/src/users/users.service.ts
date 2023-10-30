import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema/schema';
import { genSalt, hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@Inject(DrizzleAsyncProvider) private readonly db: DatabaseI) {}

  async findOne(email: string) {
    const u = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return u;
  }

  async create(user: CreateUserDto) {
    const u = await this.db.insert(users).values(user).returning();
    return u[0];
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
