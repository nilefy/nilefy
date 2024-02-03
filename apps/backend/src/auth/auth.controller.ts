import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInGoogleOAuthGuard, SignUpGoogleOAuthGuard } from './google.guard';
import { JwtGuard } from './jwt.guard';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import {
  signUpSchema,
  signInSchema,
  CreateUserDto,
  LoginUserDto,
} from '../dto/users.dto';
import { ExpressAuthedRequest, GoogleAuthedRequest } from './auth.types';
// import { EmailService } from 'src/email/email.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService, // private readOnly: EmailService,
  ) {}

  @UsePipes(new ZodValidationPipe(signUpSchema))
  @Post('signup')
  async signUp(@Body() userDto: CreateUserDto) {
    return await this.authService.signUp(userDto);
  }

  @UsePipes(new ZodValidationPipe(signInSchema))
  @Post('login')
  async signIn(@Body() userDto: LoginUserDto) {
    return await this.authService.signIn(userDto);
  }

  @UseGuards(SignInGoogleOAuthGuard)
  @Get('login/google')
  signInGoogleAuth() {}

  @UseGuards(SignUpGoogleOAuthGuard)
  @Get('signup/google')
  signUpGoogleAuth() {}

  @UseGuards(SignInGoogleOAuthGuard)
  @Get('login/google-redirect')
  async signInGoogleRedirect(@Req() req: GoogleAuthedRequest) {
    return await this.authService.signIn(req.user as LoginUserDto);
  }

  @UseGuards(SignUpGoogleOAuthGuard)
  @Get('signup/google-redirect')
  async signUpGoogleRedirect(@Req() req: GoogleAuthedRequest) {
    return await this.authService.signUp(req.user as CreateUserDto);
  }

  @Get('confirm/:token/:id')
  async confirm(@Req() req: { token: string; id: string }) {
    const { token, id } = req;
    return await this.authService.confirm(token, id);
  }

  @UseGuards(JwtGuard)
  @Get('main')
  main(@Req() req: ExpressAuthedRequest) {
    return req.user;
  }
}
