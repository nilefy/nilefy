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
import { compare, genSalt, hash } from 'bcrypt';
import { CreateUserDto, LoginUserDto, RetUserSchema } from '../dto/users.dto';
import { GoogleAuthedRequest, JwtToken, PayloadUser } from './auth.types';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';

import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../evn.validation';
import { EmailService } from '../email/email.service';
import { DatabaseI, passkeys, users } from '@nilefy/database';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  AuthenticatorTransportFuture,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';
import { rpID, rpName, origin } from '@nilefy/constants';

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
      throw new BadRequestException('Cannot use unverified email in oauth.');
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
      Logger.error({ err });
      //TODO: return database error
      throw new BadRequestException();
    }
  }

  private async signUpEmail(email: string, username: string, jwt: string) {
    const url = new URL(
      `/auth/confirm/${encodeURIComponent(email)}/${encodeURIComponent(jwt)}`,
      this.configService.get('NODE_ENV') === 'development'
        ? this.configService.get('BASE_URL_FE')
        : this.configService.get('BASE_URL_BE'),
    ).toString();
    const html =
      `
    <p>Dear ${username},</p>
    <p>Congratulations on signing up for nilefy! We're thrilled to have you on board.</p>
    <p>Please click the following link to confirm your email address and complete the signup process:</p>
    <a href="` +
      url +
      ` ">Confirm Email Address</a>
    <p>If you did not sign up for WeblLoom, please disregard this email.</p>
    <p>Thank you for choosing Nilefy!</p>
    <p>Best Regards,<br/>
    The Nilefy Team</p>
  `;
    await this.emailService.sendEmail({
      to: email,
      subject: 'Nilefy - Confirm Your Email Address',
      html,
    });
  }

  /**
   * return message to send for the user on sign up
   */
  async signUp(user: CreateUserDto): Promise<{ msg: string }> {
    try {
      const conformationToken = await this.jwtService.signAsync(
        {
          email: user.email,
        },
        { expiresIn: '1d' },
      );
      await this.userService.create({
        username: user.username,
        email: user.email,
        password: user.password,
        conformationToken,
      });
      // TODO: sending email should be through a queue to not halt the request until the email is sent
      this.signUpEmail(user.email, user.username, conformationToken);
      return { msg: 'Signed up successfully, please confirm your email.' };
    } catch (err) {
      Logger.error({ err }, err.stack);
      //TODO: return database error
      // throw new BadRequestException(
      //   'something went wrong on sign up please try again',
      // );
      throw new BadRequestException(err.message);
    }
  }

  async signIn(user: LoginUserDto): Promise<JwtToken> {
    const { email, password } = user;

    const u = await this.userService.findOne(email);
    if (!u) {
      throw new NotFoundException('Email not found');
    }

    if (u.password) {
      const match = await compare(password, u.password);
      if (!match) {
        throw new BadRequestException('Wrong credentials');
      }
    } else if (u.accounts.length > 0) {
      // user has no password that means this user could be created from oauth
      const account = u.accounts[0];
      throw new BadRequestException(`Try signin with ${account.provider}`);
    } else {
      // no password nor account, that's weird how did we create this user
      throw new InternalServerErrorException('Something went wrong');
    }
    // if (!u.emailVerified) {
    //   throw new BadRequestException(
    //     `Please verify your email then try to sign in`,
    //   );
    // }
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
      return 'Email verified successfully, try sign-in';
    } catch {
      throw new BadRequestException('Failed to confirm email');
    }
  }

  private async forgotPasswordSendEmail(email: string, token: string) {
    const url = new URL(
      `/auth/reset-password/${encodeURIComponent(email)}/${encodeURIComponent(token)}`,
      this.configService.get('NODE_ENV') === 'development'
        ? this.configService.get('BASE_URL_FE')
        : this.configService.get('BASE_URL_BE'),
    ).toString();
    const html =
      `
    <p>Dear ${email},</p>
    <p>We received a request to reset your Nilefy password. Please click the following link to reset your password:</p>
    <a href="` +
      url +
      ` ">Reset Password</a>
    <P> This link will expire in 10 minutes.</p>
    <p>If you did not request a password reset, please disregard this email.</p>
    <p>Thank you for choosing Nilefy!</p>
    <p>Best Regards,<br/>
    The Nilefy Team</p>
  `;
    await this.emailService.sendEmail({
      to: email,
      subject: 'Nilefy - Reset Your Password',
      html,
    });
  }

  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const user = await this.userService.findOne(email);

      if (!user) {
        throw new NotFoundException('Email not found');
      }

      const token = await this.jwtService.signAsync(
        { email: user.email },
        { expiresIn: '10m' },
      );

      await this.userService.update(user.id, {
        passwordResetToken: token,
      });

      this.forgotPasswordSendEmail(email, token);

      return { success: true };
    } catch (error) {
      throw new BadRequestException(
        `Failed to reset password, ${error.message}`,
      );
    }
  }

  async resetPassword(password: string, token: string) {
    try {
      const { email } = await this.jwtService.verifyAsync(token);
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
      if (user === undefined) {
        throw new BadRequestException('Token expired or invalid');
      }
      await this.jwtService.verifyAsync(token);

      if (user.password) {
        const match = await compare(password, user.password);
        if (match) {
          throw new BadRequestException('Use a new password');
        }
      }
      const salt = await genSalt(10);
      const hashed = await hash(password, salt);

      await this.userService.update(user.id, {
        password: hashed,
        passwordResetToken: null,
      });
      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to reset password`);
    }
  }

  /**
   * return current user data
   */
  async me(currentUserId: number): Promise<RetUserSchema> {
    return await this.userService.me(currentUserId);
  }

  /**
   *
   * @url https://simplewebauthn.dev/docs/packages/server#1-generate-registration-options
   */
  async generatePasscodeRegisterOptions(loggedInUserId: number) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, loggedInUserId),
      columns: {
        id: true,
        email: true,
      },
      with: {
        passkeys: true,
      },
    });
    if (!user) {
      throw new InternalServerErrorException(
        "the user doesn't exist on our database but the user is logged in",
      );
    }
    const userPasskeys = user.passkeys;

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: user.email,
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: 'none',
      // Prevent users from re-registering existing authenticators
      excludeCredentials: userPasskeys.map((passkey) => ({
        id: passkey.id,
        // Optional
        transports: passkey.transports.split(
          ',',
        ) as AuthenticatorTransportFuture[],
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },

      supportedAlgorithmIDs: [-7, -257],
    });

    Logger.debug(options, 'options');
    // save the options in the database for later validations
    await this.db
      .update(users)
      .set({
        currentRegistrationOptions: options,
      })
      .where(eq(users.id, loggedInUserId));

    return options;
  }

  /**
   * @url https://simplewebauthn.dev/docs/packages/server#2-verify-registration-response
   */
  async verifyWebauthnregistRationResponse(
    loggedInUserId: number,
    registrationResponse: RegistrationResponseJSON,
  ) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, loggedInUserId),
      columns: {
        id: true,
        email: true,
        currentRegistrationOptions: true,
      },
      with: {
        passkeys: true,
      },
    });
    if (!user) {
      throw new InternalServerErrorException(
        "the user doesn't exist on our database but the user is logged in",
      );
    }
    if (!user.currentRegistrationOptions) {
      throw new BadRequestException(
        'user should request register option form our server first!',
      );
    }
    const currentOptions = user.currentRegistrationOptions;

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: registrationResponse,
        expectedChallenge: `${currentOptions.challenge}`,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
      });
    } catch (error) {
      Logger.error(error, 'verify error');
      Logger.error(registrationResponse, 'verify error');
      throw new BadRequestException(error.message);
    }

    const { verified } = verification;

    // if verification.verified is true then RP's must, at the very least, save the credential data in registrationInfo to the database
    if (verified) {
      const { registrationInfo } = verification;
      if (!registrationInfo) {
        Logger.error({
          msg: 'how did we get verified true without registrationInfo',
          verification,
        });
        throw new InternalServerErrorException(
          'how did we get verified true without registrationInfo',
        );
      }
      const {
        credentialID,
        credentialPublicKey,
        counter,
        credentialDeviceType,
        credentialBackedUp,
      } = registrationInfo;

      await this.db.insert(passkeys).values({
        userId: loggedInUserId,
        webauthnUserID: currentOptions.user.id,
        id: credentialID,
        publicKey: credentialPublicKey,
        counter,
        deviceType: credentialDeviceType as string,
        backedUp: credentialBackedUp,
        transports: registrationResponse.response.transports
          ? registrationResponse.response.transports.join(',')
          : '',
      });
    }

    return { verified };
  }
}
