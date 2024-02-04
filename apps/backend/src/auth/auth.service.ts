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
import { EmailService } from './email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async signUp(user: CreateUserDto) {
    const { password } = user;
    const salt = await genSalt(10);
    const hashed = await hash(password, salt);
    user = { ...user, password: hashed };
    console.log(user);

    try {
      const u = await this.usersService.create({ ...user, password: hashed });
      const jwt = await this.jwtService.signAsync(
        {
          sub: 1,
          username: user.username,
        } satisfies PayloadUser,
        { expiresIn: '1d' },
      );
      console.log('before sending email');
      this.emailService.sendEmail(user.email, jwt);
      console.log('after sending email');
      return {
        access_token: await this.jwtService.signAsync({
          sub: u.id,
          username: u.username,
        } satisfies PayloadUser),
      } satisfies JwtToken;
    } catch (err) {
      console.log(err);
      throw new BadRequestException();
    }
  }

  async confirm(email: string, token: string) {
    await this.jwtService.verifyAsync(token);
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    user.isConfirmed = true;
    await this.usersService.update(user.id, user);
    return {
      access_token: await this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
      } satisfies PayloadUser),
    } satisfies JwtToken;
  }

  async logIn(user: LoginUserDto) {
    const { email, password } = user;

    const ret = await this.usersService.findOne(email);
    if (!ret) {
      throw new NotFoundException('Email Not Found');
    }
    const { isConfirmed } = ret;
    if (!isConfirmed) {
      throw new BadRequestException('Email Not Confirmed');
    }

    const match = await compare(password, ret.password);
    if (!match) {
      console.log('from login(password entered):');
      console.log(password);
      console.log('from login(password in db):');
      console.log(ret.password);
      console.log('from login(password in db-hashed):');
      const salt = await genSalt(10);
      const hashed = await hash(password, salt);
      console.log(hashed);
      console.log('Yoink');
      throw new BadRequestException('Incorrect Password!');
    }
    return {
      access_token: await this.jwtService.signAsync({
        sub: ret.id,
        username: ret.username,
      } satisfies PayloadUser),
    } satisfies JwtToken;
  }
}
