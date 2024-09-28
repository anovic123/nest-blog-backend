import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
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
  public async loginUser(@Body() bodyLoginEmail: BodyLoginModel) {
    const { loginOrEmail, password } = bodyLoginEmail;
    const loginUserRes = await this.authService.checkCredentials(
      loginOrEmail,
      password,
    );

    return loginUserRes;
  }

  @Post('/password-recovery')
  public async passwordRecovery(@Body() emailModel: EmailResendingModel) {
    const { email } = emailModel;

    const emailResending =
      await this.authService.resendCodeForRecoveryPassword(email);
    return emailResending;
  }

  @Post('/new-password')
  public async newPassword(@Body() newPasswordModel: NewPasswordInputModel) {
    const { newPassword, recoveryCode } = newPasswordModel;
    const newPasswordRes = await this.authService.changeNewPassword({
      newPassword,
      recoveryCode,
    });

    return newPasswordRes;
  }

  @Post('/registration-confirmation')
  public async registrationConfirmation(@Body() code: CodeInputModel) {
    const result = await this.authService.confirmEmail(code);
    return result;
  }

  @Post('/registration')
  @HttpCode(204)
  public async registerUser(@Body() createModel: UserCreateModel) {
    await this.authService.createUser(createModel);
  }

  @Post('/registration-email-resending')
  public async registrationEmailResending(
    @Body() emailResendingModel: EmailResendingModel,
  ) {
    const emailResending =
      await this.authService.resendCode(emailResendingModel);
    return emailResending;
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  public async getMe(@Req() request: Request) {
    const user = request['user'];
    return user;
  }
}
