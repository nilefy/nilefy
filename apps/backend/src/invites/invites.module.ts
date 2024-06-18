import { Module } from '@nestjs/common';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

@Module({
  controllers: [InvitesController],
  providers: [InvitesService],
  imports: [UsersModule, EmailModule],
})
export class InvitesModule {}
