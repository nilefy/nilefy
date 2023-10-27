import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/users.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { eq } from 'drizzle-orm';
import { timeStamps, users } from '../drizzle/schema/schema';
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
  async updateUsername(id: number, username: string) {
    const updatedUser = await this.db
      .update(users)
      .set({ username, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!updatedUser) {
      return new NotFoundException('User not found');
    }

    return updatedUser[0];
  }
  async updatePassword(id: number, password: string) {
    // Update the user with the given id, username and password
    // Return the updated user or throw an error if not found
    const salt = await genSalt(10);
    const hashed = await hash(password, salt);
    password = hashed;
    const { updatedAt } = timeStamps;
    updatedAt;
    const updatedUser = await this.db
      .update(users)
      .set({ password, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return new NotFoundException('User not found');
    }

    return updatedUser[0];
  }
}
