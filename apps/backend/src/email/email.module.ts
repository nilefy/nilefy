import { Module } from '@nestjs/common';
import { EmailSignUpService } from './email-sign-up/email-sign-up.service';

@Module({
  providers: [EmailSignUpService],
  exports: [EmailSignUpService],
})
export class EmailModule {}
