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
import { users } from '../drizzle/schema/schema';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../evn.validation';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService<EnvSchema, true>,
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
  private async signUpSendEmail(email: string, username: string, jwt: string) {
    const baseUrl: string = this.configService.get('BASE_URL_BE');

    const url =
      baseUrl +
      'auth' +
      '/' +
      'confirm' +
      '/' +
      encodeURIComponent(email) +
      '/' +
      encodeURIComponent(jwt) +
      '/';
    const html =
      `
    <p>Dear ${username},</p>
    <p>Congratulations on signing up for WebLoom! We're thrilled to have you on board.</p>
    <p>Please click the following link to confirm your email address and complete the signup process:</p>
    <a href="` +
      url +
      ` ">Confirm Email Address</a>
    <p>If you did not sign up for WeblLoom, please disregard this email.</p>
    <p>Thank you for choosing WebLoom!</p>
    <p>Best Regards,<br/>
    The Webloom Team</p>
  `;
    await this.emailService.sendEmail({
      to: email,
      subject: 'WebLoom - Confirm Your Email Address',
      html,
    });
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
      this.signUpSendEmail(user.email, user.username, conformationToken);
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

  private async forgotPasswordSendEmail(email: string, token: string) {
    const baseUrl: string = this.configService.get('BASE_URL_FE');
    const url =
      baseUrl +
      'auth' +
      '/' +
      'reset-password' +
      '/' +
      encodeURIComponent(email) +
      '/' +
      encodeURIComponent(token) +
      '/';
    const html =
      `
    <p>Dear ${email},</p>
    <p>We received a request to reset your WebLoom password. Please click the following link to reset your password:</p>
    <a href="` +
      url +
      ` ">Reset Password</a>
    <p>If you did not request a password reset, please disregard this email.</p>
    <p>Thank you for choosing WebLoom!</p>
    <p>Best Regards,<br/>
    The Webloom Team</p>
  `;
    await this.emailService.sendEmail({
      to: email,
      subject: 'WebLoom - Reset Your Password',
      html,
    });
  }

async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const user = await this.userService.findOne(email);

      if (!user) {
        throw new NotFoundException('Email Not Found');
      }

      const token = await this.jwtService.signAsync(
        { email: user.email },
        { expiresIn: '1d' },
      );

      await this.userService.update(user.id, {
        passwordResetToken: token,
      });

      this.forgotPasswordSendEmail(email, token);

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async resetPassword(email: string, password: string, token: string) {
    try {

      const user = await this.db.query.users.findFirst({
        where: and(
          eq(users.email, email),
          eq(users.passwordResetToken, token),
          isNull(users.deletedAt),
        ),
        columns: {
          id: true,
          passwordResetToken: true,
          email: true,
          password: true,
        },
      });
      if (!user) {
        throw new BadRequestException('Failed to reset password');
      }

      await this.jwtService.verifyAsync(token);
      if (user.password) {
        const match = await compare(password, user.password);
        if (match) {
          throw new BadRequestException('use a new password');
        }
      }
      const salt = await genSalt(10);
      const hashed = await hash(password, salt);

      await this.userService.update(user.id, {
        password: hashed,
        passwordResetToken: null,
      });
      return 'Password reset successfully, try signing in';
    } catch (e) {
      throw new BadRequestException('Failed to reset password');
    }
  }
}
