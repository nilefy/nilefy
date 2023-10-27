import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //! why is using the pipe always result in an exception?
  // @UsePipes(new ZodValidationPipe(updateUserSchema))
  // data: UpdateUserDto
  @Put(':id')
  async updateProfile(
    @Param('id') id: number,
    @Body() data: { username: string; password: string },
  ) {
    // Call the service method to update the profile
    // Return the updated user or an error response
    console.log('object');
    let updatedUser;
    if (data.username) {
      updatedUser = await this.usersService.updateUsername(id, data.username);
    }
    if (data.password) {
      updatedUser = await this.usersService.updatePassword(id, data.password);
    }
    if (!data.password && !data.username) {
      console.log('object');
      return new BadRequestException(
        `Please provide either "username"${data.username} or "password"${data.password}`,
      );
    }

    return updatedUser;
  }
}
