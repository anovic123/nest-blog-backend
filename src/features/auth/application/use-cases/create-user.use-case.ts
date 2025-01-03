import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { HttpException, HttpStatus } from '@nestjs/common';

import { CryptoService } from '../../../../core/adapters/crypto-service';
import { AuthRepository } from '../../infra/auth-repository';
import { EmailsManager } from '../../../../core/adapters/email.manager';

import { User } from '../../../users/domain/users.schema';

import { UserOutputModel } from '../../api/models/output/user.output.model';

class UserInputModel {
  login: string;
  password: string;
  email: string;
}

export class CreateUserCommand {
  constructor(public readonly body: UserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly authRepository: AuthRepository,
    private readonly emailsManager: EmailsManager,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserOutputModel> {
    const { login, password, email } = command.body;

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
}
