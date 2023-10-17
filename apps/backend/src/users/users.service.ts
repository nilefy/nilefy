import { Injectable } from '@nestjs/common';
import { createUserDto } from '../dto/users.dto';

@Injectable()
export class UsersService {
  // TODO: create user model + db communication
  private readonly users: createUserDto[] = [
    {
      username: 'user1',
      password: '0000',
      email: 'user@user',
    },
  ];

  findOne(email: string) {
    return this.users.find((user) => user.email === email);
  }

  create(user: createUserDto) {
    this.users.push(user);
    return this.users;
  }
}
