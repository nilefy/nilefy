import { and, eq, isNull } from 'drizzle-orm';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { hash, genSalt, compare } from 'bcrypt';
import { CreateUserDto, LoginUserDto } from '../dto/users.dto';
import { GoogleAuthedRequest, JwtToken, PayloadUser } from './auth.types';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { EmailSignUpService } from '../email/email-sign-up/email-sign-up.service';
import { users } from '../drizzle/schema/schema';

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

  /**
   * return message to send for the user on sign up
   */
  async signUp(user: CreateUserDto): Promise<{ msg: string }> {
    try {
      const salt = await genSalt(10);
      const hashed = await hash(user.password, salt);
      const conformationToken = await this.jwtService.signAsync(
        {
          email: user.email,
        },
        { expiresIn: '1d' },
      );
      await this.userService.create({
        username: user.username,
        email: user.email,
        password: hashed,
        conformationToken,
      });
      this.emailSignUpService.sendEmail(user.email, conformationToken);
      return { msg: 'signed up successfully, please confirm your email' };
    } catch (err) {
      Logger.error('DEBUGPRINT[1]: auth.service.ts:94: err=', err);
      //TODO: return database error
      throw new BadRequestException(
        'something went wrong on sign up please try again',
      );
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
    if (!u.emailVerified) {
      throw new BadRequestException(
        `please verify your email then try to sign in`,
      );
    }
    return {
      access_token: await this.jwtService.signAsync({
        sub: u.id,
        username: u.username,
      } satisfies PayloadUser),
    };
  }

  /**
   * returns message to be sent to the front
   */
  async confirm(email: string, token: string) {
    try {
      const user = await this.db.query.users.findFirst({
        where: and(
          eq(users.email, email),
          eq(users.conformationToken, token),
          isNull(users.deletedAt),
        ),
        columns: {
          id: true,
          conformationToken: true,
          email: true,
        },
      });
      if (!user) {
        throw new BadRequestException('Failed to confirm email');
      }
      await this.jwtService.verifyAsync(token);
      await this.userService.update(user.id, {
        emailVerified: new Date(),
        conformationToken: null,
      });
      return 'email verified successfully, try sign-in';
    } catch {
      throw new BadRequestException('Failed to confirm email');
    }
  }
}
