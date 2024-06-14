import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import { JwtGuard } from '../auth/jwt.guard';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { z } from 'zod';
import {
  InvitationCallbackReq,
  invitationCallbackReq,
} from '@nilefy/constants';
import { InvitesService } from './invites.service';

@Controller('workspaces')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @UseGuards(JwtGuard)
  @Post(':id/invite')
  @ApiCreatedResponse({
    description: 'invite user to workpsace',
  })
  async inviteUser(
    @Body(
      new ZodValidationPipe(
        z.object({
          email: z.string().email(),
        }),
      ),
    )
    dto: { email: string },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.invitesService.inviteUsers(id, [dto.email]);
  }

  @Post('/invite/check')
  @ApiCreatedResponse({
    description: 'check if invitation token is still valid',
  })
  async checkInvitation(
    @Body(
      new ZodValidationPipe(
        z.object({
          token: z.string(),
        }),
      ),
    )
    dto: {
      token: string;
    },
  ) {
    return {
      userStatus: (await this.invitesService.checkInvite(dto.token)).userStatus,
    };
  }

  @Post('/invite/callback')
  @ApiCreatedResponse({
    description: 'invite responsd',
  })
  async inviteCallback(
    @Body(new ZodValidationPipe(invitationCallbackReq))
    dto: InvitationCallbackReq,
  ) {
    return await this.invitesService.inviteCallback(dto);
  }
}
