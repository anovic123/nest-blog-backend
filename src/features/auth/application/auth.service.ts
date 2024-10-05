import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

import { CodeInputModel } from '../api/models/input/code.input.model';
import { UserOutputModel } from '../api/models/output/user.output.model';
import { EmailResendingModel } from '../api/models/input/email-resending.input.model';
import { NewPasswordInputModel } from '../api/models/input/new-password.input.model';

import { UsersQueryRepository } from 'src/features/users/infra/users-query.repository';
import { UsersRepository } from 'src/features/users/infra/users.repository';

import { AuthRepository } from '../infra/auth-repository';

import { CryptoService } from 'src/core/application/crypto-service';

import { EmailsManager } from 'src/core/managers/email.manager';

import { User } from 'src/features/users/domain/users.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly authRepository: AuthRepository,
    private readonly emailsManager: EmailsManager,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  public async createUser(body: {
    login: string;
    password: string;
    email: string;
  }): Promise<UserOutputModel> {
    const { email, login, password } = body;

    const passwordHash = await this.cryptoService.generateHash(password);

    const user: User = {
      _id: new Types.ObjectId(),
      accountData: {
        login,
        email,
        passwordHash,
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
        isConfirmed: false,
      },
      createdAt: new Date(),
    };
    const createdResult = await this.authRepository.createUser(user);

    if (!createdResult) {
      throw new HttpException(
        'Error while registering user',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.emailsManager.sendConfirmationMessage({
      email: user.accountData.email,
      confirmationCode: user.emailConfirmation.confirmationCode,
    });

    return createdResult;
  }

  public async confirmEmail(confirmationCode: CodeInputModel): Promise<void> {
    const user = await this.usersQueryRepository.findUserByConfirmationCode(
      confirmationCode.code,
    );
    if (
      !user ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.confirmationCode !== confirmationCode.code ||
      user.emailConfirmation.expirationDate < new Date()
    ) {
      throw new HttpException('code is wrong', HttpStatus.BAD_REQUEST);
    }
    const res = await this.usersRepository.updateConfirmation(user._id);

    if (!res) {
      throw new HttpException('oops', HttpStatus.BAD_REQUEST);
    }
  }

  public async resendCode(emailResendingModel: EmailResendingModel) {
    const { email } = emailResendingModel;

    const user = await this.usersQueryRepository.findUserByLoginOrEmail(email);

    if (!user) {
      throw new HttpException('email is not existed', HttpStatus.BAD_REQUEST);
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new HttpException('email is confirmed', HttpStatus.BAD_REQUEST);
    }

    const newCode = uuidv4();
    await this.usersRepository.updateUserConfirmationCode(
      user._id.toString(),
      newCode,
    );
    await this.emailsManager.sendConfirmationMessage({
      email: user.accountData.email,
      confirmationCode: newCode,
    });
  }

  public async changeNewPassword({
    newPassword,
    recoveryCode,
  }: NewPasswordInputModel): Promise<boolean> {
    const user =
      await this.usersQueryRepository.findUserByConfirmationCode(recoveryCode);

    if (!user) {
      throw new HttpException('User is not found', HttpStatus.BAD_REQUEST);
    }

    if (
      user.emailConfirmation.confirmationCode !== recoveryCode ||
      user.emailConfirmation.expirationDate < new Date()
    ) {
      throw new HttpException('Wrong code', HttpStatus.BAD_REQUEST);
    }

    const newPasswordHash = await this.cryptoService.generateHash(newPassword);

    const newPasswordHashRes =
      await this.usersRepository.updateUserPasswordHash(
        user._id,
        newPasswordHash,
      );

    if (!newPasswordHashRes) {
      throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
    }
    return true;
  }

  public async resendCodeForRecoveryPassword(email: string): Promise<boolean> {
    const newCode = uuidv4();

    await this.emailsManager.sendRecoveryMessage({
      email,
      confirmationCode: newCode,
    });

    const user = await this.usersQueryRepository.findUserByLoginOrEmail(email);

    if (!user) return true;

    await this.usersRepository.updateUserConfirmationCode(
      user._id.toString(),
      newCode,
    );
    return true;
  }

  public async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user =
      await this.usersQueryRepository.findUserByLoginOrEmail(loginOrEmail);

    if (!user) {
      throw new HttpException('User is not founded', HttpStatus.UNAUTHORIZED);
    }

    const isHashedEquals = await this.cryptoService.compareHash(
      password,
      user.accountData.passwordHash,
    );

    if (!isHashedEquals) {
      throw new HttpException('Password is wrong', HttpStatus.UNAUTHORIZED);
    }

    const userId = user._id.toString();

    const accessToken = this.jwtService.sign({ userId });

    const refreshToken = this.jwtService.sign({
      userId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  public async getMeInfo(id: User['_id']): Promise<{
    email: string;
    login: string;
    userId: string;
  }> {
    const user = await this.usersRepository.findUserById(id);

    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const userOutput = {
      email: user.accountData.email,
      login: user.accountData.login,
      userId: user._id.toString(),
    };

    return userOutput;
  }
}
