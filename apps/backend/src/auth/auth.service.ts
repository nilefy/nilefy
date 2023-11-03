import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { hash, genSalt, compare } from 'bcrypt';
import { CreateUserDto, LoginUserDto } from '../dto/users.dto';
import { JwtToken, PayloadUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(user: CreateUserDto) {
    const { password } = user;
    // TODO: i removed the email check because i added the unique constraint on the db, so we need to add error handler here
    const salt = await genSalt(10);
    const hashed = await hash(password, salt);
    const u = await this.userService.create({ ...user, password: hashed });

    return {
      access_token: await this.jwtService.signAsync({
        sub: u.id,
        username: u.username,
      } satisfies PayloadUser),
    } satisfies JwtToken;
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
      access_token: await this.jwtService.signAsync({
        sub: ret.id,
        username: ret.username,
      } satisfies PayloadUser),
    } satisfies JwtToken;
  }
}
