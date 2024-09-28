import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from '../application/auth.service';

import { AuthGuard } from 'src/core/infrastructure/guards/auth.guard';

import { UserCreateModel } from './models/input/create-user.input.model';
import { CodeInputModel } from './models/input/code.input.model';
import { EmailResendingModel } from './models/input/email-resending.input.model';
import { NewPasswordInputModel } from './models/input/new-password.input.model';
import { BodyLoginModel } from './models/input/body-login.input.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  public async loginUser(@Body() bodyLoginEmail: BodyLoginModel) {
    const { loginOrEmail, password } = bodyLoginEmail;
    const loginUserRes = await this.authService.checkCredentials(
      loginOrEmail,
      password,
    );

    return loginUserRes;
  }

  @Post('/password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async passwordRecovery(@Body() emailModel: EmailResendingModel) {
    const { email } = emailModel;

    const emailResending =
      await this.authService.resendCodeForRecoveryPassword(email);
    return emailResending;
  }

  @Post('/new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async newPassword(@Body() newPasswordModel: NewPasswordInputModel) {
    const { newPassword, recoveryCode } = newPasswordModel;
    const newPasswordRes = await this.authService.changeNewPassword({
      newPassword,
      recoveryCode,
    });

    return newPasswordRes;
  }

  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async registrationConfirmation(@Body() code: CodeInputModel) {
    return await this.authService.confirmEmail(code);
  }

  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async registerUser(@Body() createModel: UserCreateModel) {
    await this.authService.createUser(createModel);
  }

  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async registrationEmailResending(
    @Body() emailResendingModel: EmailResendingModel,
  ) {
    return await this.authService.resendCode(emailResendingModel);
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  public async getMe(@Req() request: Request) {
    const user = request['user'];

    return await this.authService.getMeInfo(user.userId);
  }
}
