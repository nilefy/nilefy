import { Injectable } from '@nestjs/common';
import { configDotenv } from 'dotenv';
import { JwtService } from '@nestjs/jwt';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  constructor(private jwtService: JwtService) {}
  async sendConformationEmail(email: string, jwt: string) {
    configDotenv();
    const isDev = (process.env.NODE_ENV as string) === 'development';
    const KEY = process.env.RESEND_API_KEY as string;
    const resend = new Resend(KEY);
    const baseUrl = isDev ? 'http://localhost:3000/' : 'https://weblloom.com/';

    const url = baseUrl + 'auth/confirm' + '/' + email + '/' + jwt;

    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: isDev ? (process.env.SEND_TO as string) : email,
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
  async sendResetPasswordEmail(email: string, token: string) {
    configDotenv();
    const isDev = (process.env.NODE_ENV as string) === 'development';
    const KEY = process.env.RESEND_API_KEY as string;
    const resend = new Resend(KEY);
    const baseUrl = isDev ? 'http://localhost:5173/' : 'https://weblloom.com/';

    // is there a safer way to send the token than to just imbed it in the url?
    const url = baseUrl + 'auth/reset-password' + '/' + email + '/' + token;
    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: isDev ? (process.env.SEND_TO as string) : email,
      subject: 'WebLoom - Reset Your Password',
      html:
        `
<p>Dear ` +
        email +
        ` ,</p>
<p>We received a request to reset the password for your WebLoom account.</p>
<p>Please click the following link to reset your password:</p>
<a href="` +
        url +
        ` ">Reset Password</a>
<p>If you did not request a password reset, please disregard this email.</p>
<p>Thank you for choosing WebLoom!</p>
<p>Best Regards,<br/>
The Webloom Team</p>
`,
    });

    return { error };
  }
}
