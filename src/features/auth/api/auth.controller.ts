import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';

import { AuthService } from '../application/auth.service';

import { AuthGuard } from 'src/core/guards/auth.guard';

import { GetUserInfoQuery } from '../application/use-cases/user-info.query.use-case';

import { UserCreateModel } from './models/input/create-user.input.model';
import { CodeInputModel } from './models/input/code.input.model';
import { EmailResendingModel } from './models/input/email-resending.input.model';
import { NewPasswordInputModel } from './models/input/new-password.input.model';
import { BodyLoginModel } from './models/input/body-login.input.model';

import { RequestWithUser } from '../../../base/types/request';

import { ResendCodeCommand } from '../application/use-cases/resend-code.use-case';
import { CreateUserCommand } from '../application/use-cases/create-user.use-case';
import { ConfirmEmailCommand } from '../application/use-cases/confirm-email.use-case';
import { NewPasswordCommand } from '../application/use-cases/new-password.use-case';
import { PasswordRecoveryCommand } from '../application/use-cases/password-recovery.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  public async loginUser(
    @Body() bodyLoginEmail: BodyLoginModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { loginOrEmail, password } = bodyLoginEmail;
    const { accessToken, refreshToken } =
      await this.authService.checkCredentials(loginOrEmail, password);

    res
      .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
      .header('Authorization', accessToken)
      .send({ accessToken });
  }

  @Post('/password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async passwordRecovery(@Body() emailModel: EmailResendingModel) {
    const { email } = emailModel;
    return this.commandBus.execute(new PasswordRecoveryCommand(email));
  }

  @Post('/new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async newPassword(@Body() newPasswordModel: NewPasswordInputModel) {
    return this.commandBus.execute(new NewPasswordCommand(newPasswordModel));
  }

  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async registrationConfirmation(@Body() codeBody: CodeInputModel) {
    return this.commandBus.execute(new ConfirmEmailCommand(codeBody.code));
  }

  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async registerUser(@Body() createModel: UserCreateModel) {
    return this.commandBus.execute(new CreateUserCommand(createModel));
  }

  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async registrationEmailResending(
    @Body() emailResendingModel: EmailResendingModel,
  ) {
    return this.commandBus.execute(new ResendCodeCommand(emailResendingModel));
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  public async getMe(@Req() request: RequestWithUser) {
    const user = request['user'];

    return this.queryBus.execute(new GetUserInfoQuery(user.userId));
  }
}
