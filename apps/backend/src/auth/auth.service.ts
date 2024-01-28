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
import { Resend } from 'resend';

const resend = new Resend('re_g5xWM5pD_JeAhaHmaccLMbc5873jSLKcc');

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(user: CreateUserDto) {
    const { password } = user;
    const salt = await genSalt(10);
    const hashed = await hash(password, salt);

    try {
      const u = await this.userService.create({ ...user, password: hashed });
      const { email } = user;

      const { error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Hello World',
        html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
      });
      if (error) {
        console.log('Error while sending email: ${error}');
      }
      return {
        access_token: await this.jwtService.signAsync({
          sub: u.id,
          username: u.username,
        } satisfies PayloadUser),
      } satisfies JwtToken;
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async signIn(user: LoginUserDto) {
    const { email, password } = user;

    const ret = await this.userService.findOne(email);
    if (!ret) {
      throw new NotFoundException('Email Not Found');
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
