import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { hash, genSalt, compare } from 'bcrypt';
import { CreateUserDto, LoginUserDto } from '../dto/users.dto';
import { GoogleAuthedRequest, JwtToken, PayloadUser } from './auth.types';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { EmailSignUpService } from '../email/email-sign-up/email-sign-up.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private emailSignUpService: EmailSignUpService,
    @Inject(DrizzleAsyncProvider) private readonly db: DatabaseI,
  ) {}

  /**
   * user exists and signed with the same provided before return jwt for it, doesn't exist create new one and return jwt
   */
  async authWithOAuth({
    email,
    username,
    provider,
    avatar,
    providerAccountId,
    isEmailVerified,
  }: GoogleAuthedRequest['user']): Promise<JwtToken> {
    if (!isEmailVerified) {
      throw new BadRequestException('cannot use unverified email in oauth');
    }
    const u = await this.userService.findOne(email);
    if (u) {
      return {
        access_token: await this.jwtService.signAsync({
          sub: u.id,
          username: u.username,
        } satisfies PayloadUser),
      };
    }
    // no user will try to create one
    try {
      const u = await this.userService.create({
        email,
        username,
        emailVerified: new Date(),
        avatar,
        accounts: {
          provider,
          providerAccountId,
        },
      });

      return {
        access_token: await this.jwtService.signAsync({
          sub: u.id,
          username: u.username,
        } satisfies PayloadUser),
      };
    } catch (err) {
      //TODO: return database error
      throw new BadRequestException();
    }
  }

  async signUp(user: CreateUserDto): Promise<JwtToken> {
    const { password } = user;
    const salt = await genSalt(10);
    const hashed = await hash(password, salt);

    try {
      const u = await this.userService.create({ ...user, password: hashed });
      const jwt = await this.jwtService.signAsync(
        {
          sub: 1,
          username: user.username,
        } satisfies PayloadUser,
        { expiresIn: '1d' },
      );
      this.emailSignUpService.sendEmail(user.email, jwt);
      return {
        access_token: await this.jwtService.signAsync({
          sub: u.id,
          username: u.username,
        } satisfies PayloadUser),
      };
    } catch (err) {
      //TODO: return database error
      throw new BadRequestException();
    }
  }

  async signIn(user: LoginUserDto): Promise<JwtToken> {
    const { email, password } = user;

    const u = await this.userService.findOne(email);
    if (!u) {
      throw new NotFoundException('Email Not Found');
    }
    if (u.password) {
      const match = await compare(password, u.password);
      if (!match) {
        throw new BadRequestException();
      }
    } else if (u.accounts.length > 0) {
      // user has no password that means this user could be created from oauth
      const account = u.accounts[0];
      throw new BadRequestException(`try signin with ${account.provider}`);
    } else {
      // no password nor account, that's weird how did we create this user
      throw new InternalServerErrorException();
    }

    return {
      access_token: await this.jwtService.signAsync({
        sub: u.id,
        username: u.username,
      } satisfies PayloadUser),
    };
  }

  async confirm(email: string, token: string) {
    try {
      await this.jwtService.verifyAsync(token);
      const user = await this.userService.findOne(email);
      if (!user) {
        throw new NotFoundException('User Not Found');
      }
      user.isConfirmed = true;
      await this.userService.update(user.id, { isConfirmed: true });
      // const accessToken = await this.generateAccessToken(user);
      // return { access_token: accessToken };
      // todo decide if we're going to return access token or not
      return { message: 'Email Confirmed' };
    } catch (error) {
      throw new Error('Failed to confirm email');
    }
  }

  // private async generateAccessToken(user: User): Promise<string> {
  //   const payload = { sub: user.id, username: user.username };
  //   return this.jwtService.signAsync(payload);
  // }
}
