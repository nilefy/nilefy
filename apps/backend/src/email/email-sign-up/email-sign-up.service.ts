import { Injectable } from '@nestjs/common';
import { configDotenv } from 'dotenv';
import { JwtService } from '@nestjs/jwt';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from 'src/evn.validation';

@Injectable()
export class EmailSignUpService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<EnvSchema, true>,
  ) {}
  async sendEmail(email: string, jwt: string) {
    configDotenv();
    const isDev: boolean = this.configService.get('NODE_ENV') === 'development';
    const KEY: string = this.configService.get('RESEND_API_KEY');
    const resend = new Resend(KEY);
    const baseUrl: string = this.configService.get('BASE_URL_FE');

    const url =
      baseUrl +
      'confirm' +
      '/' +
      encodeURIComponent(email) +
      '/' +
      encodeURIComponent(jwt) +
      '/';

    const { error } = await resend.emails.send({
      from: this.configService.get('RESEND_SEND_FROM_EMAIL'),
      to: isDev ? this.configService.get('RESEND_SEND_TO_DEV_EMAIL') : email,
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
    return { error };
  }
}
