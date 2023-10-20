import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { hash, genSalt, compare } from 'bcrypt';
import { createUserDto, loginUserDto } from '../dto/users.dto';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from 'src/evn.validation';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService<EnvSchema>,
  ) {}

  async signUp(user: createUserDto) {
    const { username, password } = user;
    const salt = await genSalt(10);
    const hashed = await hash(password, salt);

    // TODO: create user in DB
    this.userService.create({ ...user, password: hashed });

    return { token: await this.jwtService.signAsync({ username }) };
  }

  async signIn(user: loginUserDto) {
    const { email, password } = user;

    const ret = this.userService.findOne(email);

    if (!ret) {
      throw new NotFoundException();
    }

    const match = await compare(password, ret.password);
    if (!match) {
      throw new BadRequestException('incorrect password');
    }
    return {
      // TODO: add userId as "sub" to the payload
      token: await this.jwtService.signAsync({ username: ret.username }),
    };
  }
}
