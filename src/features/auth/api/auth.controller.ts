import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from '../application/auth.service';

import { AuthGuard } from 'src/core/infrastructure/guards/auth.guard';

import { UserCreateModel } from './models/input/create-user.input.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  public async loginUser() {}

  @Post('/password-recovery')
  public async passwordRecovery() {}

  @Post('/new-password')
  public async newPassword() {}

  @Post('/registration-confirmation')
  public async registrationConfirmation() {}

  @Post('/registration')
  public async registerUser(@Body() createModel: UserCreateModel) {
    const newUser = await this.authService.createUser(createModel);

    if (!newUser) {
      throw new HttpException(
        'Error while registering user',
        HttpStatus.BAD_REQUEST,
      );
    }
    return newUser;
  }

  @Post('/registration-email-resending')
  public async registrationEmailResending() {}

  @UseGuards(AuthGuard)
  @Get('/me')
  public async getMe() {
    return '1231';
  }
}
