import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';

import { CodeInputModel } from '../../api/models/input/code.input.model';

import { UsersQueryRepository } from '../../../users/infra/users-query.repository';
import { UsersRepository } from '../../../users/infra/users.repository';

export class ConfirmEmailCommand {
  constructor(public readonly code: CodeInputModel['code']) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: ConfirmEmailCommand) {
    const user = await this.usersQueryRepository.findUserByConfirmationCode(
      command.code,
    );
    if (
      !user ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.confirmationCode !== command.code ||
      user.emailConfirmation.expirationDate < new Date()
    ) {
      throw new HttpException('code is wrong', HttpStatus.BAD_REQUEST);
    }
    const res = await this.usersRepository.updateConfirmation(user._id);

    if (!res) {
      throw new HttpException('oops', HttpStatus.BAD_REQUEST);
    }
  }
}
