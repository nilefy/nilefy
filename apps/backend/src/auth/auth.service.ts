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
    console.log('saved user:');
    console.log(user);

    try {
      const u = await this.usersService.create(user);
      console.log(u.password);
      const jwt = await this.jwtService.signAsync(
        {
          sub: u.id,
          username: u.username,
        } satisfies PayloadUser,
        { expiresIn: '1d' },
      );
      this.emailService.sendConformationEmail(user.email, jwt);
      return {
        access_token: jwt,
      } satisfies JwtToken;
    } catch (err) {
      console.log(err);
      throw new BadRequestException();
    }
  }

  async logIn(user: LoginUserDto) {
    const { email, password } = user;

    const ret = await this.usersService.findOne(email);
    if (!ret) {
      throw new NotFoundException('Email Not Found');
    }
    //todo fix compare always returns false.
    //! this is important
    const match = await compare(password, ret.password); //? always returns false?
    if (!match) {
      console.log(ret.password);
      throw new BadRequestException(
        'The credentials you provided are incorrect.',
      );
    }
    const { isConfirmed } = ret;
    if (!isConfirmed) {
      // todo: alert the user they need to confirm their email
      // throw new BadRequestException('Email Not Confirmed');
    }
    return {
      access_token: await this.jwtService.signAsync({
        sub: ret.id,
        username: ret.username,
      } satisfies PayloadUser),
    } satisfies JwtToken;
  }

  async confirm(email: string, token: string) {
    const res = await this.jwtService.verifyAsync(token);

    if (res.sub !== email) {
      throw new BadRequestException('Token Not Valid');
    }
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    user.isConfirmed = true;
    await this.usersService.update(user.id, {
      isConfirmed: true,
    });
    return {
      access_token: await this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
      } satisfies PayloadUser),
    } satisfies JwtToken;
  }
  async resetPasswordRequest(email: string) {
    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    const token = await this.jwtService.signAsync(
      { sub: email },
      {
        expiresIn: '1d',
      },
    );

    await this.usersService.update(user.id, { resetPasswordToken: token });

    await this.emailService.sendResetPasswordEmail(email, token);
    return { message: "Please check you're email." };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    const res = await this.jwtService.verifyAsync(token);
    if (res.sub !== email) {
      throw new BadRequestException('Token Not Valid');
    }
    const salt = await genSalt(10);
    const hashed = await hash(newPassword, salt);
    await this.usersService.update(user.id, {
      password: hashed,
    });
    return { message: 'Password Reset successfully.' };
  }
}
