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

    try {
      const u = await this.usersService.create({ ...user, password: hashed });
      // const jwt = await this.jwtService.signAsync(
      //   {
      //     sub: 1,
      //     username: user.username,
      //   } satisfies PayloadUser,
      //   { expiresIn: '1d' },
      // );

      // const { error } = await
      // this.emailService.sendEmail(user.email, u.id, jwt);
      // no need to await since errors are acceptatble here, there should be a resend email button
      // if (error) {
      //   console.log('Error while sending email:');
      //   console.log(error);
      // }
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

  async confirm(token: string, email: string) {
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

  async signIn(user: LoginUserDto) {
    const { email, password } = user;

    const ret = await this.usersService.findOne(email);
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
