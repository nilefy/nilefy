import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto, UserDto } from '../dto/users.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async findOne(email: string): Promise<UserDto | undefined> {
    const u = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return u;
  }

  async create(user: CreateUserDto): Promise<UserDto> {
    const u = await this.db.insert(users).values(user).returning();
    return u[0];
  }
}
