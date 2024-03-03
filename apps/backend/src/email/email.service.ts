import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../evn.validation';

@Injectable()
export class EmailService {
  private resend: Resend;
  constructor(private configService: ConfigService<EnvSchema, true>) {
    const KEY: string = this.configService.get('RESEND_API_KEY');
    this.resend = new Resend(KEY);
  }

  async sendEmail({
    to,
    html,
    subject,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const isDev: boolean = this.configService.get('NODE_ENV') === 'development';
    const { error } = await this.resend.emails.send({
      from: this.configService.get('RESEND_SEND_FROM_EMAIL'),
      to: isDev ? this.configService.get('RESEND_SEND_TO_DEV_EMAIL') : to,
      subject,
      html,
    });
    return error;
  }
}
