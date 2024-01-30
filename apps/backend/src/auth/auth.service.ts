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
      const jwt = await this.jwtService.signAsync(
        {
          sub: 1,
          username: user.username,
        } satisfies PayloadUser,
        { expiresIn: '1d' },
      );

      const u = await this.userService.create({ ...user, password: hashed });
      //todo uncomment for production
      //      const { email } = user;
      console.log('Right before sending email');
      // todo replace with dynamic url
      const url = 'http://localhost:3000/auth/confirm' + '/' + jwt + '/' + u.id;
      console.log('confirmation url: ' + url);
      const { error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        //todo uncomment for production
        //to: email,
        to: 'muhammed195772@feng.bu.edu.eg',
        subject: 'WebLoom - Confirm Your Email Address',
        html:
          `
    <p>Dear [User],</p>
    <p>Congratulations on signing up for WebLoom! We're thrilled to have you on board.</p>
    
    <p>Please click the following link to confirm your email address and complete the signup process:</p>
    <a href="` +
          url +
          ` ">Confirm Email Address</a>

    <p>If you did not sign up for WeblLoom, please disregard this email.</p>

    <p>Thank you for choosing WebLoom!</p>
    <p>Best Regards,<br/>
    The Webloom Team</p>
  `,
      });
      console.log('Right after sending email');
      if (error) {
        console.log('Error while sending email:');
        console.log(error);
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

  async confirm(token: string, email: string) {
    await this.jwtService.verifyAsync(token);
    const user = await this.userService.findOne(email);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    user.isConfirmed = true;
    await this.userService.update(user.id, user);
    return {
      access_token: await this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
      } satisfies PayloadUser),
    } satisfies JwtToken;
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
