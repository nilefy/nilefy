import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { hash, genSalt, compare } from 'bcrypt';
import { CreateUserDto, LoginUserDto } from '../dto/users.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(user: CreateUserDto) {
    const { email, username, password } = user;

    const ret = await this.userService.findOne(email);
    if (ret) {
      throw new BadRequestException();
    }

    const salt = await genSalt(10);
    const hashed = await hash(password, salt);
    const u = await this.userService.create({ ...user, password: hashed });

    return { token: await this.jwtService.signAsync({ sub: u.id, username }) };
  }

  async signIn(user: LoginUserDto) {
    const { email, password } = user;

    const ret = await this.userService.findOne(email);
    if (!ret) {
      throw new NotFoundException();
    }

    const match = await compare(password, ret.password);
    if (!match) {
      throw new BadRequestException();
    }
    return {
      token: await this.jwtService.signAsync({
        sub: ret.id,
        username: ret.username,
      }),
    };
  }
}