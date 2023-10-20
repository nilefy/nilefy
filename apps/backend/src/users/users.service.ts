import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/users.dto';
import { DatabaseI } from 'src/drizzle/drizzle.provider';
import { eq } from 'drizzle-orm';
import { users } from 'src/drizzle/schema/schema';

@Injectable()
export class UsersService {
  constructor(@Inject('drizzle') private db: DatabaseI) {}

  // TODO: create user model + db communication
  private readonly users: CreateUserDto[] = [
    {
      username: 'user1',
      password: '0000',
      email: 'user@user',
    },
  ];

  async findOne(email: string) {
    const u = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return u;
  }

  async create(user: CreateUserDto) {
    const u = await this.db.insert(users).values(user).returning();
    return u;
  }
}
